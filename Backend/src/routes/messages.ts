import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { ensureUser } from '../services/users';
import { supabase } from '../services/supabase';

const router = Router();

router.use(requireAuth as any);

router.get('/', async (req: Request, res: Response) => {
  // @ts-ignore
  const { userId } = req.auth;

  try {
    const internalUserId = await ensureUser(userId);

    const { data, error } = await supabase
      .from('scheduled_messages')
      .select('*')
      .eq('user_id', internalUserId)
      .order('scheduled_time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch messages' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  // @ts-ignore
  const { userId } = req.auth;
  const { recipient_number, message, scheduled_time, recurrence_type } = req.body;

  if (!recipient_number || !message || !scheduled_time) {
    return res.status(400).json({ error: 'recipient_number, message, and scheduled_time are required' });
  }

  try {
    const internalUserId = await ensureUser(userId);

    const { data, error } = await supabase
      .from('scheduled_messages')
      .insert({
        user_id: internalUserId,
        recipient_number,
        message,
        scheduled_time,
        recurrence_type: recurrence_type || 'once',
        status: 'pending',
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create message' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  // @ts-ignore
  const { userId } = req.auth;
  const { id } = req.params;

  try {
    const internalUserId = await ensureUser(userId);

    const { error } = await supabase
      .from('scheduled_messages')
      .delete()
      .match({ id, user_id: internalUserId });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete message' });
  }
});

export default router;
