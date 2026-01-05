import { DynamicStoreBackend } from '@voscarmv/apigen';
import { messages } from './schema.js';
import { asc, eq, and, sql } from 'drizzle-orm/sql';

export const BackendDB = new DynamicStoreBackend({
    dbUrl: process.env.DATABASE_URL!,
    port: 3000
});

BackendDB.route({
    method: 'post',
    path: '/messages',
    handler: async (db, req, res) => {
        try {
            const { user_id, queued, msgs } = req.body;
            const response: { message: string }[] = await db
                .insert(messages)
                .values(msgs.map((msg: string) => (
                    {
                        user_id,
                        queued,
                        message: msg
                    }
                )))
                .returning({ message: messages.message });
            res.json(response.map(item => item.message));
        } catch (err) {
            res.status(500).json({ error: String(err) });
        }
    }
});

BackendDB.route({
    method: 'get',
    path: '/messages/:user_id',
    handler: async (db, req, res) => {
        try {
            const response: { message: string }[] = await db
                .select({ message: messages.message })
                .from(messages)
                .where(eq(messages.user_id, req.params.user_id as string))
                .orderBy(asc(messages.updated_at), asc(messages.id));
            res.json(response.map(item => item.message));
        } catch (err) {
            res.status(500).json({ error: String(err) });
        }
    }
});

BackendDB.route({
    method: 'get',
    path: '/messages/:user_id/queued',
    handler: async (db, req, res) => {
        try {
            const response: { message: string }[] = await db
                .select({ message: messages.message })
                .from(messages)
                .where(
                    and(
                        eq(messages.queued, true),
                        eq(messages.user_id, req.params.user_id as string)
                    ));
            res.json(response.map(item => item.message));
        } catch (err) {
            res.status(500).json({ error: String(err) });
        }
    }
});

BackendDB.route({
    method: 'put',
    path: '/messages/:user_id/unqueue',
    handler: async (db, req, res) => {
        try {
            const response: { message: string }[] = await db
                .update(messages)
                .set({ queued: false, updated_at: sql`now()` })
                .where(eq(messages.user_id, req.params.user_id as string))
                .returning({ message: messages.message });
            res.json(response.map(item => item.message));
        } catch (err) {
            res.status(500).json({ error: String(err) });
        }
    }
});
