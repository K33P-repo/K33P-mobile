import * as LocalAuthentication from 'expo-local-authentication';
import React, { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

const FaceIdScreen = () => {
  const [isFaceIdSupported, setIsFaceIdSupported] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if Face ID is supported
  useEffect(() => {
    (async () => {
      // 1. Check if device has biometric hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        setErrorMessage('Your device does not support biometric authentication');
        return;
      }

      // 2. Check if Face ID is specifically available (iOS only)
      if (Platform.OS === 'ios') {
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const faceIdSupported = supportedTypes.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        );
        
        setIsFaceIdSupported(faceIdSupported);
        
        if (!faceIdSupported) {
          setErrorMessage('Face ID is not available on your device');
        }
      } else {
        // On Android, we can't guarantee Face ID specifically
        setErrorMessage('Face ID is only available on iOS devices');
      }

      // 3. Check if biometric data is enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        setErrorMessage('No Face ID data found. Please set up Face ID in your device settings.');
      }
    })();
  }, []);

  const handleFaceIdAuth = async () => {
    try {
      setErrorMessage('');
      
      // iOS-specific Face ID authentication
      if (Platform.OS === 'ios') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate with Face ID',
          disableDeviceFallback: true, // Prevent fallback to passcode
          cancelLabel: 'Cancel',
          fallbackLabel: '', // Disable fallback button
          requireConfirmation: true, // Requires explicit user confirmation
        });

        if (result.success) {
          setIsAuthenticated(true);
        } else if (result.error === 'user_cancel') {
          setErrorMessage('Authentication canceled');
        } else {
          setErrorMessage('Face ID authentication failed');
        }
      } else {
        setErrorMessage('Face ID is only available on iOS');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrorMessage('An error occurred during authentication');
    }
  };

  return (
    <View style={styles.container}>

      
      <Text style={styles.title}>Face ID Authentication</Text>
      
      {errorMessage ? (
        <Text style={styles.error}>{errorMessage}</Text>
      ) : isAuthenticated ? (
        <Text style={styles.success}>Successfully authenticated with Face ID!</Text>
      ) : (
        <Text style={styles.instructions}>
          {Platform.OS === 'ios' 
            ? "Please authenticate using Face ID" 
            : "Face ID is only available on iOS devices"}
        </Text>
      )}

      {Platform.OS === 'ios' && isFaceIdSupported && !isAuthenticated && (
        <Button 
          title="Authenticate with Face ID" 
          onPress={handleFaceIdAuth}
          disabled={!!errorMessage}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: 'red',
  },
  success: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: 'green',
  },
});

export default FaceIdScreen;