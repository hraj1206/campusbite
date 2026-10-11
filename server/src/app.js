import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { User, Canteen, MenuItem, Order, Review, Notification, AuditLog } from './models.js';
import { HttpError, wrap, ok, signToken, authenticate, requireRole, ownCanteen, errorHandler, pageOpts } from './middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const events = { emit: () => {} }; // replaced by socket layer in server.js

// Valid order-status transitions, enforced on the backend only.
export const TRANSITIONS = { placed: ['accepted', 'cancelled'], accepted: ['preparing', 'cancelled'], preparing: ['ready'], ready: ['completed'], completed: [], cancelled: [] };

const notify = (recipientId, title, message, relatedOrderId) => Notification.create({ recipientId, title, message, relatedOrderId });
const audit = (req, action, targetType, targetId, details) => AuditLog.create({ actorId: req.user._id, action, targetType, targetId, details });
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const strongPw = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

async function restoreStock(order) {
  for (const i of order.items) await MenuItem.updateOne({ _id: i.menuItemId, availableQuantity: { $ne: null } }, { $inc: { availableQuantity: i.quantity } });
}

export function createApp() {
  const app = express();
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(','), credentials: true }));
  app.use(express.static(path.join(__dirname, '../public')));
  app.use(express.json({ limit: '100kb' }));
  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
  const r = express.Router();

  /* ---------- AUTH ---------- */
  r.post('/auth/register', authLimiter, wrap(async (req, res) => {
    const { role, name, email, password, studentId, phone, canteen } = req.body;
    if (!['student', 'canteen'].includes(role)) throw new HttpError(403, 'Public registration is only for students and canteen owners');
    if (!str(name) || !/^\S+@\S+\.\S+$/.test(str(email))) throw new HttpError(400, 'Valid name and email required');
    if (!strongPw(password)) throw new HttpError(400, 'Password must be 8+ chars with letters and numbers');
    if (role === 'student' && !str(studentId)) throw new HttpError(400, 'Student ID required');
    if (role === 'canteen' && !str(canteen?.name)) throw new HttpError(400, 'Canteen name required');
    const user = await User.create({ name: str(name), email: str(email), role, studentId: str(studentId, 30), phone: str(phone, 20), passwordHash: await bcrypt.hash(password, 12) });
    if (role === 'canteen') await Canteen.create({ name: str(canteen.name), description: str(canteen.description, 500), location: str(canteen.location), ownerId: user._id });
    ok(res, { token: role === 'student' ? signToken(user) : null, user: { id: user.id, name: user.name, role }, message: role === 'canteen' ? 'Application submitted for admin approval' : undefined }, 201);
  }));

  // `portal` must match the stored role: the admin login page cannot log in a student, etc.
  r.post('/auth/login', authLimiter, wrap(async (req, res) => {
    const { email, password, portal } = req.body;
    const user = await User.findOne({ email: str(email).toLowerCase() }).select('+passwordHash +tokenVersion');
    const valid = user && typeof password === 'string' && (await bcrypt.compare(password, user.passwordHash));
    if (!valid) throw new HttpError(401, 'Invalid email or password');
    if (portal && portal !== user.role) throw new HttpError(403, `This account cannot sign in through the ${portal} portal`);
    if (user.accountStatus !== 'active') throw new HttpError(403, 'Account suspended');
    ok(res, { token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });
  }));
  r.post('/auth/logout', authenticate, wrap(async (req, res) => { await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } }); ok(res, { loggedOut: true }); }));
  r.get('/auth/me', authenticate, (req, res) => ok(res, { id: req.user.id, name: req.user.name, email: req.user.email, role: req.user.role, studentId: req.user.studentId, phone: req.user.phone }));

  /* ---------- PUBLIC / STUDENT BROWSING ---------- */
  const liveCanteen = { approvalStatus: 'approved', operationalStatus: { $ne: 'suspended' } };
  r.get('/canteens', wrap(async (_q, res) => ok(res, await Canteen.find(liveCanteen).select('-ownerId').lean())));
  r.get('/canteens/:id', wrap(async (req, res) => {
    const c = await Canteen.findOne({ _id: req.params.id, ...liveCanteen }).select('-ownerId').lean();
    if (!c) throw new HttpError(404, 'Canteen not found'); ok(res, c);
  }));
  const menuFilter = async (q, base = {}) => {
    const f = { isActive: true, ...base };
    if (q.search) f.$text = { $search: str(q.search, 60) };
    if (q.category) f.category = str(q.category);
    if (['veg', 'non-veg'].includes(q.foodType)) f.foodType = q.foodType;
    if (q.available === 'true') f.isAvailable = true;
    if (q.minPrice || q.maxPrice) f.price = { ...(q.minPrice && { $gte: +q.minPrice }), ...(q.maxPrice && { $lte: +q.maxPrice }) };
    if (q.minRating) f.averageRating = { $gte: +q.minRating };
    return f;
  };
  const sorts = { price: { price: 1 }, '-price': { price: -1 }, rating: { averageRating: -1 }, popular: { averageRating: -1, createdAt: -1 } };
  r.get('/canteens/:id/menu', wrap(async (req, res) => {
    if (!(await Canteen.exists({ _id: req.params.id, ...liveCanteen }))) throw new HttpError(404, 'Canteen not found');
    const { skip, limit } = pageOpts(req.query);
    ok(res, await MenuItem.find(await menuFilter(req.query, { canteenId: req.params.id })).sort(sorts[req.query.sort] || {}).skip(skip).limit(limit).lean());
  }));
  r.get('/menu-items', wrap(async (req, res) => {
    const ids = await Canteen.find(liveCanteen).distinct('_id'); const { skip, limit } = pageOpts(req.query);
    ok(res, await MenuItem.find(await menuFilter(req.query, { canteenId: { $in: ids } })).sort(sorts[req.query.sort] || {}).skip(skip).limit(limit).lean());
  }));

  /* ---------- STUDENT ORDERS ---------- */
  const student = [authenticate, requireRole('student')];
  r.post('/orders', ...student, wrap(async (req, res) => {
    const { canteenId, items, paymentMethod = 'pay_at_counter', idempotencyKey } = req.body;
    if (!Array.isArray(items) || !items.length || items.length > 30) throw new HttpError(400, 'Cart is empty or too large');
    if (!['cash', 'pay_at_counter'].includes(paymentMethod)) throw new HttpError(400, 'Unsupported payment method');
    if (idempotencyKey) { const dup = await Order.findOne({ studentId: req.user._id, idempotencyKey: str(idempotencyKey, 80) }); if (dup) return ok(res, dup); }
    const canteen = await Canteen.findOne({ _id: canteenId, ...liveCanteen });
    if (!canteen || canteen.operationalStatus !== 'open' || !canteen.acceptingOrders) throw new HttpError(409, 'Canteen is not accepting orders');

    const taken = [], lines = []; // taken = stock reserved so far, for rollback
    try {
      for (const it of items) {
        const qty = Number(it.quantity);
        if (!Number.isInteger(qty) || qty < 1 || qty > 20) throw new HttpError(400, 'Invalid quantity');
        const base = { _id: it.menuItemId, canteenId, isActive: true, isAvailable: true };
        // Atomic reservation: decrement only if enough stock; unlimited items (null) just need to exist.
        let doc = await MenuItem.findOneAndUpdate({ ...base, availableQuantity: { $gte: qty } }, { $inc: { availableQuantity: -qty } }, { new: true });
        if (doc) taken.push({ id: doc._id, qty });
        else doc = await MenuItem.findOne({ ...base, availableQuantity: null });
        if (!doc) throw new HttpError(409, 'An item is unavailable or out of stock');
        lines.push({ menuItemId: doc._id, name: doc.name, price: doc.price, quantity: qty }); // price from DB, never from client
      }
      const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
      const orderNumber = `CB-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
      const order = await Order.create({ orderNumber, studentId: req.user._id, canteenId, items: lines, subtotal, totalAmount: subtotal, paymentMethod, idempotencyKey: idempotencyKey && str(idempotencyKey, 80) });
      await notify(canteen.ownerId, 'New order', `Order ${orderNumber} received`, order._id);
      events.emit(`canteen:${canteen.id}`, 'order:new', order);
      ok(res, order, 201);
    } catch (e) { for (const t of taken) await MenuItem.updateOne({ _id: t.id }, { $inc: { availableQuantity: t.qty } }); throw e; }
  }));
  r.get('/orders/my-orders', ...student, wrap(async (req, res) => {
    const { skip, limit } = pageOpts(req.query);
    ok(res, await Order.find({ studentId: req.user._id }).sort('-createdAt').skip(skip).limit(limit).populate('canteenId', 'name').lean());
  }));
  r.get('/orders/:id', ...student, wrap(async (req, res) => {
    const o = await Order.findOne({ _id: req.params.id, studentId: req.user._id }).lean(); // ownership check
    if (!o) throw new HttpError(404, 'Order not found'); ok(res, o);
  }));
  r.patch('/orders/:id/cancel', ...student, wrap(async (req, res) => {
    const o = await Order.findOneAndUpdate({ _id: req.params.id, studentId: req.user._id, orderStatus: 'placed' }, { orderStatus: 'cancelled', cancellationReason: str(req.body.reason) || 'Cancelled by student' }, { new: true });
    if (!o) throw new HttpError(409, 'Order can only be cancelled while still in "placed" status');
    await restoreStock(o);
    const c = await Canteen.findById(o.canteenId); events.emit(`canteen:${c.id}`, 'order:update', o);
    await notify(c.ownerId, 'Order cancelled', `Order ${o.orderNumber} was cancelled by the student`, o._id);
    ok(res, o);
  }));
  r.post('/reviews', ...student, wrap(async (req, res) => {
    const { orderId, rating, comment } = req.body;
    const o = await Order.findOne({ _id: orderId, studentId: req.user._id, orderStatus: 'completed' });
    if (!o) throw new HttpError(403, 'You can only review your own completed orders');
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, 'Rating must be 1-5');
    const review = await Review.create({ studentId: req.user._id, canteenId: o.canteenId, orderId: o._id, rating, comment: str(comment, 500) });
    const [agg] = await Review.aggregate([{ $match: { canteenId: o.canteenId } }, { $group: { _id: null, avg: { $avg: '$rating' } } }]);
    await Canteen.updateOne({ _id: o.canteenId }, { averageRating: +agg.avg.toFixed(2) });
    ok(res, review, 201);
  }));
  r.get('/notifications', authenticate, wrap(async (req, res) => ok(res, await Notification.find({ recipientId: req.user._id }).sort('-createdAt').limit(50).lean())));
  r.patch('/notifications/:id/read', authenticate, wrap(async (req, res) => { await Notification.updateOne({ _id: req.params.id, recipientId: req.user._id }, { isRead: true }); ok(res, { read: true }); }));

  /* ---------- CANTEEN OWNER (every query scoped to req.canteen) ---------- */
  const owner = [authenticate, requireRole('canteen'), ownCanteen];
  const needApproved = (req, _res, next) => (req.canteen.approvalStatus === 'approved' ? next() : next(new HttpError(403, 'Canteen is not approved yet')));
  r.get('/canteen/dashboard', ...owner, wrap(async (req, res) => {
    const day = new Date(); day.setHours(0, 0, 0, 0);
    const base = { canteenId: req.canteen._id };
    const today = await Order.find({ ...base, createdAt: { $gte: day } }).lean();
    const sales = today.filter((o) => o.orderStatus === 'completed').reduce((s, o) => s + o.totalAmount, 0); // completed only
    const top = await Order.aggregate([{ $match: { ...base, orderStatus: 'completed' } }, { $unwind: '$items' }, { $group: { _id: '$items.name', qty: { $sum: '$items.quantity' } } }, { $sort: { qty: -1 } }, { $limit: 5 }]);
    ok(res, { canteen: req.canteen, todaysOrders: today.length, todaysSales: sales, pending: today.filter((o) => o.orderStatus === 'placed').length, preparing: today.filter((o) => o.orderStatus === 'preparing').length, completed: today.filter((o) => o.orderStatus === 'completed').length, topDishes: top });
  }));
  r.patch('/canteen/settings', ...owner, wrap(async (req, res) => {
    const allowed = ['name', 'description', 'openingHours', 'contact', 'acceptingOrders', 'operationalStatus'];
    for (const k of allowed) if (req.body[k] !== undefined) req.canteen[k] = req.body[k];
    if (req.canteen.operationalStatus === 'suspended') throw new HttpError(403, 'Only admins can suspend a canteen');
    ok(res, await req.canteen.save());
  }));
  r.get('/canteen/orders', ...owner, wrap(async (req, res) => {
    const f = { canteenId: req.canteen._id }; if (req.query.status) f.orderStatus = req.query.status;
    const { skip, limit } = pageOpts(req.query);
    ok(res, await Order.find(f).sort('-createdAt').skip(skip).limit(limit).populate('studentId', 'name phone studentId').lean());
  }));
  r.patch('/canteen/orders/:id/status', ...owner, needApproved, wrap(async (req, res) => {
    const next = req.body.status;
    const o = await Order.findOne({ _id: req.params.id, canteenId: req.canteen._id });
    if (!o) throw new HttpError(404, 'Order not found');
    if (!TRANSITIONS[o.orderStatus]?.includes(next)) throw new HttpError(409, `Cannot move order from ${o.orderStatus} to ${next}`);
    if (next === 'cancelled') { if (!str(req.body.reason)) throw new HttpError(400, 'Cancellation reason required'); o.cancellationReason = str(req.body.reason); }
    // compare-and-set so two simultaneous updates can't both win
    const upd = await Order.findOneAndUpdate({ _id: o._id, orderStatus: o.orderStatus }, { orderStatus: next, cancellationReason: o.cancellationReason, ...(next === 'completed' && { paymentStatus: 'paid' }) }, { new: true });
    if (!upd) throw new HttpError(409, 'Order was updated by someone else, refresh');
    if (next === 'cancelled') await restoreStock(upd);
    await notify(upd.studentId, `Order ${next}`, `Your order ${upd.orderNumber} is now ${next}`, upd._id);
    events.emit(`student:${upd.studentId}`, 'order:update', upd);
    ok(res, upd);
  }));
  r.get('/canteen/menu', ...owner, wrap(async (req, res) => ok(res, await MenuItem.find({ canteenId: req.canteen._id, isActive: true }).lean())));
  const menuFields = ['name', 'description', 'imageUrl', 'category', 'price', 'foodType', 'preparationTime', 'availableQuantity', 'isAvailable'];
  const pick = (b) => Object.fromEntries(menuFields.filter((k) => b[k] !== undefined).map((k) => [k, b[k]]));
  r.post('/canteen/menu', ...owner, needApproved, wrap(async (req, res) => ok(res, await MenuItem.create({ ...pick(req.body), canteenId: req.canteen._id }), 201)));
  r.patch('/canteen/menu/:id', ...owner, wrap(async (req, res) => {
    const item = await MenuItem.findOneAndUpdate({ _id: req.params.id, canteenId: req.canteen._id }, pick(req.body), { new: true, runValidators: true });
    if (!item) throw new HttpError(404, 'Item not found'); ok(res, item);
  }));
  r.delete('/canteen/menu/:id', ...owner, wrap(async (req, res) => {
    const item = await MenuItem.findOneAndUpdate({ _id: req.params.id, canteenId: req.canteen._id }, { isActive: false, isAvailable: false });
    if (!item) throw new HttpError(404, 'Item not found'); ok(res, { deactivated: true });
  }));
  r.get('/canteen/reviews', ...owner, wrap(async (req, res) => {
    const { skip, limit } = pageOpts(req.query);
    ok(res, await Review.find({ canteenId: req.canteen._id }).sort('-createdAt').skip(skip).limit(limit).populate('studentId', 'name studentId').lean());
  }));
  r.get('/canteen/analytics', ...owner, wrap(async (req, res) => {
    const base = { canteenId: req.canteen._id };
    const completed = await Order.find({ ...base, orderStatus: 'completed' }).lean();
    const cancelled = await Order.find({ ...base, orderStatus: 'cancelled' }).lean();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const nextD = new Date(d); nextD.setDate(d.getDate() + 1);
      const dayOrders = completed.filter((o) => new Date(o.createdAt) >= d && new Date(o.createdAt) < nextD);
      const sales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      days.push({ date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), sales, count: dayOrders.length });
    }
    ok(res, {
      totalRevenue: completed.reduce((s, o) => s + o.totalAmount, 0),
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      dailyBreakdown: days
    });
  }));

  /* ---------- ADMIN ---------- */
  const admin = [authenticate, requireRole('admin')];
  r.get('/admin/dashboard', ...admin, wrap(async (_q, res) => {
    const [students, canteens, pending, orders, byStatus] = await Promise.all([
      User.countDocuments({ role: 'student' }), Canteen.countDocuments({ approvalStatus: 'approved' }), Canteen.countDocuments({ approvalStatus: 'pending' }),
      Order.countDocuments(), Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 }, value: { $sum: '$totalAmount' } } }])]);
    const s = Object.fromEntries(byStatus.map((x) => [x._id, x]));
    ok(res, { students, canteens, pendingApprovals: pending, totalOrders: orders,
      grossOrderValue: byStatus.reduce((a, x) => a + x.value, 0), completedSales: s.completed?.value || 0, cancelledOrders: s.cancelled?.count || 0, platformRevenue: 0 /* no commission configured */ });
  }));
  r.get('/admin/users', ...admin, wrap(async (req, res) => {
    const f = {}; if (req.query.role) f.role = req.query.role;
    if (req.query.search) f.$or = ['name', 'email'].map((k) => ({ [k]: new RegExp(str(req.query.search, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }));
    const { skip, limit } = pageOpts(req.query);
    ok(res, await User.find(f).sort('-createdAt').skip(skip).limit(limit).lean());
  }));
  r.patch('/admin/users/:id/status', ...admin, wrap(async (req, res) => {
    const status = req.body.accountStatus;
    if (!['active', 'suspended'].includes(status)) throw new HttpError(400, 'Invalid status');
    const target = await User.findById(req.params.id); if (!target) throw new HttpError(404, 'User not found');
    if (status === 'suspended' && target.role === 'admin') {
      if (target.id === req.user.id) throw new HttpError(409, 'You cannot suspend yourself');
      if ((await User.countDocuments({ role: 'admin', accountStatus: 'active' })) <= 1) throw new HttpError(409, 'Cannot suspend the last active admin');
    }
    target.accountStatus = status; target.tokenVersion = (target.tokenVersion || 0) + 1; await target.save(); // kick active sessions
    await audit(req, 'user.status', 'User', target._id, { status }); ok(res, { id: target.id, accountStatus: status });
  }));
  r.get('/admin/canteens', ...admin, wrap(async (req, res) => {
    const f = req.query.approvalStatus ? { approvalStatus: req.query.approvalStatus } : {};
    ok(res, await Canteen.find(f).populate('ownerId', 'name email phone').lean());
  }));
  r.patch('/admin/canteens/:id/approval', ...admin, wrap(async (req, res) => {
    const { approvalStatus, reason, operationalStatus } = req.body; const c = await Canteen.findById(req.params.id);
    if (!c) throw new HttpError(404, 'Canteen not found');
    if (approvalStatus) {
      if (!['approved', 'rejected'].includes(approvalStatus)) throw new HttpError(400, 'Invalid approval status');
      if (approvalStatus === 'rejected' && !str(reason)) throw new HttpError(400, 'Rejection reason required');
      c.approvalStatus = approvalStatus; c.rejectionReason = approvalStatus === 'rejected' ? str(reason) : undefined;
    }
    if (operationalStatus) { if (!['open', 'closed', 'suspended'].includes(operationalStatus)) throw new HttpError(400, 'Invalid status'); c.operationalStatus = operationalStatus; }
    await c.save(); await audit(req, 'canteen.review', 'Canteen', c._id, { approvalStatus, operationalStatus, reason });
    await notify(c.ownerId, 'Canteen update', `Your canteen is now ${c.approvalStatus}${c.rejectionReason ? `: ${c.rejectionReason}` : ''}`); ok(res, c);
  }));
  r.get('/admin/orders', ...admin, wrap(async (req, res) => {
    const f = req.query.status ? { orderStatus: req.query.status } : {}; const { skip, limit } = pageOpts(req.query);
    ok(res, await Order.find(f).sort('-createdAt').skip(skip).limit(limit).lean());
  }));
  r.get('/admin/audit-logs', ...admin, wrap(async (req, res) => { const { skip, limit } = pageOpts(req.query); ok(res, await AuditLog.find().sort('-createdAt').skip(skip).limit(limit).populate('actorId', 'name email').lean()); }));
  r.get('/admin/reviews', ...admin, wrap(async (req, res) => {
    const { skip, limit } = pageOpts(req.query);
    ok(res, await Review.find().sort('-createdAt').skip(skip).limit(limit).populate('studentId', 'name studentId').populate('canteenId', 'name').lean());
  }));
  r.get('/admin/analytics', ...admin, wrap(async (_req, res) => {
    const orders = await Order.find().lean();
    const completed = orders.filter((o) => o.orderStatus === 'completed');
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const nextD = new Date(d); nextD.setDate(d.getDate() + 1);
      const dayOrders = completed.filter((o) => new Date(o.createdAt) >= d && new Date(o.createdAt) < nextD);
      const sales = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      days.push({ date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), sales, count: dayOrders.length });
    }
    ok(res, { dailyTrend: days });
  }));

  app.use('/api', r);
  app.use('/api', (_q, _r, next) => next(new HttpError(404, 'Route not found')));
  app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
  app.use(errorHandler);
  return app;
}
