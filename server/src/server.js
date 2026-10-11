import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { createApp, events } from './app.js';
import { User, Canteen } from './models.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 24) { console.error('Set a strong JWT_SECRET in .env'); process.exit(1); }
await mongoose.connect(process.env.MONGO_URI);
const server = http.createServer(createApp());
const io = new Server(server, { cors: { origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',') } });

// Sockets are authenticated; users can only join rooms they own.
io.use(async (socket, next) => {
  try {
    const p = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
    const u = await User.findById(p.sub).select('+tokenVersion');
    if (!u || u.tokenVersion !== p.v || u.accountStatus !== 'active') throw new Error();
    socket.user = u; next();
  } catch { next(new Error('unauthorized')); }
});
io.on('connection', async (s) => {
  if (s.user.role === 'student') s.join(`student:${s.user.id}`);
  if (s.user.role === 'canteen') { const c = await Canteen.findOne({ ownerId: s.user._id }); if (c) s.join(`canteen:${c.id}`); }
});
events.emit = (room, ev, payload) => io.to(room).emit(ev, payload); // frontend should also poll as fallback

server.listen(process.env.PORT || 5000, () => console.log('CampusBite API on :' + (process.env.PORT || 5000)));
