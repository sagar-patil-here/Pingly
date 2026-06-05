"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSupabaseAuthState = void 0;
const baileys_1 = require("@whiskeysockets/baileys");
const supabase_1 = require("./supabase");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const useSupabaseAuthState = async (internalUserId) => {
    let creds;
    let keys = {};
    const { data, error } = await supabase_1.supabase
        .from('whatsapp_sessions')
        .select('session_data')
        .eq('user_id', internalUserId)
        .single();
    if (error && error.code !== 'PGRST116') {
        logger.error(error, 'Error fetching auth state from Supabase:');
    }
    if (data?.session_data) {
        try {
            const parsed = JSON.parse(JSON.stringify(data.session_data), baileys_1.BufferJSON.reviver);
            creds = parsed.creds;
            keys = parsed.keys || {};
        }
        catch (err) {
            logger.error(err, 'Failed to parse existing session state');
        }
    }
    if (!creds) {
        creds = (0, baileys_1.initAuthCreds)();
    }
    const saveCreds = async () => {
        const sessionData = JSON.parse(JSON.stringify({ creds, keys }, baileys_1.BufferJSON.replacer));
        const { error: saveError } = await supabase_1.supabase
            .from('whatsapp_sessions')
            .upsert({ user_id: internalUserId, session_data: sessionData }, { onConflict: 'user_id' });
        if (saveError) {
            logger.error(saveError, 'Failed to save auth state to Supabase:');
        }
    };
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const dict = keys[type];
                    return dict
                        ? ids.reduce((dict2, id) => {
                            if (dict[id]) {
                                dict2[id] = dict[id];
                            }
                            return dict2;
                        }, {})
                        : {};
                },
                set: (data) => {
                    for (const type in data) {
                        keys[type] = keys[type] || {};
                        // @ts-ignore - baileys signal key types are dynamic
                        Object.assign(keys[type], data[type]);
                    }
                    saveCreds();
                },
            },
        },
        saveCreds,
    };
};
exports.useSupabaseAuthState = useSupabaseAuthState;
