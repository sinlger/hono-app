import { Hono } from 'hono';

export const webhookRoutes = new Hono();

webhookRoutes.post('/push', async (c) => {
  const env = c.env;
  const forwardUrl = env.FORWARD_WEBHOOK_URL;

  try {
    const body = await c.req.json();
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    if (forwardUrl) {
      console.log(`Forwarding to: ${forwardUrl}`);
      const response = await fetch(forwardUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error(`Failed to forward webhook: ${response.status} ${response.statusText}`);
        // 即使转发失败，我们仍然可以认为原始的接收是成功的
      }
    }

    return c.json({ message: 'Webhook received successfully' }, 200);
  } catch (error) {
    console.error('Error processing webhook:', error);
    return c.json({ error: 'Failed to process webhook' }, 500);
  }
});