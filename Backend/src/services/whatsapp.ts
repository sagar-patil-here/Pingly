import makeWASocket, { DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { useSupabaseAuthState } from './whatsapp-auth';
import { ensureUser } from './users';
import { supabase } from './supabase';
import pino from 'pino';
import { EventEmitter } from 'events';

const logger = pino();

export const activeConnections = new Map<string, any>();
export const qrEmitters = new Map<string, EventEmitter>();

export const initializeWhatsAppConnection = async (clerkId: string) => {
  if (activeConnections.has(clerkId)) {
    return activeConnections.get(clerkId);
  }

  const internalUserId = await ensureUser(clerkId);

  logger.info(`Initializing WhatsApp session for user ${clerkId}`);
  const { state, saveCreds } = await useSupabaseAuthState(internalUserId);

  if (!qrEmitters.has(clerkId)) {
    qrEmitters.set(clerkId, new EventEmitter());
  }
  const emitter = qrEmitters.get(clerkId)!;

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: logger as any,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      emitter.emit('qr', qr);
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.info(`Connection closed for user ${clerkId}. Reconnecting: ${shouldReconnect}`);

      activeConnections.delete(clerkId);
      emitter.emit('status', 'disconnected');

      if (shouldReconnect) {
        setTimeout(() => initializeWhatsAppConnection(clerkId), 5000);
      } else {
        await supabase
          .from('whatsapp_sessions')
          .update({ connection_status: 'disconnected' })
          .eq('user_id', internalUserId);
      }
    } else if (connection === 'open') {
      logger.info(`WhatsApp connected for user ${clerkId}`);
      activeConnections.set(clerkId, sock);
      emitter.emit('status', 'connected');

      await supabase.from('whatsapp_sessions').upsert(
        {
          user_id: internalUserId,
          connection_status: 'connected',
          last_connected: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    }
  });

  sock.ev.on('creds.update', saveCreds);

  activeConnections.set(clerkId, sock);
  return sock;
};

export const getWhatsAppConnection = (clerkId: string) => {
  return activeConnections.get(clerkId);
};

export const sendScheduledMessage = async (
  clerkId: string,
  recipientNumber: string,
  text: string
) => {
  let sock = getWhatsAppConnection(clerkId);

  if (!sock) {
    sock = await initializeWhatsAppConnection(clerkId);
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  const jid = recipientNumber.replace(/\D/g, '') + '@s.whatsapp.net';

  try {
    const [result] = await sock.onWhatsApp(jid);
    if (!result?.exists) {
      throw new Error(`Number ${recipientNumber} is not on WhatsApp`);
    }

    await sock.sendMessage(jid, { text });
    return true;
  } catch (error) {
    logger.error(error, `Failed to send message to ${recipientNumber}:`);
    throw error;
  }
};
