import { clerkClient } from '@clerk/clerk-sdk-node';
import { supabase } from './supabase';
import pino from 'pino';

const logger = pino();

export async function ensureUser(clerkId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (existing) return existing.id;

  const clerkUser = await clerkClient.users.getUser(clerkId);
  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ');

  const { data, error } = await supabase
    .from('users')
    .insert({ clerk_id: clerkId, email, name })
    .select('id')
    .single();

  if (error) {
    const { data: retry } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();

    if (retry) return retry.id;

    logger.error(error, 'Failed to create user in Supabase');
    throw error;
  }

  return data.id;
}
