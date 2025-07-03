import { Hono } from 'hono'
import { tophubRoutes } from './tophub'
import { scrapyRoutes } from './scrapy'
export const routes = new Hono()
  .route('/', tophubRoutes)
  .route('/', scrapyRoutes)
