import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing any modules that depend on them
dotenv.config();

import pino from 'pino';
import authRouter from './routes/auth';
import whatsappRouter from './routes/whatsapp';
import messageRouter from './routes/messages';
import { startScheduler } from './services/scheduler';

const app = express();
const port = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

const logger = pino(
  isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
);

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin) and known frontends
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(authRouter);
app.use('/whatsapp', whatsappRouter);
app.use('/messages', messageRouter);

app.listen(Number(port), '0.0.0.0', () => {
  logger.info(`Server is running on port ${port}`);
  startScheduler();
});
