import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { useSupabaseAuthState } from './whatsapp-auth';
import { supabase } from './supabase';
import pino from 'pino';
import { EventEmitter } from 'events';

const logger = pino();

// To track active connections in memory
export const activeConnections = new Map<string, any>();
export const qrEmitters = new Map<string, EventEmitter>();

export const initializeWhatsAppConnection = async (userId: string) => {
  if (activeConnections.has(userId)) {
    return activeConnections.get(userId);
  }

  logger.info(`Initializing WhatsApp session for user ${userId}`);
  const { state, saveCreds } = await useSupabaseAuthState(userId);
  
  if (!qrEmitters.has(userId)) {
    qrEmitters.set(userId, new EventEmitter());
  }
  const emitter = qrEmitters.get(userId)!;

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
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.info(`Connection closed for user ${userId}. Reconnecting: ${shouldReconnect}`);
      
      activeConnections.delete(userId);
      emitter.emit('status', 'disconnected');
      
      if (shouldReconnect) {
        setTimeout(() => initializeWhatsAppConnection(userId), 5000);
      } else {
        // Logged out
        await supabase.from('whatsapp_sessions').update({ connection_status: 'disconnected' }).eq('user_id', userId);
      }
    } else if (connection === 'open') {
      logger.info(`WhatsApp connected for user ${userId}`);
      activeConnections.set(userId, sock);
      emitter.emit('status', 'connected');
      
      await supabase.from('whatsapp_sessions').upsert({
        user_id: userId,
        connection_status: 'connected',
        last_connected: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
  });

  sock.ev.on('creds.update', saveCreds);

  activeConnections.set(userId, sock);
  return sock;
};

export const getWhatsAppConnection = (userId: string) => {
  return activeConnections.get(userId);
};

export const sendScheduledMessage = async (userId: string, recipientNumber: string, text: string) => {
  let sock = getWhatsAppConnection(userId);
  
  if (!sock) {
    sock = await initializeWhatsAppConnection(userId);
    // Give it a moment to connect if it was offline
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Format the number to WhatsApp format. Assume stripping everything but numbers and adding @s.whatsapp.net
  const jid = recipientNumber.replace(/\\D/g, '') + '@s.whatsapp.net';
  
  try {
    const [result] = await sock.onWhatsApp(jid);
    if (!result?.exists) {
      throw new Error(`Number ${recipientNumber} is not on WhatsApp`);
    }
    
    await sock.sendMessage(jid, { text });
    return true;
  } catch (error) {
    logger.error(`Failed to send message to ${recipientNumber}: `, error);
    throw error;
  }
};
