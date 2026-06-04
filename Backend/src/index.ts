import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';

import authRouter from './routes/auth';
import whatsappRouter from './routes/whatsapp';
import messageRouter from './routes/messages';
import { startScheduler } from './services/scheduler';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

// Middleware
app.use(cors());

// Webhooks require raw parsing, but we handle it manually in the route or trust express for now (Clerk webhook fix)
app.use(express.json());

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use(authRouter); // Mount at root so /webhook/clerk is exposed
app.use('/whatsapp', whatsappRouter);
app.use('/messages', messageRouter);
// app.use('/logs', logRoutes);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  startScheduler();
});
