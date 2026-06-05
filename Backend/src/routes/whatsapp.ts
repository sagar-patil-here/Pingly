import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { initializeWhatsAppConnection, qrEmitters } from '../services/whatsapp';
import { ensureUser } from '../services/users';
import { supabase } from '../services/supabase';
import QRCode from 'qrcode';

const router = Router();

router.get('/status', requireAuth as any, async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const clerkId = req.auth.userId;

  if (!clerkId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const internalUserId = await ensureUser(clerkId);
    const { data } = await supabase
      .from('whatsapp_sessions')
      .select('connection_status, last_connected')
      .eq('user_id', internalUserId)
      .single();

    res.json({
      status: data?.connection_status || 'disconnected',
      last_connected: data?.last_connected || null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch status' });
  }
});

router.get('/qr', requireAuth as any, async (req: Request, res: Response): Promise<void> => {
  // @ts-ignore
  const clerkId = req.auth.userId;

  if (!clerkId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('retry: 10000\n\n');

  try {
    const internalUserId = await ensureUser(clerkId);
    const { data } = await supabase
      .from('whatsapp_sessions')
      .select('connection_status')
      .eq('user_id', internalUserId)
      .single();

    if (data?.connection_status === 'connected') {
      res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);
      res.end();
      return;
    }

    await initializeWhatsAppConnection(clerkId);
    const emitter = qrEmitters.get(clerkId);

    if (!emitter) {
      res.write(`data: ${JSON.stringify({ status: 'failed', error: 'Internal Error' })}\n\n`);
      res.end();
      return;
    }

    const qrListener = async (qr: string) => {
      try {
        const qrDataURL = await QRCode.toDataURL(qr);
        res.write(`data: ${JSON.stringify({ status: 'qr', qr: qrDataURL })}\n\n`);
      } catch (e) {
        console.error('Error generating QR', e);
      }
    };

    const statusListener = (status: string) => {
      res.write(`data: ${JSON.stringify({ status })}\n\n`);
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
  } catch (error: any) {
    res.write(
      `data: ${JSON.stringify({ status: 'failed', error: error.message || 'Connection failed' })}\n\n`
    );
    res.end();
  }
});

export default router;
