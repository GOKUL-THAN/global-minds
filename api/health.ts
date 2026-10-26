import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handle } from './_lib/handler.js';

export default handle(async (_req: VercelRequest, res: VercelResponse) => {
  res.json({ status: 'ok' });
});
