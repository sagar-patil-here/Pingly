"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const ws_1 = __importDefault(require("ws"));
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseKey) {
    console.warn("Missing Supabase environment variables. Database connections will fail.");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
    realtime: {
        // Provide a WebSocket implementation for Node <22
        transport: ws_1.default,
    },
});
