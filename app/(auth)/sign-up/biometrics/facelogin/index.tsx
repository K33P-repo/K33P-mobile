import Button from '@/components/Button';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from 'react-native';
import LockIcon from '../../../../../assets/images/lock-3.png';

// Get these from environment variables instead of hardcoding!
const FACE_API_KEY = 'NwacU0nJE5lABdk7_Fs3znyAbgeK3RyV';
const FACE_API_SECRET = 'Fok-9gwqg50knFVBcV9SBZ5uipRqoxwX';

// Log errors to console with timestamp
const logError = (error: any, context: string) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${context}:`, error);
};

const FaceLoginScreen = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('front');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('Align your face with the circle');
  const cameraRef = useRef<CameraView>(null);
  const [errorCount, setErrorCount] = useState(0);

  // Retrieve stored face token during registration
  const getStoredFaceToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('user_face_token');
      if (!token) {
        logError('No token found', 'getStoredFaceToken');
        throw new Error('No registered face found. Please sign up first.');
      }
      return token;
    } catch (error) {
      logError(error, 'getStoredFaceToken');
      throw new Error('Failed to access stored face data');
    }
  };

  const handleTokenExpiration = async () => {
    Alert.alert(
      'Face Data Expired',
      'Your facial recognition data has expired. Please re-register.',
      [
        {
          text: 'Re-register',
          onPress: () => {
            SecureStore.deleteItemAsync('user_face_token');
            router.push('/face-registration');
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const captureAndCompare = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    setIsProcessing(true);
    setStatus('Capturing your face...');
    
    try {
      // 1. Capture current face
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: true
      });

      setStatus('Verifying identity...');
      
      // 2. Detect face in captured image
      const detectFormData = new FormData();
      detectFormData.append('api_key', FACE_API_KEY);
      detectFormData.append('api_secret', FACE_API_SECRET);
      detectFormData.append('image_file', {
        uri: photo.uri,
        name: 'login_face.jpg',
        type: 'image/jpeg',
      } as any);

      const detectResponse = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
        method: 'POST',
        body: detectFormData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const detectData = await detectResponse.json();
      
      // Log API response for debugging
      console.log('Detect API Response:', detectData);
      
      if (!detectData.faces || detectData.faces.length === 0) {
        throw new Error('No face detected. Please position your face in the circle.');
      }
      
      const currentFaceToken = detectData.faces[0].face_token;
      
      // 3. Retrieve stored face token
      const storedFaceToken = await getStoredFaceToken();

      setStatus('Comparing faces...');
      
      // 4. Compare faces
      const compareFormData = new FormData();
      compareFormData.append('api_key', FACE_API_KEY);
      compareFormData.append('api_secret', FACE_API_SECRET);
      compareFormData.append('face_token1', storedFaceToken);
      compareFormData.append('face_token2', currentFaceToken);

      const compareResponse = await fetch('https://api-us.faceplusplus.com/facepp/v3/compare', {
        method: 'POST',
        body: compareFormData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const compareData = await compareResponse.json();
      
      // Log API response for debugging
      console.log('Compare API Response:', compareData);
      
      // 5. Handle API errors
      if (compareData.error_message) {
        if (compareData.error_message.includes('INVALID_FACE_TOKEN')) {
          await handleTokenExpiration();
          return;
        }
        throw new Error(compareData.error_message);
      }

      // 6. Check confidence levels
      if (!compareData.confidence || !compareData.thresholds) {
        throw new Error('Invalid response from face comparison service');
      }

      if (compareData.confidence > compareData.thresholds['1e-5']) {
        // High confidence match - log success
        console.log('High confidence match:', compareData.confidence);
        router.replace('/(home)');
      } else if (compareData.confidence > compareData.thresholds['1e-3']) {
        // Medium confidence - require user confirmation
        Alert.alert(
          'Additional Verification',
          'Please confirm your identity',
          [
            { 
              text: 'Cancel', 
              style: 'cancel',
              onPress: () => setStatus('Verification canceled')
            },
            { 
              text: 'Verify', 
              onPress: () => {
                console.log('Medium confidence match:', compareData.confidence);
                router.replace('/(home)');
              }
            }
          ]
        );
      } else {
        // Low confidence
        const msg = `Face does not match. Confidence: ${compareData.confidence.toFixed(2)}`;
        console.warn(msg);
        throw new Error(msg);
      }
    } catch (error: any) {
      setErrorCount(prev => prev + 1);
      logError(error, 'captureAndCompare');
      
      let errorMessage = 'Authentication failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Prevent navigation on error
      if (errorCount >= 2) {
        errorMessage += '\n\nTry again or use another login method.';
      }
      
      Alert.alert('Login Failed', errorMessage);
      setStatus('Align your face with the circle');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (permission?.granted && !isProcessing) {
      // Start login process after 2s camera warm-up
      const timer = setTimeout(() => {
        captureAndCompare();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [permission, isProcessing]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera permission required for face login</Text>
        <Button onPress={requestPermission} text="Grant Permission" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral800 px-5 pt-12">
      <View className="relative flex-row items-center justify-start mb-4">
        <Image
          source={LockIcon}
          className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[16px]"
          resizeMode="contain"
        />
      </View>

      <View className="items-center my-8" style={styles.cameraContainer}>
        <View style={styles.cameraWrapper}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
          />
        </View>
      </View>

      <View className="items-center mb-2">
        <Text className="text-neutral100 font-sora text-sm text-center px-7">
          {status}
        </Text>
      </View>

      {isProcessing && (
        <View className="items-center mt-4">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      <View className="flex-1 justify-end pb-8">
        <Button
          text="Try Again"
          onPress={captureAndCompare}
          isDisabled={isProcessing}
        />
        {errorCount > 1 && (
          <Button
            text="Use Password Instead"
            onPress={() => router.push('/password-login')}
            variant="outline"
            className="mt-4"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  cameraContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraWrapper: {
    width: 205,
    height: 205,
    borderRadius: 125,
    overflow: 'hidden',
    transform: [{ scale: 1.1 }],
    zIndex: 10,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
});

export default FaceLoginScreen;