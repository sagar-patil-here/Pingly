"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendScheduledMessage = exports.getWhatsAppConnection = exports.initializeWhatsAppConnection = exports.qrEmitters = exports.activeConnections = void 0;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const whatsapp_auth_1 = require("./whatsapp-auth");
const users_1 = require("./users");
const supabase_1 = require("./supabase");
const pino_1 = __importDefault(require("pino"));
const events_1 = require("events");
const logger = (0, pino_1.default)();
exports.activeConnections = new Map();
exports.qrEmitters = new Map();
const initializeWhatsAppConnection = async (clerkId) => {
    if (exports.activeConnections.has(clerkId)) {
        return exports.activeConnections.get(clerkId);
    }
    const internalUserId = await (0, users_1.ensureUser)(clerkId);
    logger.info(`Initializing WhatsApp session for user ${clerkId}`);
    const { state, saveCreds } = await (0, whatsapp_auth_1.useSupabaseAuthState)(internalUserId);
    if (!exports.qrEmitters.has(clerkId)) {
        exports.qrEmitters.set(clerkId, new events_1.EventEmitter());
    }
    const emitter = exports.qrEmitters.get(clerkId);
    const sock = (0, baileys_1.default)({
        auth: state,
        printQRInTerminal: false,
        logger: logger,
    });
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            emitter.emit('qr', qr);
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
            logger.info(`Connection closed for user ${clerkId}. Reconnecting: ${shouldReconnect}`);
            exports.activeConnections.delete(clerkId);
            emitter.emit('status', 'disconnected');
            if (shouldReconnect) {
                setTimeout(() => (0, exports.initializeWhatsAppConnection)(clerkId), 5000);
            }
            else {
                await supabase_1.supabase
                    .from('whatsapp_sessions')
                    .update({ connection_status: 'disconnected' })
                    .eq('user_id', internalUserId);
            }
        }
        else if (connection === 'open') {
            logger.info(`WhatsApp connected for user ${clerkId}`);
            exports.activeConnections.set(clerkId, sock);
            emitter.emit('status', 'connected');
            await supabase_1.supabase.from('whatsapp_sessions').upsert({
                user_id: internalUserId,
                connection_status: 'connected',
                last_connected: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        }
    });
    sock.ev.on('creds.update', saveCreds);
    exports.activeConnections.set(clerkId, sock);
    return sock;
};
exports.initializeWhatsAppConnection = initializeWhatsAppConnection;
const getWhatsAppConnection = (clerkId) => {
    return exports.activeConnections.get(clerkId);
};
exports.getWhatsAppConnection = getWhatsAppConnection;
const sendScheduledMessage = async (clerkId, recipientNumber, text) => {
    let sock = (0, exports.getWhatsAppConnection)(clerkId);
    if (!sock) {
        sock = await (0, exports.initializeWhatsAppConnection)(clerkId);
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
    }
    catch (error) {
        logger.error(error, `Failed to send message to ${recipientNumber}:`);
        throw error;
    }
};
exports.sendScheduledMessage = sendScheduledMessage;
