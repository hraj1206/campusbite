import jwt from 'jsonwebtoken';
import { User, Canteen } from './models.js';

export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export const signToken = (user) =>
  jwt.sign({ sub: user.id, v: user.tokenVersion ?? 0 }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

// Role always comes from the DB record, never from the token payload or client.
export const authenticate = wrap(async (req, _res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw new HttpError(401, 'Authentication required');
  let payload;
  try { payload = jwt.verify(h.slice(7), process.env.JWT_SECRET); } catch { throw new HttpError(401, 'Invalid or expired token'); }
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || user.tokenVersion !== payload.v) throw new HttpError(401, 'Session expired');
  if (user.accountStatus !== 'active') throw new HttpError(403, 'Account suspended');
  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, _res, next) =>
  roles.includes(req.user.role) ? next() : next(new HttpError(403, 'Forbidden'));

// Resolves the canteen owned by the logged-in owner; all owner queries scope by this id.
export const ownCanteen = wrap(async (req, _res, next) => {
  req.canteen = await Canteen.findOne({ ownerId: req.user._id });
  if (!req.canteen) throw new HttpError(404, 'No canteen linked to this account');
  next();
});

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500, message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.code === 11000) { status = 409; message = 'Duplicate value'; }
  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message: status === 500 ? 'Server error' : message });
};

export const pageOpts = (q) => {
  const page = Math.max(1, parseInt(q.page) || 1), limit = Math.min(50, parseInt(q.limit) || 20);
  return { skip: (page - 1) * limit, limit, page };
};
