"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables FIRST before importing any modules that depend on them
dotenv_1.default.config();
const pino_1 = __importDefault(require("pino"));
const auth_1 = __importDefault(require("./routes/auth"));
const whatsapp_1 = __importDefault(require("./routes/whatsapp"));
const messages_1 = __importDefault(require("./routes/messages"));
const scheduler_1 = require("./services/scheduler");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const logger = (0, pino_1.default)({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});
// Middleware
app.use((0, cors_1.default)());
// Webhooks require raw parsing, but we handle it manually in the route or trust express for now (Clerk webhook fix)
app.use(express_1.default.json());
// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Mount routes
app.use(auth_1.default); // Mount at root so /webhook/clerk is exposed
app.use('/whatsapp', whatsapp_1.default);
app.use('/messages', messages_1.default);
// app.use('/logs', logRoutes);
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    (0, scheduler_1.startScheduler)();
});
