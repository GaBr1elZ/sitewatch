import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? 'SiteWatch <alertas@sitewatch.app>';

// ──────────────────────────────────────────────
// Templates HTML
// ──────────────────────────────────────────────
function downTemplate(name: string, url: string, checkedAt: string): string {
  return `<!DOCTYPE html><html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#060d16;font-family:'Segoe UI',Arial,sans-serif;color:#f1f5f9}
  .wrap{max-width:560px;margin:40px auto;border:1px solid #1a2d45;border-radius:16px;overflow:hidden}
  .top{background:#1a0a0a;border-bottom:1px solid #3f1515;padding:24px 32px;display:flex;align-items:center;gap:12px}
  .badge{background:#ef444420;border:1px solid #ef444440;color:#f87171;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:0.07em}
  .body{padding:32px}
  .title{font-size:22px;font-weight:700;color:#f1f5f9;margin:0 0 8px}
  .sub{font-size:15px;color:#94a3b8;line-height:1.6;margin:0 0 24px}
  .url-box{background:#0a1420;border:1px solid #1a2d45;border-radius:10px;padding:14px 18px;font-size:14px;color:#22d3ee;word-break:break-all;margin-bottom:24px}
  .info-row{display:flex;gap:8px;margin-bottom:8px;font-size:13px;color:#64748b}
  .info-label{color:#475569;min-width:100px}
  .info-value{color:#94a3b8}
  .cta{display:inline-block;background:#22d3ee;color:#0a1420;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px}
  .foot{padding:20px 32px;border-top:1px solid #1a2d45;font-size:12px;color:#334155;text-align:center}
</style></head>
<body><div class="wrap">
  <div class="top">
    <span style="font-size:22px">🔴</span>
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">SiteWatch</div>
      <span class="badge">Site Offline</span>
    </div>
  </div>
  <div class="body">
    <p class="title">${name} está fora do ar</p>
    <p class="sub">Detectamos que o site abaixo não está respondendo. Um incidente foi aberto automaticamente.</p>
    <div class="url-box">${url}</div>
    <div class="info-row"><span class="info-label">Detectado em</span><span class="info-value">${checkedAt}</span></div>
    <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:#f87171">Offline</span></div>
    <a class="cta" href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard">Ver dashboard →</a>
  </div>
  <div class="foot">SiteWatch · Monitoramento de uptime · <a href="#" style="color:#22d3ee">Desativar alertas</a></div>
</div></body></html>`;
}

function upTemplate(name: string, url: string, duration: string, checkedAt: string): string {
  return `<!DOCTYPE html><html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#060d16;font-family:'Segoe UI',Arial,sans-serif;color:#f1f5f9}
  .wrap{max-width:560px;margin:40px auto;border:1px solid #1a2d45;border-radius:16px;overflow:hidden}
  .top{background:#051a10;border-bottom:1px solid #0d3320;padding:24px 32px;display:flex;align-items:center;gap:12px}
  .badge{background:#10b98120;border:1px solid #10b98140;color:#10b981;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:0.07em}
  .body{padding:32px}
  .title{font-size:22px;font-weight:700;color:#f1f5f9;margin:0 0 8px}
  .sub{font-size:15px;color:#94a3b8;line-height:1.6;margin:0 0 24px}
  .url-box{background:#0a1420;border:1px solid #1a2d45;border-radius:10px;padding:14px 18px;font-size:14px;color:#22d3ee;word-break:break-all;margin-bottom:24px}
  .info-row{display:flex;gap:8px;margin-bottom:8px;font-size:13px;color:#64748b}
  .info-label{color:#475569;min-width:100px}
  .info-value{color:#94a3b8}
  .cta{display:inline-block;background:#10b981;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px}
  .foot{padding:20px 32px;border-top:1px solid #1a2d45;font-size:12px;color:#334155;text-align:center}
</style></head>
<body><div class="wrap">
  <div class="top">
    <span style="font-size:22px">🟢</span>
    <div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">SiteWatch</div>
      <span class="badge">Site Voltou</span>
    </div>
  </div>
  <div class="body">
    <p class="title">${name} voltou ao ar</p>
    <p class="sub">O site estava offline e agora está respondendo normalmente. O incidente foi fechado.</p>
    <div class="url-box">${url}</div>
    <div class="info-row"><span class="info-label">Duração</span><span class="info-value" style="color:#fbbf24">${duration}</span></div>
    <div class="info-row"><span class="info-label">Resolvido em</span><span class="info-value">${checkedAt}</span></div>
    <div class="info-row"><span class="info-label">Status</span><span class="info-value" style="color:#10b981">Online</span></div>
    <a class="cta" href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard">Ver dashboard →</a>
  </div>
  <div class="foot">SiteWatch · Monitoramento de uptime · <a href="#" style="color:#22d3ee">Desativar alertas</a></div>
</div></body></html>`;
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60)  return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}min ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}min`;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(d);
}

// ──────────────────────────────────────────────
// Exported helpers
// ──────────────────────────────────────────────
export async function sendDownAlert(to: string, name: string, url: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return; // silently skip if not configured
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🔴 ${name} está fora do ar — SiteWatch`,
      html: downTemplate(name, url, formatDate(new Date())),
    });
    console.log(`[EMAIL] Alerta de downtime enviado para ${to} (${name})`);
  } catch (err) {
    console.error('[EMAIL] Falha ao enviar alerta de downtime:', err);
  }
}

export async function sendUpAlert(to: string, name: string, url: string, durationMs: number): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🟢 ${name} voltou ao ar — SiteWatch`,
      html: upTemplate(name, url, formatDuration(durationMs), formatDate(new Date())),
    });
    console.log(`[EMAIL] Alerta de recovery enviado para ${to} (${name})`);
  } catch (err) {
    console.error('[EMAIL] Falha ao enviar alerta de recovery:', err);
  }
}

export async function sendWebhook(webhookUrl: string, name: string, url: string, isOnline: boolean, durationMs?: number): Promise<void> {
  try {
    // Suporte a Discord e Slack (ambos aceitam { content } ou { text })
    const payload = isOnline
      ? {
          content: `✅ **${name}** voltou ao ar!\n🔗 ${url}\n⏱️ Ficou offline por ${durationMs ? formatDuration(durationMs) : 'tempo desconhecido'}`,
          text:    `✅ ${name} voltou ao ar! (${url})`,
        }
      : {
          content: `🔴 **${name}** está FORA DO AR!\n🔗 ${url}`,
          text:    `🔴 ${name} está FORA DO AR! (${url})`,
        };

    await fetch(webhookUrl, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    console.log(`[WEBHOOK] Notificação enviada para ${webhookUrl}`);
  } catch (err) {
    console.error('[WEBHOOK] Falha ao enviar webhook:', err);
  }
}

// ──────────────────────────────────────────────
// Weekly Report
// ──────────────────────────────────────────────
export type SiteReportSummary = {
  name: string;
  url: string;
  uptime: number;
  avgResponseMs: number;
  totalIncidents: number;
};

function weeklyReportTemplate(userName: string, startDate: string, endDate: string, sites: SiteReportSummary[]): string {
  const sitesHtml = sites.map(s => {
    const uptimeColor = s.uptime >= 99 ? '#10b981' : s.uptime >= 95 ? '#fbbf24' : '#ef4444';
    return `
      <div style="background:#0a1420;border:1px solid #1a2d45;border-radius:10px;padding:16px;margin-bottom:12px;">
        <div style="font-size:16px;font-weight:700;color:#f1f5f9;margin-bottom:4px">${s.name}</div>
        <div style="font-size:13px;color:#22d3ee;margin-bottom:12px">${s.url}</div>
        <div style="display:flex;gap:24px;">
          <div><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Uptime</div><div style="font-size:16px;font-weight:700;color:${uptimeColor}">${s.uptime.toFixed(2)}%</div></div>
          <div><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Latência</div><div style="font-size:16px;font-weight:700;color:#94a3b8">${s.avgResponseMs}ms</div></div>
          <div><div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Quedas</div><div style="font-size:16px;font-weight:700;color:#94a3b8">${s.totalIncidents}</div></div>
        </div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html><html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;background:#060d16;font-family:'Segoe UI',Arial,sans-serif;color:#f1f5f9}
  .wrap{max-width:560px;margin:40px auto;border:1px solid #1a2d45;border-radius:16px;overflow:hidden}
  .top{background:#0a1420;border-bottom:1px solid #1a2d45;padding:24px 32px;text-align:center;}
  .body{padding:32px}
  .title{font-size:22px;font-weight:700;color:#f1f5f9;margin:0 0 8px}
  .sub{font-size:15px;color:#94a3b8;line-height:1.6;margin:0 0 24px}
  .cta{display:inline-block;background:#22d3ee;color:#0a1420;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px}
  .foot{padding:20px 32px;border-top:1px solid #1a2d45;font-size:12px;color:#334155;text-align:center}
</style></head>
<body><div class="wrap">
  <div class="top">
    <div style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#22d3ee">SiteWatch Weekly</div>
  </div>
  <div class="body">
    <p class="title">Olá, ${userName}</p>
    <p class="sub">Aqui está o seu relatório semanal de performance referente ao período de <strong>${startDate} a ${endDate}</strong>.</p>
    ${sitesHtml}
    <div style="text-align:center">
      <a class="cta" href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard">Acessar Dashboard</a>
    </div>
  </div>
  <div class="foot">SiteWatch · Monitoramento de uptime · <a href="#" style="color:#22d3ee">Desativar relatórios</a></div>
</div></body></html>`;
}

export async function sendWeeklyReport(to: string, userName: string, startDate: string, endDate: string, sites: SiteReportSummary[]): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[EMAIL] Fake send weekly report to ${to}`);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `📊 Seu Relatório Semanal de Uptime — SiteWatch`,
      html: weeklyReportTemplate(userName, startDate, endDate, sites),
    });
    console.log(`[EMAIL] Relatório semanal enviado para ${to}`);
  } catch (err) {
    console.error('[EMAIL] Falha ao enviar relatório semanal:', err);
  }
}
