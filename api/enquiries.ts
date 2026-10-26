import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handle, body, str } from './_lib/handler.js';
import { createEnquiry } from '../server/src/db.js';

export default handle(async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') { res.status(405).end(); return; }
  const b = body(req);
  const name   = str(b, 'name', 120);
  const email  = str(b, 'email', 254).toLowerCase();
  const phone  = str(b, 'phone', 32);
  const course = str(b, 'course', 200);
  const message = str(b, 'message', 5000);
  const source  = str(b, 'source', 100) || 'Website Form';

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || phone.length < 7) {
    res.status(400).json({ message: 'Please provide valid enquiry details.' });
    return;
  }
  const enquiry = await createEnquiry({ name, email, phone, course, message, source });
  res.status(201).json({ success: true, enquiry });
});
