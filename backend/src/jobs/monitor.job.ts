import axios from 'axios';
import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { sendDownAlert, sendUpAlert, sendWebhook } from '../lib/email';

/**
 * Faz ping em uma URL e retorna o status HTTP e o tempo de resposta em ms.
 * Retorna status -1 se o site estiver offline/inacessível.
 */
async function pingWebsite(url: string): Promise<{ status: number; responseMs: number; isOnline: boolean }> {
  const start = Date.now();
  try {
    const response = await axios.get(url, {
      timeout: 10_000,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    const responseMs = Date.now() - start;
    const isOnline   = response.status >= 200 && response.status < 400;
    return { status: response.status, responseMs, isOnline };
  } catch {
    return { status: -1, responseMs: Date.now() - start, isOnline: false };
  }
}

/**
 * Verifica um único site, salva o ping e gerencia incidentes + alertas.
 */
async function checkWebsite(website: {
  id: string;
  url: string;
  name: string;
  alertEmail: boolean;
  webhookUrl: string | null;
  user: { email: string };
}): Promise<void> {
  // Busca o último ping para detectar mudança de status
  const lastPing = await prisma.pingLog.findFirst({
    where:   { websiteId: website.id },
    orderBy: { checkedAt: 'desc' },
  });

  const { status, responseMs, isOnline } = await pingWebsite(website.url);

  // Salva o novo ping
  await prisma.pingLog.create({
    data: { websiteId: website.id, status, responseMs, isOnline },
  });

  const statusIcon = isOnline ? '✅' : '❌';
  console.log(`[CRON] ${statusIcon} ${website.name} — HTTP ${status} | ${responseMs}ms`);

  // ── Detectar mudança de status ──────────────────────────
  const wasOnline = lastPing ? lastPing.isOnline : true; // assume online se nunca pingou

  // Site CAIU (era online, agora está offline)
  if (wasOnline && !isOnline) {
    // Cria incidente (evita duplicata verificando se já há um aberto)
    const openIncident = await prisma.incident.findFirst({
      where: { websiteId: website.id, resolvedAt: null },
    });

    if (!openIncident) {
      await prisma.incident.create({ data: { websiteId: website.id } });
      console.log(`[CRON] 🚨 Incidente aberto para ${website.name}`);

      // Email de alerta
      if (website.alertEmail) {
        await sendDownAlert(website.user.email, website.name, website.url);
      }

      // Webhook
      if (website.webhookUrl) {
        await sendWebhook(website.webhookUrl, website.name, website.url, false);
      }
    }
  }

  // Site VOLTOU (era offline, agora está online)
  if (!wasOnline && isOnline) {
    const openIncident = await prisma.incident.findFirst({
      where: { websiteId: website.id, resolvedAt: null },
    });

    if (openIncident) {
      const durationMs = Date.now() - openIncident.startedAt.getTime();
      await prisma.incident.update({
        where: { id: openIncident.id },
        data:  { resolvedAt: new Date(), durationMs },
      });
      console.log(`[CRON] ✅ Incidente fechado para ${website.name} (duração: ${Math.round(durationMs / 1000)}s)`);

      // Email de recovery
      if (website.alertEmail) {
        await sendUpAlert(website.user.email, website.name, website.url, durationMs);
      }

      // Webhook
      if (website.webhookUrl) {
        await sendWebhook(website.webhookUrl, website.name, website.url, true, durationMs);
      }
    }
  }
}

/**
 * Ciclo principal: verifica todos os sites ativos respeitando o checkInterval.
 * Roda a cada 30s; sites FREE (60s) são pulados em ciclos intercalados.
 */
async function runMonitoringCycle(): Promise<void> {
  console.log(`[CRON] Ciclo — ${new Date().toISOString()}`);

  const now = Date.now();

  const activeWebsites = await prisma.website.findMany({
    where:  { active: true },
    select: {
      id:            true,
      url:           true,
      name:          true,
      alertEmail:    true,
      webhookUrl:    true,
      checkInterval: true,
      user:          { select: { email: true } },
    },
  });

  if (activeWebsites.length === 0) {
    console.log('[CRON] Nenhum site ativo.');
    return;
  }

  // Filtra sites que precisam ser verificados agora com base no checkInterval
  const toCheck = await Promise.all(
    activeWebsites.map(async (w) => {
      const lastPing = await prisma.pingLog.findFirst({
        where:   { websiteId: w.id },
        orderBy: { checkedAt: 'desc' },
        select:  { checkedAt: true },
      });
      if (!lastPing) return w; // nunca pingado → verificar agora
      const elapsed = now - lastPing.checkedAt.getTime();
      return elapsed >= w.checkInterval * 1000 ? w : null;
    })
  );

  const pending = toCheck.filter(Boolean) as typeof activeWebsites;

  if (pending.length === 0) {
    console.log('[CRON] Nenhum site precisa ser verificado neste ciclo.');
    return;
  }

  console.log(`[CRON] Verificando ${pending.length}/${activeWebsites.length} site(s)...`);

  const results = await Promise.allSettled(pending.map(checkWebsite));

  const errors = results.filter((r) => r.status === 'rejected');
  if (errors.length > 0) {
    console.error(`[CRON] ${errors.length} erro(s) no ciclo.`);
  }

  console.log('[CRON] Ciclo concluído.');
}

/**
 * Inicia o cron de monitoramento a cada 30 segundos.
 */
export function startMonitoringJob(): void {
  console.log('[CRON] Motor de monitoramento iniciado. Ciclos a cada 30s.');
  void runMonitoringCycle(); // executa imediatamente
  cron.schedule('*/30 * * * * *', () => void runMonitoringCycle());
}
