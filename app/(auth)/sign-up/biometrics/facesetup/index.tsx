import Button from '@/components/Button';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import FaceScan0 from '../../../../../assets/images/facescan-0.png';
import FaceScan30 from '../../../../../assets/images/facescan-1.png';
import FaceScan70 from '../../../../../assets/images/facescan-2.png';
import FaceScan100 from '../../../../../assets/images/facescan-3.png';
import FaceSuccessImage from '../../../../../assets/images/facesuccess.png';
import LockIcon from '../../../../../assets/images/lock-3.png';
import LockSuccessIcon from '../../../../../assets/images/lock-4.png';

const FACE_API_KEY = 'NwacU0nJE5lABdk7_Fs3znyAbgeK3RyV';
const FACE_API_SECRET = 'Fok-9gwqg50knFVBcV9SBZ5uipRqoxwX';

const FaceSetupScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentFaceImage, setCurrentFaceImage] = useState(FaceScan0);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('front');
  const [faceAuthSuccess, setFaceAuthSuccess] = useState(false);
  const [faceToken, setFaceToken] = useState<string | null>(null);
  const [faceAnalysis, setFaceAnalysis] = useState<any>(null);
  const cameraRef = useRef<CameraView>(null);
  const [processing, setProcessing] = useState(false);

  const progressSteps = [
    { percent: 0, image: FaceScan0, text: "Keep your face in the center until the registration is complete" },
    { percent: 30, image: FaceScan30, text: "Capturing your face for analysis" },
    { percent: 70, image: FaceScan70, text: "Analyzing facial features" },
    { percent: 100, image: FaceScan100, text: "Scan complete" }
  ];

  const currentStep = progressSteps.find(step => step.percent === progress) || progressSteps[0];

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  useEffect(() => {
    if (progress === 30 && !processing) {
      captureAndDetectFace();
    } else if (progress === 70 && faceToken && !processing) {
      analyzeFaceDetails();
    } else if (progress === 100) {
      setFaceAuthSuccess(true);
    }
  }, [progress, faceToken, processing]);

  const captureAndDetectFace = async () => {
    if (!cameraRef.current || processing) return;
    
    setProcessing(true);
    try {
      // Capture image from camera
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      // Prepare form data for Face++ Detect API
      const formData = new FormData();
      formData.append('api_key', FACE_API_KEY);
      formData.append('api_secret', FACE_API_SECRET);
      formData.append('image_file', {
        uri: photo.uri,
        name: 'face.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('return_attributes', 'gender,age,emotion,beauty,skinstatus');

      // Call Face++ Detect API
      const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.faces && data.faces.length > 0) {
        // Store the first face token for analysis
        setFaceToken(data.faces[0].face_token);
      } else {
        throw new Error('No faces detected');
      }
    } catch (error) {
      console.error('Face detection failed:', error);
      Alert.alert('Error', 'Face detection failed. Please try again.');
      setProgress(0);
    } finally {
      setProcessing(false);
    }
  };

  const analyzeFaceDetails = async () => {
    if (!faceToken || processing) return;
    
    setProcessing(true);
    try {
      // Prepare form data for Face++ Analyze API
      const formData = new FormData();
      formData.append('api_key', FACE_API_KEY);
      formData.append('api_secret', FACE_API_SECRET);
      formData.append('face_tokens', faceToken);
      formData.append('return_attributes', 'gender,age,emotion,beauty,skinstatus,eyegaze,mouthstatus');

      // Call Face++ Analyze API
      const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/face/analyze', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      
      if (data.faces && data.faces.length > 0) {
        // Store face analysis results
        setFaceAnalysis(data.faces[0].attributes);
        console.log('Face analysis:', data.faces[0].attributes);
        await SecureStore.setItemAsync('user_face_token', faceToken);

      } else {
        throw new Error('Face analysis failed');
      }
    } catch (error) {
      console.error('Face analysis failed:', error);
      Alert.alert('Error', 'Face analysis failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleProceed = () => {
    router.push({
      pathname: '/sign-up/biometrics',
      params: { 
        faceScanCompleted: 'true',
        faceData: JSON.stringify(faceAnalysis)
      }
    });
  };

  useEffect(() => {
    if (isComplete || !permission?.granted) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        const nextStep = progressSteps.find(step => step.percent > prev);
      
        if (!nextStep) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }
      
        setCurrentFaceImage(nextStep.image);
        return nextStep.percent;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [isComplete, permission]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} text="Grant Permission" />
      </View>
    );
  }

  if (isComplete && faceAuthSuccess) {
    return (
      <View className="flex-1 bg-mainBlack px-5 pt-16">
        <View className="relative flex-row items-center justify-start mb-16">
          <Image
            source={LockSuccessIcon}
            className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[16px]"
            resizeMode="contain"
          />
        </View>

        <View className="items-center my-8">
          <Image
            source={FaceSuccessImage}
            className="mb-6"
            resizeMode="contain"
          />
        </View>

        <View className="items-center mb-2">
          <Text className="text-neutral100 font-sora text-sm text-center p-8">
            Your Face I.D has been successfully registered
          </Text>
        </View>

        <View className="items-center mb-8">
          <Text className="text-white font-sora-bold text-2xl">
            100%
          </Text>
        </View>

        <View className="flex-1 justify-end pb-8">
          <Button
            text="Proceed"
            onPress={handleProceed}
          />
        </View>
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
        <Image
          source={currentFaceImage}
          style={styles.faceImage}
          resizeMode="contain"
        />

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
          {currentStep.text}
        </Text>
      </View>

      <View className="items-center mt-8">
        <Text className="text-white font-sora-bold text-2xl">
          {progress}%
        </Text>
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
 faceImage: {
  width: 250,
  height: 250,
  position: 'absolute',
  top: 25,
  left: '50%',
  marginLeft: -125,
 zIndex: 1,
 },
});


export default FaceSetupScreen;