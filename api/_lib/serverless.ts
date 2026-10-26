import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../../server/src/index.js';
import { handle } from './handler.js';

export default handle(async (req: VercelRequest, res: VercelResponse) => {
  const dispatch = app as unknown as (request: VercelRequest, response: VercelResponse) => void;
  dispatch(req, res);
});
