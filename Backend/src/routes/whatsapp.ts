import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { initializeWhatsAppConnection, qrEmitters } from '../services/whatsapp';
import { supabase } from '../services/supabase';
import QRCode from 'qrcode';

const router = Router();

router.get('/qr', requireAuth, async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const userId = req.auth.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Setup SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('retry: 10000\\n\\n');

  // Check DB status first
  const { data } = await supabase.from('whatsapp_sessions').select('connection_status').eq('user_id', userId).single();
  if (data?.connection_status === 'connected') {
    res.write(`data: ${JSON.stringify({ status: 'connected' })}\\n\\n`);
    res.end();
    return;
  }

  // Initializing Baileys triggers QR event
  await initializeWhatsAppConnection(userId);
  const emitter = qrEmitters.get(userId);

  if (!emitter) {
    res.write(`data: ${JSON.stringify({ status: 'failed', error: 'Internal Error' })}\\n\\n`);
    res.end();
    return;
  }

  const qrListener = async (qr: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(qr);
      res.write(`data: ${JSON.stringify({ status: 'qr', qr: qrDataURL })}\\n\\n`);
    } catch (e) {
      console.error('Error generating QR', e);
    }
  };

  const statusListener = (status: string) => {
    res.write(`data: ${JSON.stringify({ status })}\\n\\n`);
    if (status === 'connected' || status === 'disconnected') {
      res.end();
    }
  };

  emitter.on('qr', qrListener);
  emitter.on('status', statusListener);

  req.on('close', () => {
    emitter.off('qr', qrListener);
    emitter.off('status', statusListener);
  });
});

export default router;
