import { Router, Request, Response } from 'express';
import { sql } from '../db';

const router = Router();

// Health check - verify DB connection
router.get('/health', async (req: Request, res: Response) => {
    try {
        const response = await sql`SELECT version() as version`;
        const { version } = response[0];
        res.status(200).json({ status: 'ok', version });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
});

export default router;
