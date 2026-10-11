import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const ref = (m, extra = {}) => ({ type: Schema.Types.ObjectId, ref: m, index: true, ...extra });
const T = { timestamps: true };

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'canteen', 'student'], required: true },
  studentId: { type: String, trim: true },
  phone: { type: String, trim: true },
  accountStatus: { type: String, enum: ['active', 'suspended'], default: 'active' },
  tokenVersion: { type: Number, default: 0, select: false }, // bump to revoke all JWTs
}, T));

export const Canteen = model('Canteen', new Schema({
  name: { type: String, required: true, trim: true },
  description: String,
  ownerId: ref('User', { required: true, unique: true }),
  location: String,
  openingHours: { open: { type: String, default: '08:00' }, close: { type: String, default: '20:00' } },
  contact: { phone: String, email: String },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  rejectionReason: String,
  operationalStatus: { type: String, enum: ['open', 'closed', 'suspended'], default: 'open' },
  acceptingOrders: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
}, T));

const menuSchema = new Schema({
  canteenId: ref('Canteen', { required: true }),
  name: { type: String, required: true, trim: true },
  description: String,
  imageUrl: String,
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  foodType: { type: String, enum: ['veg', 'non-veg'], required: true },
  preparationTime: { type: Number, default: 10, min: 1 },
  availableQuantity: { type: Number, default: null, min: 0 }, // null = unlimited
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  averageRating: { type: Number, default: 0 },
}, T);
menuSchema.index({ name: 'text', description: 'text' });
export const MenuItem = model('MenuItem', menuSchema);

export const ORDER_STATUSES = ['placed', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
export const Order = model('Order', new Schema({
  orderNumber: { type: String, required: true, unique: true },
  studentId: ref('User', { required: true }),
  canteenId: ref('Canteen', { required: true }),
  items: [{ menuItemId: Schema.Types.ObjectId, name: String, price: Number, quantity: Number, _id: false }],
  subtotal: Number, fees: { type: Number, default: 0 }, discount: { type: Number, default: 0 },
  totalAmount: Number,
  paymentMethod: { type: String, enum: ['cash', 'pay_at_counter'], default: 'pay_at_counter' },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  orderStatus: { type: String, enum: ORDER_STATUSES, default: 'placed', index: true },
  cancellationReason: String,
  idempotencyKey: String,
}, T).index({ studentId: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }));

export const Review = model('Review', new Schema({
  studentId: ref('User', { required: true }), canteenId: ref('Canteen', { required: true }),
  menuItemId: Schema.Types.ObjectId, orderId: ref('Order', { required: true, unique: true }),
  rating: { type: Number, min: 1, max: 5, required: true }, comment: { type: String, maxlength: 500 },
}, T));

export const Notification = model('Notification', new Schema({
  recipientId: ref('User', { required: true }), title: String, message: String,
  relatedOrderId: Schema.Types.ObjectId, isRead: { type: Boolean, default: false },
}, T));

export const AuditLog = model('AuditLog', new Schema({
  actorId: ref('User', { required: true }), action: { type: String, required: true },
  targetType: String, targetId: Schema.Types.ObjectId, details: Schema.Types.Mixed,
}, T));
