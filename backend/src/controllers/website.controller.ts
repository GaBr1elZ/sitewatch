import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const FREE_PLAN_LIMIT = 3;

export const getWebsites = async (req: Request, res: Response): Promise<void> => {
  try {
    const websites = await prisma.website.findMany({
      where:   { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        pings:     { orderBy: { checkedAt: 'desc' }, take: 30 },
        incidents: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });
    res.json(websites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const createWebsite = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, url } = req.body as { name: string; url: string };
    if (!name || !url) { res.status(400).json({ error: 'Nome e URL são obrigatórios.' }); return; }

    try { new URL(url); } catch {
      res.status(400).json({ error: 'URL inválida. Inclua o protocolo (https://).' });
      return;
    }

    if (req.user!.plan === 'FREE') {
      const count = await prisma.website.count({ where: { userId: req.user!.userId } });
      if (count >= FREE_PLAN_LIMIT) {
        res.status(403).json({
          error: `Limite do plano gratuito atingido (${FREE_PLAN_LIMIT} sites). Faça upgrade para o plano PRO.`,
          upgradeRequired: true,
        });
        return;
      }
    }

    const website = await prisma.website.create({
      data: { name, url, userId: req.user!.userId },
    });
    res.status(201).json(website);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const updateWebsite = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id']);
    const website = await prisma.website.findUnique({ where: { id } });
    if (!website || website.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Site não encontrado.' });
      return;
    }

    const { name, alertEmail, webhookUrl, checkInterval } = req.body as {
      name?: string;
      alertEmail?: boolean;
      webhookUrl?: string | null;
      checkInterval?: number;
    };

    // PRO only: checkInterval 30s
    const safeInterval = req.user!.plan === 'PRO' && checkInterval === 30 ? 30 : 60;

    const updated = await prisma.website.update({
      where: { id },
      data: {
        ...(name !== undefined        && { name }),
        ...(alertEmail !== undefined  && { alertEmail }),
        ...(webhookUrl !== undefined  && { webhookUrl: webhookUrl || null }),
        checkInterval: safeInterval,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const deleteWebsite = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id']);
    const website = await prisma.website.findUnique({ where: { id } });
    if (!website || website.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Site não encontrado.' });
      return;
    }
    await prisma.website.delete({ where: { id } });
    res.json({ message: 'Site removido com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const getWebsiteStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id']);
    const website = await prisma.website.findUnique({
      where:   { id },
      include: {
        pings:     { orderBy: { checkedAt: 'desc' }, take: 90 },
        incidents: { orderBy: { startedAt: 'desc' }, take: 20 },
      },
    });
    if (!website || website.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Site não encontrado.' });
      return;
    }

    const totalPings   = website.pings.length;
    const onlinePings  = website.pings.filter((p) => p.isOnline).length;
    const uptimePct    = totalPings > 0 ? ((onlinePings / totalPings) * 100).toFixed(2) : '100.00';
    const avgResponseMs = totalPings > 0
      ? Math.round(website.pings.reduce((sum, p) => sum + p.responseMs, 0) / totalPings)
      : 0;

    res.json({
      website,
      stats: {
        uptimePercentage: parseFloat(uptimePct),
        avgResponseMs,
        totalChecks:  totalPings,
        onlineChecks: onlinePings,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
};

export const getWebsiteDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id']);
    const website = await prisma.website.findUnique({
      where:   { id },
      include: {
        pings:     { orderBy: { checkedAt: 'desc' }, take: 200 },
        incidents: { orderBy: { startedAt: 'desc' }, take: 50 },
      },
    });
    if (!website || website.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Site não encontrado.' });
      return;
    }
    res.json(website);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};
