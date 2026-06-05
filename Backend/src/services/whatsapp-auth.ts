import { AuthenticationState, initAuthCreds, BufferJSON } from '@whiskeysockets/baileys';
import { supabase } from './supabase';
import pino from 'pino';

const logger = pino();

export const useSupabaseAuthState = async (
  internalUserId: string
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> => {
  let creds: any;
  let keys: any = {};

  const { data, error } = await supabase
    .from('whatsapp_sessions')
    .select('session_data')
    .eq('user_id', internalUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    logger.error(error, 'Error fetching auth state from Supabase:');
  }

  if (data?.session_data) {
    try {
      const parsed = JSON.parse(JSON.stringify(data.session_data), BufferJSON.reviver);
      creds = parsed.creds;
      keys = parsed.keys || {};
    } catch (err) {
      logger.error(err, 'Failed to parse existing session state');
    }
  }

  if (!creds) {
    creds = initAuthCreds();
  }

  const saveCreds = async () => {
    const sessionData = JSON.parse(JSON.stringify({ creds, keys }, BufferJSON.replacer));

    const { error: saveError } = await supabase
      .from('whatsapp_sessions')
      .upsert(
        { user_id: internalUserId, session_data: sessionData },
        { onConflict: 'user_id' }
      );

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
            ? ids.reduce((dict2: any, id: any) => {
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
