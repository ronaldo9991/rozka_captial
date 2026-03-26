import type { VercelRequest, VercelResponse } from '@vercel/node';
// @ts-ignore - built file, no types available
import handler from '../dist/index.js';

export default function server(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
