"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const pino_1 = __importDefault(require("pino"));
const supabase_1 = require("./supabase");
const whatsapp_1 = require("./whatsapp");
const logger = (0, pino_1.default)();
const startScheduler = () => {
    logger.info('Scheduler started. Checking for messages every minute.');
    // Run every minute
    node_cron_1.default.schedule('* * * * *', async () => {
        try {
            const now = new Date().toISOString();
            logger.info(`Running message scheduler at ${now}`);
            // Get all pending messages ready to send
            const { data: messages, error } = await supabase_1.supabase
                .from('scheduled_messages')
                .select(`
          id,
          recipient_number,
          message,
          scheduled_time,
          recurrence_type,
          users (
            clerk_id
          )
        `)
                .eq('status', 'pending')
                .lte('scheduled_time', now);
            if (error) {
                logger.error(error, 'Error fetching scheduled messages:');
                return;
            }
            if (!messages || messages.length === 0) {
                return;
            }
            logger.info(`Found ${messages.length} messages to send.`);
            for (const msg of messages) {
                // @ts-ignore
                const clerkId = msg.users?.clerk_id;
                if (!clerkId) {
                    logger.error(`Message ${msg.id} has no valid user linked. Skipping.`);
                    continue;
                }
                try {
                    // Attempt to send
                    await (0, whatsapp_1.sendScheduledMessage)(clerkId, msg.recipient_number, msg.message);
                    await supabase_1.supabase.from('execution_logs').insert({
                        scheduled_message_id: msg.id,
                        status: 'success'
                    });
                    // Handle recurrence mapping (for MVP, let's keep it simple. If 'once', mark sent. Else leave it alone for now, wait MVP said simple)
                    if (msg.recurrence_type === 'once') {
                        await supabase_1.supabase.from('scheduled_messages').update({ status: 'sent' }).eq('id', msg.id);
                    }
                    else {
                        // Basic dummy logic for next time (Add 1 day for daily etc) - to be fleshed out
                        // Just mark sent for now to prevent infinite loop
                        await supabase_1.supabase.from('scheduled_messages').update({ status: 'sent' }).eq('id', msg.id);
                    }
                }
                catch (err) {
                    logger.error(err, `Failed to send message ${msg.id}:`);
                    await supabase_1.supabase.from('execution_logs').insert({
                        scheduled_message_id: msg.id,
                        status: 'error',
                        error_message: err?.message || 'Unknown error'
                    });
                    await supabase_1.supabase.from('scheduled_messages').update({ status: 'failed' }).eq('id', msg.id);
                }
            }
        }
        catch (error) {
            logger.error(error, 'Scheduler cron job error:');
        }
    });
};
exports.startScheduler = startScheduler;
