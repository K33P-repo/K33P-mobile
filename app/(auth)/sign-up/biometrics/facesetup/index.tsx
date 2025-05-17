import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useFaceDetector } from 'vision-camera-face-detector';

const FaceScanScreen = () => {
  const devices = useCameraDevices();
  const device = devices.front;
  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const { width } = Dimensions.get('window');
  const circleSize = width * 0.7;

  // Face detection
  const { faces } = useFaceDetector(camera, {
    tracking: true,
    performanceMode: 'fast',
  });

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  // Progress animation
  useEffect(() => {
    if (isScanning && faces.length > 0) {
      const newProgress = Math.min(100, scanProgress + 0.5);
      setScanProgress(newProgress);
    }
  }, [faces]);

  if (!hasPermission) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Camera permission required</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Loading camera...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={camera}
        className="absolute inset-0"
        device={device}
        isActive={true}
        photo={false}
      />

      {/* Circular overlay */}
      <View className="absolute inset-0 justify-center items-center bg-black/50">
        <View 
          className="border-2 border-neutral-200/30 rounded-full justify-center items-center"
          style={{ width: circleSize, height: circleSize }}
        >
          {/* Progress indicator - replace with your preferred animation */}
          {isScanning && (
            <View 
              className="absolute border-2 border-blue-500 rounded-full"
              style={{
                width: circleSize * 0.9,
                height: circleSize * 0.9,
                transform: [{ rotate: `${scanProgress * 3.6}deg` }]
              }}
            />
          )}

          {/* Face detection feedback */}
          {faces.length > 0 && (
            <Text className="text-white text-xl font-bold">
              {Math.round(scanProgress)}%
            </Text>
          )}
        </View>
      </View>

      {/* Controls */}
      <View className="absolute bottom-10 w-full items-center">
        {!isScanning ? (
          <Button 
            title="Start Scan" 
            onPress={() => setIsScanning(true)}
            className="bg-blue-500 px-6 py-3 rounded-full"
          />
        ) : (
          <Button 
            title={scanProgress >= 100 ? "Continue" : "Cancel"} 
            onPress={() => scanProgress >= 100 ? router.back() : setIsScanning(false)}
            className={`px-6 py-3 rounded-full ${scanProgress >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
          />
        )}
      </View>
    </View>
  );
};

export default FaceScanScreen;