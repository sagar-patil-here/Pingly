"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUser = ensureUser;
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const supabase_1 = require("./supabase");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
async function ensureUser(clerkId) {
    const { data: existing } = await supabase_1.supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkId)
        .single();
    if (existing)
        return existing.id;
    const clerkUser = await clerk_sdk_node_1.clerkClient.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ');
    const { data, error } = await supabase_1.supabase
        .from('users')
        .insert({ clerk_id: clerkId, email, name })
        .select('id')
        .single();
    if (error) {
        const { data: retry } = await supabase_1.supabase
            .from('users')
            .select('id')
            .eq('clerk_id', clerkId)
            .single();
        if (retry)
            return retry.id;
        logger.error(error, 'Failed to create user in Supabase');
        throw error;
    }
    return data.id;
}
