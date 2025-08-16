/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the app
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('=====================================');
    console.error('ERROR CAUGHT BY BOUNDARY:');
    console.error('Error message:', error.toString());
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.error('=====================================');
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to external service in production
    if (!__DEV__) {
      // TODO: Send error to crash reporting service (e.g., Sentry, Bugsnag)
      this.logErrorToService(error, errorInfo);
    }

    // Show alert in development
    if (__DEV__) {
      Alert.alert(
        'Error Detected',
        `An error occurred: ${error.toString()}\n\nCheck console for details.`,
        [{ text: 'OK' }]
      );
    }
  }

  logErrorToService = (error, errorInfo) => {
    // Placeholder for error logging service
    // In production, integrate with services like Sentry or Bugsnag
    try {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.log('Error logged to service:', error.toString());
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
    });
  };

  handleReload = () => {
    // Reset error state and reload the app
    this.handleReset();
    // In a real app, you might want to reload data or reset navigation
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Prevent infinite error loops
      if (this.state.errorCount > 3) {
        return (
          <View style={styles.container}>
            <Icon name="alert-circle-outline" size={64} color="#FF6B6B" />
            <Text style={styles.title}>Multiple Errors Detected</Text>
            <Text style={styles.message}>
              The app is experiencing repeated errors. 
              Please restart the application.
            </Text>
          </View>
        );
      }

      return (
        <View style={styles.container}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Error Icon */}
            <Icon name="alert-circle-outline" size={64} color="#FF6B6B" />
            
            {/* Error Title */}
            <Text style={styles.title}>Oops! Something went wrong</Text>
            
            {/* Error Message */}
            <Text style={styles.message}>
              We're sorry, but something unexpected happened. 
              The error has been logged and we'll work on fixing it.
            </Text>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleReload}
              >
                <Icon name="refresh" size={20} color="#FFF" />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleReset}
              >
                <Icon name="close" size={20} color="#667eea" />
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Dismiss
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Details (Development Only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                <Text style={styles.errorDetailsText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: 300,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 5,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButtonText: {
    color: '#667eea',
  },
  errorDetails: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FFF',
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  errorDetailsText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 10,
  },
  errorStack: {
    fontSize: 10,
    color: '#666',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default ErrorBoundary;
