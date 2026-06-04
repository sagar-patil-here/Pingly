import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { supabase } from '../services/supabase';
import pino from 'pino';

const router = Router();
const logger = pino();

router.post('/webhook/clerk', async (req: Request, res: Response): Promise<void> => {
  const payload = req.body;
  const headers = req.headers;

  const svix_id = headers["svix-id"] as string;
  const svix_timestamp = headers["svix-timestamp"] as string;
  const svix_signature = headers["svix-signature"] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).json({ error: 'Error occured -- no svix headers' });
    return;
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
  let evt: any;

  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err: any) {
    logger.error('Error verifying webhook:', err.message);
    res.status(400).json({ error: 'Error verifying webhook' });
    return;
  }

  const { id } = evt.data;
  const eventType = evt.type;
  
  logger.info(`Received Clerk webhook: ${eventType} for user ${id}`);

  if (eventType === 'user.created') {
    const { email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim();
    
    // Sync to Supabase
    const { error } = await supabase.from('users').insert({
      clerk_id: id,
      email,
      name
    });

    if (error) {
      logger.error('Failed to sync user to Supabase:', error);
      res.status(500).json({ error: 'Database error' });
      return;
    }
  }

  if (eventType === 'user.deleted') {
    await supabase.from('users').delete().eq('clerk_id', id);
  }

  res.status(200).json({ success: true });
});

export default router;
