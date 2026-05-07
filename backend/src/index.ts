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
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true }));
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
