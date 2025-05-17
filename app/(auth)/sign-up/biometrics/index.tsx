import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LockIcon2 from '../../../../assets/images/lock-3.png';

import Method1Image from '../../../../assets/images/Method1Image.png';
import Method2Image from '../../../../assets/images/Method2Image.png';
import Method3Image from '../../../../assets/images/Method3Image.png';
import Method4Image from '../../../../assets/images/Method4Image.png';

export default function Biometrics() {
  const router = useRouter();
  const [isBiometric, setIsBiometric] = useState(false); // Initially false

  const methods = [
    {
      name: 'Face Scan',
      image: Method1Image,
      route: 'sign-up/biometrics/facescan',
      isCompleted: false,
    },
    {
      name: 'Fingerprint',
      image: Method2Image,
      route: 'sign-up/biometrics/fingerprint',
      isCompleted: false, 
    },
    {
      name: 'Voice ID',
      image: Method3Image,
      route: 'sign-up/biometrics/voiceid',
      isCompleted: false,
    },
    {
      name: 'Iris Scan',
      image: Method4Image,
      route: 'sign-up/biometrics/iris',
      isCompleted: false, 
    },
  ];

  const handleMethodPress = (route: string) => {
    setIsBiometric(true); // Set biometric as selected
    router.push(route);
  };

  return (
    <View className="flex-1 bg-neutral800 px-5 pt-14">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-16">
        <Image
          source={LockIcon2}
          className="absolute left-1/2 transform -translate-x-1/2 w-[88px] h-[88px]"
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View className="flex-1 px-2">
        <Text className="text-white font-sora-bold text-sm mb-2">
          Set up the third security layer to your Safe
        </Text>
        <Text className="text-neutral200 font-sora text-sm mb-12">
          Register only one extra layer to continue. You can always register more later
        </Text>

        {/* Image Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          {methods.map((method, index) => {
            const opacityClass = method.isCompleted ? 'opacity-10' : 'opacity-100';

            return (
              <TouchableOpacity
                key={index}
                className={`w-[48%] items-center bg-neutral700 p-4 rounded-xl ${opacityClass}`}
                onPress={() => handleMethodPress(method.route)}
                disabled={method.isCompleted} // Optional: prevent clicking completed
              >
                <Image
                  source={method.image}
                  className="w-32 h-32 mb-5"
                  resizeMode="contain"
                />
                <Text className="text-neutral200 font-sora text-center text-base">
                  {method.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Proceed Button */}
      <View className="pb-8">
        <Button
          text="Proceed"
          onPress={() => router.push('/sign-up/pinsetup')}
          isDisabled={!isBiometric}
        />
      </View>
    </View>
  );
}
