import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import FaceScan0 from '../../../../../assets/images/facescan-0.png';
import FaceScan30 from '../../../../../assets/images/facescan-1.png';
import FaceScan70 from '../../../../../assets/images/facescan-2.png';
import FaceScan100 from '../../../../../assets/images/facescan-3.png';
import FaceSuccessImage from '../../../../../assets/images/facesuccess.png';
import LockIcon from '../../../../../assets/images/lock-3.png';
import LockSuccessIcon from '../../../../../assets/images/lock-4.png';

const FaceScanScreen = () => {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentFaceImage, setCurrentFaceImage] = useState(FaceScan0);

  // Progress steps with corresponding images and text
  const progressSteps = [
    { percent: 0, image: FaceScan0, text: "Keep your face in the center until the registration is complete" },
    { percent: 30, image: FaceScan30, text: "Keep your face in the center until the registration is complete" },
    { percent: 70, image: FaceScan70, text: "Keep your face in the center until the registration is complete" },
    { percent: 100, image: FaceScan100, text: "Scan complete" }
  ];

  const currentStep = progressSteps.find(step => step.percent === progress) || progressSteps[0];

  // Simulate face scan progress
  useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        // Find the next progress step
        const nextStep = progressSteps.find(step => step.percent > prev);
        
        if (!nextStep) {
          clearInterval(timer);
          setIsComplete(true);
          return 100;
        }
        
        // Update the face image
        setCurrentFaceImage(nextStep.image);
        return nextStep.percent;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(timer);
  }, [isComplete]);

  const handleProceed = () => {
    // Navigate back to biometrics with completion status
    router.push({
      pathname: '/sign-up/biometrics',
      params: { faceScanCompleted: 'true' }
    });
  };

  // Success screen
  if (isComplete) {
    return (
      <View className="flex-1 bg-mainBlack px-5 pt-16">
        {/* Header with success lock icon */}
        <View className="relative flex-row items-center justify-start mb-16">
          <Image
            source={LockSuccessIcon}
            className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[16px]"
            resizeMode="contain"
          />
        </View>

        {/* Success image */}
        <View className="items-center my-8">
          <Image 
            source={FaceSuccessImage} 
            className="mb-6" 
            resizeMode="contain" 
          />
        </View>

        {/* Success message */}
        <View className="items-center mb-2">
          <Text className="text-neutral100 font-sora text-sm text-center p-8">
            Your Face I.D has been successfully registered
          </Text>
        </View>

        {/* Progress percentage */}
        <View className="items-center mb-8">
          <Text className="text-white font-sora-bold text-2xl">
            100%
          </Text>
        </View>

        {/* Continue button */}
        <View className="flex-1 justify-end pb-8">
          <Button
            text="Proceed"
            onPress={handleProceed}
          />
        </View>
      </View>
    );
  }

  // Scanning screen
  return (
    <View className="flex-1 bg-neutral800 px-5 pt-12">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-4">
        <Image
          source={LockIcon}
          className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[16px]"
          resizeMode="contain"
        />
      </View>

      {/* Face scan image (changes with progress) */}
      <View className="items-center my-8">
        <Image 
          source={currentFaceImage} 
          className="mb-10" 
          resizeMode="contain" 
        />
      </View>

      {/* Instruction text */}
      <View className="items-center mb-2">
        <Text className="text-neutral100 font-sora text-sm text-center px-7">
          {currentStep.text}
        </Text>
      </View>

      {/* Progress percentage */}
      <View className="items-center mt-8">
        <Text className="text-white font-sora-bold text-2xl">
          {progress}%
        </Text>
      </View>
    </View>
  );
};

export default FaceScanScreen;