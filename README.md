# CampusBite (backend core)

```bash
cd server && cp .env.example .env     # set JWT_SECRET (24+ chars) and MONGO_URI
npm install
npm run seed:reset                    # dev only; prints generated demo passwords once
npm run dev                           # http://localhost:5000/api
```

## Security model
- Role is read from the DB on every request (JWT carries only user id + tokenVersion). Logout/suspension bump `tokenVersion`, revoking sessions.
- `/auth/login` takes `portal` (admin|canteen|student); a mismatch with the stored role is rejected.
- Public registration allows only `student` / `canteen`. Admins are created only by the seed script.
- Owners: every query is scoped to their own canteen. Students: orders are looked up by `studentId`.
- Prices are re-read from the DB; stock is reserved atomically and rolled back on failure; `idempotencyKey` prevents duplicate orders.
- Order transitions: placed→accepted→preparing→ready→completed (cancel from placed/accepted). Enforced in `TRANSITIONS`.
- Admin dashboard separates gross order value, completed sales, cancellations, platform revenue (0 until commission exists).
- Socket.IO rooms: `canteen:<id>` / `student:<id>`, token-authenticated. Clients should also poll as fallback.
