import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/** GET /api/incidents — todos os incidentes do usuário logado */
export const getIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const incidents = await prisma.incident.findMany({
      where:   { website: { userId: req.user!.userId } },
      orderBy: { startedAt: 'desc' },
      take:    50,
      include: { website: { select: { id: true, name: true, url: true } } },
    });
    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

/** GET /api/websites/:id/incidents — incidentes de um site específico */
export const getWebsiteIncidents = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params['id']);
    const website = await prisma.website.findUnique({ where: { id } });
    if (!website || website.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Site não encontrado.' });
      return;
    }
    const incidents = await prisma.incident.findMany({
      where:   { websiteId: id },
      orderBy: { startedAt: 'desc' },
      take:    100,
    });
    res.json(incidents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno.' });
  }
};
