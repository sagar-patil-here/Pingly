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
const isProduction = process.env.NODE_ENV === 'production';
const logger = (0, pino_1.default)(isProduction
    ? {}
    : {
        transport: {
            target: 'pino-pretty',
            options: { colorize: true },
        },
    });
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow server-to-server requests (no origin) and known frontends
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use(auth_1.default);
app.use('/whatsapp', whatsapp_1.default);
app.use('/messages', messages_1.default);
app.listen(Number(port), '0.0.0.0', () => {
    logger.info(`Server is running on port ${port}`);
    (0, scheduler_1.startScheduler)();
});
