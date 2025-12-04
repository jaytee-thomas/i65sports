import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';

type RouteParams = {
  SelectRecipients: {
    sharedTakeId: string;
    sharedTakeTitle: string;
  };
};

interface Conversation {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name?: string;
  participants: Array<{
    user: {
      username: string;
    };
  }>;
}

export default function SelectRecipientsScreen() {
  const route = useRoute<RouteProp<RouteParams, 'SelectRecipients'>>();
  const navigation = useNavigation();
  const { sharedTakeId, sharedTakeTitle } = route.params;
  const { getToken } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendToConversation = async (conversationId: string) => {
    try {
      const token = await getToken();
      console.log('📤 Sharing Hot Take to conversation:', conversationId);
      
      const response = await axios.post(
        `${API_URL}/conversations/${conversationId}/messages`,
        {
          content: `Shared: ${sharedTakeTitle}`,
          type: 'HOTTAKE',
          sharedTakeId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Hot Take shared:', response.data);

      Toast.show({
        type: 'success',
        text1: 'Hot Take Shared! 🔥',
        position: 'bottom',
      });

      navigation.goBack();
    } catch (error: any) {
      console.error('❌ Error sharing:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      Toast.show({
        type: 'error',
        text1: 'Failed to share',
        text2: error.response?.data?.error || 'Please try again',
        position: 'bottom',
      });
    }
  };

  const getConversationName = (conversation: Conversation) => {
    if (conversation.type === 'GROUP') {
      return conversation.name || 'Group Chat';
    }
    const otherUser = conversation.participants[0];
    return `@${otherUser.user.username}`;
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => sendToConversation(item.id)}
    >
      <View style={styles.avatar}>
        <Ionicons
          name={item.type === 'GROUP' ? 'people' : 'person'}
          size={24}
          color="#00FF9F"
        />
      </View>
      <Text style={styles.conversationName}>{getConversationName(item)}</Text>
      <Ionicons name="chevron-forward" size={20} color="#8892A6" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send To</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.previewContainer}>
        <Text style={styles.previewLabel}>Sharing:</Text>
        <Text style={styles.previewTitle} numberOfLines={2}>
          {sharedTakeTitle}
        </Text>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  previewContainer: {
    padding: 16,
    backgroundColor: '#1A1F3A',
    borderBottomWidth: 1,
    borderBottomColor: '#0A0E27',
  },
  previewLabel: {
    fontSize: 12,
    color: '#8892A6',
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

