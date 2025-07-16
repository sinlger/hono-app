import { Hono } from 'hono';
import { foloRoutes } from './folo.js';
import { webhookRoutes } from './webhook.js';

const app = new Hono();

app.route('/', foloRoutes);
app.route('/webhook', webhookRoutes);

export const routes = app;