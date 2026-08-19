import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  const corsOrigin = process.env.CORS_ORIGIN || process.env.CLIENT_URL || '*';
  const allowedOrigins = corsOrigin === '*' ? '*' : corsOrigin.includes(',') ? corsOrigin.split(',').map(s => s.trim()) : corsOrigin;

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client Connected: ${socket.id}`);

    socket.on('join_partner_room', (storeId: string) => {
      socket.join(`store_${storeId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined store_${storeId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('[Socket.IO Error] Socket.IO instance not initialized.');
  }
  return io;
};

export const broadcastEvent = (eventName: string, payload: any) => {
  if (io) {
    io.emit(eventName, payload);
    console.log(`[Socket.IO Broadcast] Event '${eventName}' emitted.`);
  }
};
