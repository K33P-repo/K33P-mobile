import Button from '@/components/Button';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.7;
const SCAN_DURATION = 5000; // 5 seconds for full scan

export default function FaceScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faces, setFaces] = useState<any[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Start face scan with progress animation
  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SCAN_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setIsComplete(true);
        setIsScanning(false);
      }
    });
  };

  // Reset scan
  const resetScan = () => {
    progressAnim.setValue(0);
    setIsScanning(false);
    setIsComplete(false);
    setScanProgress(0);
  };

  // Handle face detection
  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    setFaces(faces);
    if (faces.length > 0 && isScanning && !isComplete) {
      const newProgress = Math.min(100, scanProgress + 0.5); // Increment progress
      setScanProgress(newProgress);
    }
  };

  // Check camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) return <View />;
  if (hasPermission === false) return <Text>No camera access</Text>;

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        type={Camera.Constants.Type.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
          minDetectionInterval: 100,
        }}
      >
        {/* Overlay with circular mask */}
        <View style={styles.overlay}>
          <View style={[styles.circleOutline, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}>
            {/* Animated progress ring */}
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.progressRing}>
              <Circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={CIRCLE_SIZE / 2 - 5}
                stroke={isComplete ? '#4CAF50' : '#6200EE'}
                strokeWidth={4}
                strokeDasharray={[2 * Math.PI * (CIRCLE_SIZE / 2 - 5)]}
                strokeDashoffset={2 * Math.PI * (CIRCLE_SIZE / 2 - 5) * (1 - scanProgress / 100)}
                fill="transparent"
              />
            </Svg>

            {/* Face feedback */}
            {faces.length > 0 && (
              <View style={styles.faceFeedback}>
                <Text style={styles.progressText}>{Math.round(scanProgress)}%</Text>
              </View>
            )}

            {/* Scan complete checkmark */}
            {isComplete && (
              <View style={styles.completeIndicator}>
                <Text style={styles.completeText}>✓</Text>
              </View>
            )}
          </View>
        </View>
      </Camera>

      {/* Controls */}
      <View style={styles.controls}>
        {!isScanning && !isComplete ? (
          <Button text="Start Scan" onPress={startScan} />
        ) : isComplete ? (
          <Button text="Done" onPress={() => console.log('Scan complete!')} />
        ) : (
          <Button text="Cancel" onPress={resetScan} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  circleOutline: {
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  progressRing: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  faceFeedback: {
    position: 'absolute',
  },
  progressText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  completeIndicator: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
});