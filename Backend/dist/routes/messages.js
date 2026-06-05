"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const users_1 = require("../services/users");
const supabase_1 = require("../services/supabase");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    // @ts-ignore
    const { userId } = req.auth;
    try {
        const internalUserId = await (0, users_1.ensureUser)(userId);
        const { data, error } = await supabase_1.supabase
            .from('scheduled_messages')
            .select('*')
            .eq('user_id', internalUserId)
            .order('scheduled_time', { ascending: true });
        if (error)
            return res.status(500).json({ error: error.message });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch messages' });
    }
});
router.post('/', async (req, res) => {
    // @ts-ignore
    const { userId } = req.auth;
    const { recipient_number, message, scheduled_time, recurrence_type } = req.body;
    if (!recipient_number || !message || !scheduled_time) {
        return res.status(400).json({ error: 'recipient_number, message, and scheduled_time are required' });
    }
    try {
        const internalUserId = await (0, users_1.ensureUser)(userId);
        const { data, error } = await supabase_1.supabase
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
        if (error)
            return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to create message' });
    }
});
router.delete('/:id', async (req, res) => {
    // @ts-ignore
    const { userId } = req.auth;
    const { id } = req.params;
    try {
        const internalUserId = await (0, users_1.ensureUser)(userId);
        const { error } = await supabase_1.supabase
            .from('scheduled_messages')
            .delete()
            .match({ id, user_id: internalUserId });
        if (error)
            return res.status(500).json({ error: error.message });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message || 'Failed to delete message' });
    }
});
exports.default = router;
