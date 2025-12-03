import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';

const { height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
  avatarUrl?: string;
}

interface LiveChatRoomProps {
  gameId: string;
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  onClose: () => void;
}

export const LiveChatRoom: React.FC<LiveChatRoomProps> = ({
  gameId,
  onSendMessage,
  messages,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useUser();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.userId === user?.id;

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
            <Text style={styles.username}>@{item.username}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              isOwnMessage && styles.ownMessageText,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isOwnMessage && styles.ownTimestamp,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={24} color="#00FF9F" />
          <Text style={styles.headerTitle}>Live Chat</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{messages.length} messages</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#FFFFFF" />
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
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#8892A6"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF9F',
  },
  onlineText: {
    fontSize: 12,
    color: '#B8C5D6',
  },
  closeButton: {
    padding: 4,
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
  username: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00FF9F',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
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
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1F3A',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1F3A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
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

