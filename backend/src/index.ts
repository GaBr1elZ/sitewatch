import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes     from './routes/auth.routes';
import websiteRoutes  from './routes/website.routes';
import incidentRoutes from './routes/incident.routes';
import statusRoutes   from './routes/status.routes';
import { startMonitoringJob } from './jobs/monitor.job';

const app  = express();
const PORT = process.env.PORT ?? 3001;

// ── Middlewares ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman, curl) e origens permitidas
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origem: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',      authRoutes);
app.use('/api/websites',  websiteRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/status',    statusRoutes);   // público

// ── Start ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 SiteWatch Backend em http://localhost:${PORT}`);
  startMonitoringJob();
});

export default app;
