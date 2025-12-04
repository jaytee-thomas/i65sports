import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import socketService from '../services/socket';

const API_URL = 'http://192.168.86.226:3000/api';

type RouteParams = {
  Chat: {
    conversationId: string;
    conversationName: string;
    isGroup: boolean;
  };
};

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'HOTTAKE' | 'SYSTEM';
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  sharedTake?: {
    id: string;
    title: string;
    videoUrl: string;
    thumbUrl?: string;
    author: {
      username: string;
    };
  };
}

export default function ChatScreen() {
  const route = useRoute<RouteProp<RouteParams, 'Chat'>>();
  const navigation = useNavigation();
  const { conversationId, conversationName, isGroup } = route.params;
  const { getToken } = useAuth();
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadMessages();
    joinConversation();

    // Listen for new messages
    const messageHandler = (data: any) => {
      console.log('💬 Received DM:', data);
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data]);
        flatListRef.current?.scrollToEnd({ animated: true });
      }
    };

    // Listen for typing
    const typingHandler = (data: any) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) =>
          prev.includes(data.username) ? prev : [...prev, data.username]
        );
      }
    };

    const stopTypingHandler = (data: any) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }
    };

    socketService.onDirectMessage(messageHandler);
    socketService.onUserTypingDM(typingHandler);
    socketService.onUserStopTypingDM(stopTypingHandler);

    return () => {
      socketService.leaveConversation(conversationId);
      socketService.removeListener('message-received', messageHandler);
      socketService.removeListener('user-typing-dm', typingHandler);
      socketService.removeListener('user-stop-typing-dm', stopTypingHandler);
    };
  }, [conversationId]);

  const joinConversation = () => {
    socketService.joinConversation(conversationId);
  };

  const loadMessages = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const messageContent = inputText.trim();
    setInputText('');

    try {
      // Send via socket for real-time
      socketService.sendDirectMessage({
        conversationId,
        senderId: user?.id || '',
        senderUsername: user?.username || '',
        content: messageContent,
        type: 'TEXT',
      });

      // Also save to backend
      const token = await getToken();
      await axios.post(
        `${API_URL}/conversations/${conversationId}/messages`,
        {
          content: messageContent,
          type: 'TEXT',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Stop typing indicator
      handleStopTyping();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTypingDM(
        conversationId,
        user?.id || '',
        user?.username || ''
      );
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = () => {
    setIsTyping(false);
    socketService.stopTypingDM(conversationId, user?.id || '');
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender.id === user?.id;

    // System message
    if (item.type === 'SYSTEM') {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{item.content}</Text>
        </View>
      );
    }

    // Shared Hot Take
    if (item.type === 'HOTTAKE' && item.sharedTake) {
      return (
        <View
          style={[
            styles.messageContainer,
            isOwnMessage && styles.ownMessageContainer,
          ]}
        >
          {!isOwnMessage && (
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color="#00FF9F" />
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isOwnMessage && styles.ownMessageBubble,
            ]}
          >
            {!isOwnMessage && (
              <Text style={styles.senderName}>@{item.sender.username}</Text>
            )}
            <TouchableOpacity style={styles.sharedTakeCard}>
              <View style={styles.sharedTakeThumbnail}>
                <Ionicons name="play-circle" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.sharedTakeInfo}>
                <Text style={styles.sharedTakeTitle} numberOfLines={2}>
                  {item.sharedTake.title}
                </Text>
                <Text style={styles.sharedTakeAuthor}>
                  by @{item.sharedTake.author.username}
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.timestamp}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      );
    }

    // Regular text message
    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage && styles.ownMessageContainer,
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.avatar}>
            <Ionicons name="person" size={16} color="#00FF9F" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage && styles.ownMessageBubble,
          ]}
        >
          {!isOwnMessage && isGroup && (
            <Text style={styles.senderName}>@{item.sender.username}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isOwnMessage && styles.ownMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[styles.timestamp, isOwnMessage && styles.ownTimestamp]}
          >
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{conversationName}</Text>
          {typingUsers.length > 0 && (
            <Text style={styles.typingIndicator}>
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
              typing...
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={28} color="#8892A6" />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor="#8892A6"
            value={inputText}
            onChangeText={(text) => {
              setInputText(text);
              handleTyping();
            }}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  typingIndicator: {
    fontSize: 12,
    color: '#00FF9F',
    marginTop: 2,
  },
  infoButton: {
    marginLeft: 12,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 12,
  },
  ownMessageBubble: {
    backgroundColor: '#00FF9F',
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF9F',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#0A0E27',
  },
  timestamp: {
    fontSize: 10,
    color: '#8892A6',
    marginTop: 4,
  },
  ownTimestamp: {
    color: 'rgba(10, 14, 39, 0.6)',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  systemMessage: {
    fontSize: 12,
    color: '#8892A6',
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sharedTakeCard: {
    flexDirection: 'row',
    backgroundColor: '#0A0E27',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  sharedTakeThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sharedTakeInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  sharedTakeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sharedTakeAuthor: {
    fontSize: 12,
    color: '#8892A6',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1A1F3A',
    gap: 12,
  },
  attachButton: {
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1F3A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3A4166',
    opacity: 0.5,
  },
});

