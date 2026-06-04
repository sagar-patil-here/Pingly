-- Drop tables if they exist
DROP TABLE IF EXISTS execution_logs;
DROP TABLE IF EXISTS scheduled_messages;
DROP TABLE IF EXISTS whatsapp_sessions;
DROP TABLE IF EXISTS users;

-- Users table (synced from Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp Sessions table (Baileys credentials)
CREATE TABLE whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_data JSONB,
    connection_status TEXT DEFAULT 'disconnected',
    last_connected TIMESTAMPTZ,
    UNIQUE(user_id)
);

-- Scheduled Messages
CREATE TABLE scheduled_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_number TEXT NOT NULL,
    message TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    recurrence_type TEXT DEFAULT 'once', -- once | daily | weekly | monthly
    status TEXT DEFAULT 'pending', -- pending | sent | failed | cancelled
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Execution Logs
CREATE TABLE execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_message_id UUID REFERENCES scheduled_messages(id) ON DELETE CASCADE,
    execution_time TIMESTAMPTZ DEFAULT now(),
    status TEXT, -- success | error
    error_message TEXT
);
