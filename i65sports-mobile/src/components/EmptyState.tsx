import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color="#3A4166" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Pre-built empty states for common scenarios
export const NoHotTakesEmpty: React.FC<{ onRecord?: () => void }> = ({ onRecord }) => (
  <EmptyState
    icon="videocam-off"
    title="No Hot Takes Yet"
    message="Be the first to share your take on the game!"
    actionLabel={onRecord ? "Record Hot Take" : undefined}
    onAction={onRecord}
  />
);

export const NoNotificationsEmpty: React.FC = () => (
  <EmptyState
    icon="notifications-off-outline"
    title="No Notifications"
    message="You'll see notifications here when someone likes, comments, or follows you"
  />
);

export const NoSearchResultsEmpty: React.FC<{ query: string }> = ({ query }) => (
  <EmptyState
    icon="search"
    title="No Results Found"
    message={`We couldn't find anything matching "${query}". Try different keywords.`}
  />
);

export const NoFollowersEmpty: React.FC = () => (
  <EmptyState
    icon="people-outline"
    title="No Followers Yet"
    message="Share great Hot Takes to attract followers!"
  />
);

export const NoFollowingEmpty: React.FC = () => (
  <EmptyState
    icon="person-add-outline"
    title="Not Following Anyone"
    message="Find users to follow and see their Hot Takes in your feed"
  />
);

export const NetworkErrorEmpty: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <EmptyState
    icon="cloud-offline"
    title="Connection Error"
    message="Unable to load content. Check your internet connection and try again."
    actionLabel="Retry"
    onAction={onRetry}
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

