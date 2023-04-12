import { type NextApiHandler } from 'next';
import rateLimit from '~/server/fns/rateLimit';

const handler: NextApiHandler = async (req, res) => {
    await rateLimit({ ip: req.headers['x-forwarded-for'], key: 'test', tokens: 1, delayMs: 10000 });
    res.json({ ip: req.headers['x-forwarded-for'] });
};

export default handler;
