import { Hono } from 'hono'
import { tophubRoutes } from './tophub'
import { scrapyRoutes } from './scrapy'
import { siliconflowRoutes } from './siliconflow'
export const routes = new Hono()
  .route('/', tophubRoutes)
  .route('/', scrapyRoutes)
  .route('/', siliconflowRoutes)
