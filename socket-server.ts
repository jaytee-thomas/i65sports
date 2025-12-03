import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = 3001; // Different port from Next.js

const httpServer = createServer();

const io = new Server(httpServer, {
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
    
    io.to(`game:${data.gameId}`).emit('reaction-received', {
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
    
    io.to(`game:${data.gameId}`).emit('message-received', {
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

httpServer.listen(PORT, () => {
  console.log(`🔌 WebSocket server running on port ${PORT}`);
});

