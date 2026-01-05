import { DynamicStoreBackend } from '@voscarmv/apigen';
import { messages } from './schema.js'; // Your Drizzle schema
import type { Request, Response } from 'express';

// Create backend instance
export const BackendDB = new DynamicStoreBackend({
    dbUrl: process.env.DATABASE_URL!,
    port: 3000
});

// Add a public route
BackendDB.route({
    method: 'get',
    path: '/messages',
    handler: async (db, req, res) => {
    const allUsers = await db.select().from(messages);
    res.json(allUsers);
}});

// Add a route with auth
const requireAuth = (req: Request, res: Response, next: () => void): void => {
    const token = req.headers.authorization;
    if (!token) { res.status(401).json({ error: 'Unauthorized' }); return }
    next();
};

BackendDB.route({
    method: 'post',
    path: '/messages',
    middlewares: [requireAuth],
    handler: async (db, req, res) => {
    const newUser = await db.insert(messages).values(req.body).returning();
    res.json(newUser[0]);
}});
