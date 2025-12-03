import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HTTPServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Join game room
    socket.on('join-game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      console.log(`👤 ${socket.id} joined game:${gameId}`);
      
      // Broadcast user joined
      socket.to(`game:${gameId}`).emit('user-joined', {
        socketId: socket.id,
        timestamp: new Date(),
      });
    });

    // Leave game room
    socket.on('leave-game', (gameId: string) => {
      socket.leave(`game:${gameId}`);
      console.log(`👋 ${socket.id} left game:${gameId}`);
    });

    // Live reaction
    socket.on('live-reaction', (data: {
      gameId: string;
      takeId: string;
      emoji: string;
      userId: string;
      username: string;
    }) => {
      console.log('⚡ Live reaction:', data);
      
      // Broadcast to everyone in the game room
      io?.to(`game:${data.gameId}`).emit('reaction-received', {
        ...data,
        timestamp: new Date(),
      });
    });

    // Live chat message
    socket.on('chat-message', (data: {
      gameId: string;
      userId: string;
      username: string;
      message: string;
      avatarUrl?: string;
    }) => {
      console.log('💬 Chat message:', data);
      
      // Broadcast to everyone in the game room
      io?.to(`game:${data.gameId}`).emit('message-received', {
        ...data,
        id: `${socket.id}-${Date.now()}`,
        timestamp: new Date(),
      });
    });

    // Typing indicator
    socket.on('typing', (data: { gameId: string; username: string }) => {
      socket.to(`game:${data.gameId}`).emit('user-typing', data);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

