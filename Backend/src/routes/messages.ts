import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabase } from '../services/supabase';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: Request, res: Response) => {
  // @ts-ignore
  const { userId } = req.auth;
  
  // Need internal user uuid
  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('scheduled_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('scheduled_time', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req: Request, res: Response) => {
  // @ts-ignore
  const { userId } = req.auth;
  const { recipient_number, message, scheduled_time, recurrence_type } = req.body;

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { data, error } = await supabase
    .from('scheduled_messages')
    .insert({
      user_id: user.id,
      recipient_number,
      message,
      scheduled_time,
      recurrence_type: recurrence_type || 'once',
      status: 'pending'
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.delete('/:id', async (req: Request, res: Response) => {
  // @ts-ignore
  const { userId } = req.auth;
  const { id } = req.params;

  const { data: user } = await supabase.from('users').select('id').eq('clerk_id', userId).single();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { error } = await supabase
    .from('scheduled_messages')
    .delete()
    .match({ id, user_id: user.id });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
