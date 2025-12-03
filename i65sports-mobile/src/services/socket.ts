import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://192.168.86.226:3001';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket?.connected) {
      console.log('🔌 Already connected');
      return;
    }

    console.log('🔌 Connecting to WebSocket...');

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  joinGame(gameId: string) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    console.log('🏀 Joining game:', gameId);
    this.socket.emit('join-game', gameId);
  }

  leaveGame(gameId: string) {
    if (!this.socket) return;
    console.log('👋 Leaving game:', gameId);
    this.socket.emit('leave-game', gameId);
  }

  sendReaction(data: {
    gameId: string;
    takeId: string;
    emoji: string;
    userId: string;
    username: string;
  }) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    console.log('⚡ Sending reaction:', data);
    this.socket.emit('live-reaction', data);
  }

  sendChatMessage(data: {
    gameId: string;
    userId: string;
    username: string;
    message: string;
    avatarUrl?: string;
  }) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    console.log('💬 Sending message:', data);
    this.socket.emit('chat-message', data);
  }

  onReaction(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('reaction-received', callback);
  }

  onMessage(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('message-received', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('user-typing', callback);
  }

  removeListener(event: string, callback?: any) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  getSocket() {
    return this.socket;
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SocketService();

