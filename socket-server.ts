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

  // Join conversation room
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`💬 ${socket.id} joined conversation:${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`👋 ${socket.id} left conversation:${conversationId}`);
  });

  // Send direct message
  socket.on('send-message', (data: {
    conversationId: string;
    senderId: string;
    senderUsername: string;
    content: string;
    type: 'TEXT' | 'HOTTAKE';
    sharedTakeId?: string;
  }) => {
    console.log('💬 New message:', data);
    
    // Broadcast to everyone in conversation
    io.to(`conversation:${data.conversationId}`).emit('message-received', {
      ...data,
      id: `${socket.id}-${Date.now()}`,
      timestamp: new Date(),
    });
  });

  // Typing indicator for DMs
  socket.on('typing-dm', (data: {
    conversationId: string;
    userId: string;
    username: string;
  }) => {
    socket.to(`conversation:${data.conversationId}`).emit('user-typing-dm', data);
  });

  // Stop typing
  socket.on('stop-typing-dm', (data: {
    conversationId: string;
    userId: string;
  }) => {
    socket.to(`conversation:${data.conversationId}`).emit('user-stop-typing-dm', data);
  });

  // Mark message as read
  socket.on('mark-read', (data: {
    conversationId: string;
    messageId: string;
    userId: string;
  }) => {
    io.to(`conversation:${data.conversationId}`).emit('message-read', data);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🔌 WebSocket server running on port ${PORT}`);
});

