"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const whatsapp_1 = require("../services/whatsapp");
const users_1 = require("../services/users");
const supabase_1 = require("../services/supabase");
const qrcode_1 = __importDefault(require("qrcode"));
const router = (0, express_1.Router)();
router.get('/status', auth_1.requireAuth, async (req, res) => {
    // @ts-ignore
    const clerkId = req.auth.userId;
    if (!clerkId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const internalUserId = await (0, users_1.ensureUser)(clerkId);
        const { data } = await supabase_1.supabase
            .from('whatsapp_sessions')
            .select('connection_status, last_connected')
            .eq('user_id', internalUserId)
            .single();
        res.json({
            status: data?.connection_status || 'disconnected',
            last_connected: data?.last_connected || null,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch status' });
    }
});
router.get('/qr', auth_1.requireAuth, async (req, res) => {
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
        const internalUserId = await (0, users_1.ensureUser)(clerkId);
        const { data } = await supabase_1.supabase
            .from('whatsapp_sessions')
            .select('connection_status')
            .eq('user_id', internalUserId)
            .single();
        if (data?.connection_status === 'connected') {
            res.write(`data: ${JSON.stringify({ status: 'connected' })}\n\n`);
            res.end();
            return;
        }
        await (0, whatsapp_1.initializeWhatsAppConnection)(clerkId);
        const emitter = whatsapp_1.qrEmitters.get(clerkId);
        if (!emitter) {
            res.write(`data: ${JSON.stringify({ status: 'failed', error: 'Internal Error' })}\n\n`);
            res.end();
            return;
        }
        const qrListener = async (qr) => {
            try {
                const qrDataURL = await qrcode_1.default.toDataURL(qr);
                res.write(`data: ${JSON.stringify({ status: 'qr', qr: qrDataURL })}\n\n`);
            }
            catch (e) {
                console.error('Error generating QR', e);
            }
        };
        const statusListener = (status) => {
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
    }
    catch (error) {
        res.write(`data: ${JSON.stringify({ status: 'failed', error: error.message || 'Connection failed' })}\n\n`);
        res.end();
    }
});
exports.default = router;
