import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { corsOptions } from '../config/corsConfig';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: corsOptions,
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
