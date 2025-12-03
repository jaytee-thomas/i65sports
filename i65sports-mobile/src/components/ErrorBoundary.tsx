import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="warning" size={64} color="#FFB800" />
          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            Don't worry, we're on it. Try restarting the app.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{this.state.error.toString()}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#B8C5D6',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  errorBox: {
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  errorText: {
    color: '#FFB800',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32,
  },
  buttonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

