"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const svix_1 = require("svix");
const supabase_1 = require("../services/supabase");
const pino_1 = __importDefault(require("pino"));
const router = (0, express_1.Router)();
const logger = (0, pino_1.default)();
router.post('/webhook/clerk', async (req, res) => {
    const payload = req.body;
    const headers = req.headers;
    const svix_id = headers["svix-id"];
    const svix_timestamp = headers["svix-timestamp"];
    const svix_signature = headers["svix-signature"];
    if (!svix_id || !svix_timestamp || !svix_signature) {
        res.status(400).json({ error: 'Error occured -- no svix headers' });
        return;
    }
    const wh = new svix_1.Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    let evt;
    try {
        evt = wh.verify(JSON.stringify(payload), {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    }
    catch (err) {
        logger.error(err, 'Error verifying webhook:');
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
        const { error } = await supabase_1.supabase.from('users').insert({
            clerk_id: id,
            email,
            name
        });
        if (error) {
            logger.error(error, 'Failed to sync user to Supabase:');
            res.status(500).json({ error: 'Database error' });
            return;
        }
    }
    if (eventType === 'user.deleted') {
        await supabase_1.supabase.from('users').delete().eq('clerk_id', id);
    }
    res.status(200).json({ success: true });
});
exports.default = router;
