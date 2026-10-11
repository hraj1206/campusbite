// DEV ONLY. Usage: npm run seed  |  npm run seed:reset (wipes data first)
import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { User, Canteen, MenuItem, Order } from '../src/models.js';

if (process.env.NODE_ENV === 'production') { console.error('Refusing to seed in production'); process.exit(1); }
await mongoose.connect(process.env.MONGO_URI);
if (process.argv.includes('--reset')) await Promise.all([User, Canteen, MenuItem, Order].map((m) => m.deleteMany({})));

// Passwords are generated per run (or taken from env) and printed once. Nothing usable is hardcoded.
const adminPw = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url');
const demoPw = crypto.randomBytes(9).toString('base64url');
const hash = (p) => bcrypt.hash(p, 12);
const mk = async (name, email, role, pw, extra = {}) => User.findOneAndUpdate({ email }, { name, email, role, passwordHash: await hash(pw), ...extra }, { upsert: true, new: true });

await mk('Platform Admin', process.env.SEED_ADMIN_EMAIL || 'admin@campusbite.local', 'admin', adminPw);
const students = await Promise.all([1, 2, 3].map((i) => mk(`Student ${i}`, `student${i}@campusbite.local`, 'student', demoPw, { studentId: `2026${i}001`, phone: `90000000${i}0` })));

const defs = [
  ['Main Canteen', 'approved', [['Masala Dosa', 'Breakfast', 60, 'veg'], ['Idli Sambar', 'Breakfast', 40, 'veg'], ['Veg Thali', 'Lunch', 90, 'veg'], ['Chicken Biryani', 'Lunch', 140, 'non-veg'], ['Samosa', 'Snacks', 15, 'veg']]],
  ['Food Court', 'approved', [['Paneer Wrap', 'Snacks', 80, 'veg'], ['Chicken Burger', 'Snacks', 110, 'non-veg'], ['Cold Coffee', 'Beverages', 70, 'veg'], ['Masala Chai', 'Beverages', 20, 'veg'], ['Brownie', 'Desserts', 60, 'veg']]],
  ['Night Cafe', 'approved', [['Maggi', 'Snacks', 50, 'veg'], ['Egg Roll', 'Snacks', 70, 'non-veg'], ['Fresh Lime Soda', 'Beverages', 35, 'veg'], ['Gulab Jamun', 'Desserts', 40, 'veg'], ['Aloo Paratha', 'Breakfast', 55, 'veg']]],
  ['Green Bowl (pending)', 'pending', [['Salad Bowl', 'Lunch', 100, 'veg'], ['Fruit Smoothie', 'Beverages', 80, 'veg'], ['Oats Parfait', 'Breakfast', 90, 'veg'], ['Grilled Sandwich', 'Snacks', 75, 'veg'], ['Fruit Cup', 'Desserts', 50, 'veg']]],
];
let n = 0, firstItems;
for (const [name, approvalStatus, items] of defs) {
  const o = await mk(`${name} Owner`, `owner${++n}@campusbite.local`, 'canteen', demoPw);
  const c = await Canteen.findOneAndUpdate({ ownerId: o._id }, { name, ownerId: o._id, approvalStatus, location: 'Campus Block ' + n, description: `${name} serving fresh food` }, { upsert: true, new: true });
  const docs = await Promise.all(items.map(([iname, category, price, foodType]) => MenuItem.findOneAndUpdate({ canteenId: c._id, name: iname }, { canteenId: c._id, name: iname, category, price, foodType, description: `${iname} made fresh`, availableQuantity: 50, averageRating: 3.5 + Math.random() * 1.5 }, { upsert: true, new: true })));
  if (n === 1) firstItems = { c, docs };
}
const { c, docs } = firstItems;
for (const [i, status] of ['placed', 'accepted', 'preparing', 'completed'].entries()) {
  const it = docs[i]; if (await Order.exists({ orderNumber: `CB-DEMO${i}` })) continue;
  await Order.create({ orderNumber: `CB-DEMO${i}`, studentId: students[i % 3]._id, canteenId: c._id, items: [{ menuItemId: it._id, name: it.name, price: it.price, quantity: 2 }], subtotal: it.price * 2, totalAmount: it.price * 2, orderStatus: status });
}
console.log('\nSeed complete (dev only).\n  Admin:    ', process.env.SEED_ADMIN_EMAIL || 'admin@campusbite.local', '/', adminPw, '\n  Others:   student1-3@, owner1-4@campusbite.local /', demoPw, '\n  (owner4 canteen is pending approval)\n');
await mongoose.disconnect();
