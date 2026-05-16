import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../middlewares/auth.middleware';

let io: Server;

export const initSocket = (httpServer: HTTPServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const secret = process.env.JWT_SECRET || '';
      const payload = jwt.verify(token, secret) as AuthPayload;
      (socket as any).user = payload;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = (socket as any).user as AuthPayload;
    console.log(`[WS] Novo cliente conectado: ${socket.id} (User: ${user.userId})`);
    
    // Entra na sala específica do usuário
    socket.join(`user_${user.userId}`);

    socket.on('disconnect', () => {
      console.log(`[WS] Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
