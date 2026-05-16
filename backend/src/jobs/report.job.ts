import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { sendWeeklyReport, SiteReportSummary } from '../lib/email';

export async function runWeeklyReports(): Promise<void> {
  console.log(`[CRON] Gerando relatórios semanais — ${new Date().toISOString()}`);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const startDateStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(sevenDaysAgo);
  const endDateStr = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(now);

  // Buscar usuários que possuam pelo menos um site ativo
  const users = await prisma.user.findMany({
    where: {
      websites: {
        some: { active: true }
      }
    },
    include: {
      websites: {
        where: { active: true },
        include: {
          pings: {
            where: {
              checkedAt: { gte: sevenDaysAgo }
            }
          },
          incidents: {
            where: {
              startedAt: { gte: sevenDaysAgo }
            }
          }
        }
      }
    }
  });

  if (users.length === 0) {
    console.log('[CRON] Nenhum usuário com sites ativos para gerar relatório.');
    return;
  }

  console.log(`[CRON] Processando relatórios para ${users.length} usuário(s)...`);

  for (const user of users) {
    if (!user.email) continue;

    const sitesReport: SiteReportSummary[] = [];

    for (const website of user.websites) {
      const totalChecks = website.pings.length;
      if (totalChecks === 0) continue; // Sem dados na semana

      const onlineChecks = website.pings.filter(p => p.isOnline).length;
      const uptime = (onlineChecks / totalChecks) * 100;
      
      const avgResponseMs = Math.round(
        website.pings.reduce((sum, p) => sum + p.responseMs, 0) / totalChecks
      );

      const totalIncidents = website.incidents.length;

      sitesReport.push({
        name: website.name,
        url: website.url,
        uptime,
        avgResponseMs,
        totalIncidents
      });
    }

    if (sitesReport.length > 0) {
      await sendWeeklyReport(user.email, user.name, startDateStr, endDateStr, sitesReport);
    }
  }

  console.log('[CRON] Relatórios semanais concluídos.');
}

/**
 * Inicia o cronjob para rodar toda segunda-feira às 08:00 AM
 */
export function startReportJob(): void {
  console.log('[CRON] Agendador de relatórios semanais iniciado (0 8 * * 1).');
  cron.schedule('0 8 * * 1', () => void runWeeklyReports());
}
