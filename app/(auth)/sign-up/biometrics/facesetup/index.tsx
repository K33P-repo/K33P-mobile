import Button from '@/components/Button';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import FaceScan0 from '../../../../../assets/images/facescan-0.png';
import FaceScan30 from '../../../../../assets/images/facescan-1.png';
import FaceScan70 from '../../../../../assets/images/facescan-2.png';
import FaceScan100 from '../../../../../assets/images/facescan-3.png';
import FaceSuccessImage from '../../../../../assets/images/facesuccess.png';
import LockIcon from '../../../../../assets/images/lock-3.png';
import LockSuccessIcon from '../../../../../assets/images/lock-4.png';

const FaceSetupScreen = () => {
 const router = useRouter();
 const [progress, setProgress] = useState(0);
 const [isComplete, setIsComplete] = useState(false);
 const [currentFaceImage, setCurrentFaceImage] = useState(FaceScan0);
 const [permission, requestPermission] = useCameraPermissions();
 const [facing] = useState<CameraType>('front');
 const [faceAuthSuccess, setFaceAuthSuccess] = useState(false);
 const [biometricType, setBiometricType] = useState<string | null>(null);

 const progressSteps = [
  { percent: 0, image: FaceScan0, text: "Keep your face in the center until the registration is complete" },
  { percent: 30, image: FaceScan30, text: "Keep your face in the center until the registration is complete" },
  { percent: 70, image: FaceScan70, text: "Keep your face in the center until the registration is complete" },
  { percent: 100, image: FaceScan100, text: "Scan complete" }
 ];

 const currentStep = progressSteps.find(step => step.percent === progress) || progressSteps[0];

 useEffect(() => {
  const checkBiometrics = async () => {
   const compatible = await LocalAuthentication.hasHardwareAsync();
   if (!compatible) {
    console.log('Device does not support biometrics');
    return;
   }

   const enrolled = await LocalAuthentication.isEnrolledAsync();
   if (!enrolled) {
    console.log('No biometrics enrolled');
    return;
   }

   const supported = await LocalAuthentication.supportedAuthenticationTypesAsync();
   if (supported.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    setBiometricType('face');
   } else if (supported.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    setBiometricType('fingerprint');
   }
  };

  checkBiometrics();
 }, []);

 useEffect(() => {
  if (!permission?.granted) {
   requestPermission();
  }
 }, []);

 const handleFaceIdAuth = async () => {
  try {
   const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Verify your face to complete registration',
    disableDeviceFallback: true,
    cancelLabel: 'Cancel',
    requireConfirmation: Platform.OS === 'ios',
    fallbackLabel: '',
   });

   if (result.success) {
    setFaceAuthSuccess(true);
   } else {
    setProgress(70);
    setIsComplete(false);
   }
  } catch (error) {
   console.error('Face ID error:', error);
   setProgress(70);
   setIsComplete(false);
  }
 };
 useEffect(() => {
  if (progress === 100 && biometricType === 'face') {
    handleFaceIdAuth();
  } else if (progress === 100) {
    setFaceAuthSuccess(true);
  }
}, [progress, biometricType]);


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

 useEffect(() => {
  if (progress === 100 && biometricType === 'face') {
   handleFaceIdAuth();
  } else if (progress === 100) {
   setFaceAuthSuccess(true);
  }
 }, [progress, biometricType]);

 const handleProceed = () => {
  router.push({
   pathname: '/sign-up/biometrics',
   params: { faceScanCompleted: 'true' }
  });
 };

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