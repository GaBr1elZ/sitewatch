import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/** GET /api/status/:slug — público, sem autenticação */
export const getStatusPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = String(req.params['slug']).toLowerCase();

    const user = await prisma.user.findUnique({
      where:  { slug },
      select: { id: true, name: true, slug: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Página de status não encontrada.' });
      return;
    }

    const websites = await prisma.website.findMany({
      where:   { userId: user.id, active: true },
      orderBy: { createdAt: 'asc' },
      include: {
        pings: {
          orderBy: { checkedAt: 'desc' },
          take:    90, // últimas 90 verificações (~1.5h ou 45min no PRO)
        },
        incidents: {
          orderBy: { startedAt: 'desc' },
          take:    5,
        },
      },
    });

    // Calcula uptime de cada site
    const sites = websites.map((w) => {
      const total   = w.pings.length;
      const online  = w.pings.filter((p) => p.isOnline).length;
      const avgMs   = total > 0 ? Math.round(w.pings.reduce((s, p) => s + p.responseMs, 0) / total) : 0;
      const uptime  = total > 0 ? parseFloat(((online / total) * 100).toFixed(2)) : 100;
      const current = w.pings[0]?.isOnline ?? null;

      return {
        id:        w.id,
        name:      w.name,
        url:       w.url,
        isOnline:  current,
        uptime,
        avgMs,
        totalChecks: total,
        pings:     w.pings,
        incidents: w.incidents,
      };
    });

    res.json({ owner: user.name, slug: user.slug, sites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};
