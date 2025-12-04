import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';

interface Collection {
  id: string;
  name: string;
  isPublic: boolean;
  _count: {
    items: number;
  };
}

interface AddToCollectionSheetProps {
  visible: boolean;
  onClose: () => void;
  takeId: string;
  onCreateNew?: () => void;
}

export const AddToCollectionSheet: React.FC<AddToCollectionSheetProps> = ({
  visible,
  onClose,
  takeId,
  onCreateNew,
}) => {
  const { getToken } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollections(response.data.collections);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCollection = async (collectionId: string) => {
    try {
      setAddingTo(collectionId);
      const token = await getToken();

      await axios.post(
        `${API_URL}/collections/${collectionId}/items`,
        { takeId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Added to collection! 📁',
        position: 'bottom',
      });

      onClose();
    } catch (error: any) {
      console.error('Error adding to collection:', error);

      const message =
        error.response?.data?.error || 'Failed to add to collection';

      Toast.show({
        type: 'error',
        text1: message,
        position: 'bottom',
      });
    } finally {
      setAddingTo(null);
    }
  };

  const renderCollection = ({ item }: { item: Collection }) => {
    const isAdding = addingTo === item.id;

    return (
      <TouchableOpacity
        style={styles.collectionItem}
        onPress={() => addToCollection(item.id)}
        disabled={isAdding}
      >
        <View style={styles.collectionIcon}>
          <Ionicons name="folder" size={24} color="#00FF9F" />
        </View>
        <View style={styles.collectionInfo}>
          <Text style={styles.collectionName}>{item.name}</Text>
          <Text style={styles.collectionStats}>
            {item._count.items} Hot Takes •{' '}
            {item.isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
        {isAdding ? (
          <ActivityIndicator color="#00FF9F" />
        ) : (
          <Ionicons name="add-circle-outline" size={24} color="#8892A6" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add to Collection</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Create New Button */}
          <TouchableOpacity
            style={styles.createNewButton}
            onPress={() => {
              onClose();
              if (onCreateNew) onCreateNew();
            }}
          >
            <View style={styles.createNewIcon}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.createNewText}>Create New Collection</Text>
          </TouchableOpacity>

          {/* Collections List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00FF9F" />
            </View>
          ) : collections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-outline" size={48} color="#8892A6" />
              <Text style={styles.emptyText}>No collections yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first collection to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={collections}
              renderItem={renderCollection}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
            />
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0A0E27',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00FF9F',
    borderStyle: 'dashed',
  },
  createNewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createNewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF9F',
  },
  listContent: {
    padding: 16,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginBottom: 12,
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  collectionStats: {
    fontSize: 13,
    color: '#8892A6',
  },
  loadingContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8892A6',
    marginTop: 8,
    textAlign: 'center',
  },
});

