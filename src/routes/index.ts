import { Hono } from 'hono';
import { foloRoutes } from './folo';

const app = new Hono();

app.route('/', foloRoutes);

export const routes = app;
