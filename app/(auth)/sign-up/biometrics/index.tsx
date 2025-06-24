import Button from '@/components/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import LockIcon2 from '../../../../assets/images/lock-3.png';
import Method1Image from '../../../../assets/images/Method1Image.png';
import Method2Image from '../../../../assets/images/Method2Image.png';
import Method3Image from '../../../../assets/images/Method3Image.png';
import Method4Image from '../../../../assets/images/Method4Image.png';

export default function Biometrics() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isBiometric, setIsBiometric] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [methods, setMethods] = useState([
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
  ]);

  const [activeAuth, setActiveAuth] = useState(['Phone Number', 'Fingerprint', 'PIN']);
  const [inactiveAuth, setInactiveAuth] = useState(['Face I.D', 'Iris Scan']);

  const hasCompletedMethod = methods.some(method => method.isCompleted);

  useEffect(() => {
    if (params.faceScanCompleted === 'true') {
      setMethods(prevMethods => {
        if (prevMethods[0].isCompleted) return prevMethods;
        return prevMethods.map(method =>
          method.name === 'Face Scan' ? { ...method, isCompleted: true } : method
        );
      });
      setIsBiometric(true);
    }
  }, [params.faceScanCompleted]);

  useEffect(() => {
    if (params.fingerprintCompleted === 'true') {
      setMethods(prevMethods => {
        if (prevMethods[1].isCompleted) return prevMethods;
        return prevMethods.map(method =>
          method.name === 'Fingerprint' ? { ...method, isCompleted: true } : method
        );
      });
      setIsBiometric(true);
    }
  }, [params.fingerprintCompleted]);
  
  const handleMethodPress = (route: string) => {
    setIsBiometric(true);
    router.push(route);
  };

  const toggleAuth = (method: string, isActive: boolean) => {
    if (method === 'Face Scan' || method === 'OTP') return;

    if (isActive) {
      setActiveAuth(prev => prev.filter(m => m !== method));
      setInactiveAuth(prev => [...prev, method]);
    } else {
      if (activeAuth.length < 3) {
        setInactiveAuth(prev => prev.filter(m => m !== method));
        setActiveAuth(prev => [...prev, method]);
      }
    }
  };

  const handleProceed = () => {
    setShowModal(false);
    router.push('/sign-up/did-creation');
  };

  const closeModal = () => setShowModal(false);

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
                disabled={method.isCompleted}
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
          text={hasCompletedMethod ? "Do Later" : "Proceed"}
          onPress={() => hasCompletedMethod ? setShowModal(true) : router.push('/sign-up/pinsetup')}
          isDisabled={!isBiometric}
        />
      </View>

      {/* Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 bg-neutral800/90 justify-end">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              className="w-full"
            >
              <TouchableWithoutFeedback onPress={() => {}}>
                <View className="bg-neutral800 rounded-t-3xl h-[73%]">
                  {/* Handle bar */}
                  <TouchableOpacity className="items-center pt-3" onPress={closeModal}>
                    <View className="w-12 h-1 bg-neutral100 rounded-full" />
                  </TouchableOpacity>

                  {/* Title */}
                  <Text className="text-white font-sora-bold text-xl text-center mt-6">
                    Authentication Paths
                  </Text>

                  {/* Active Authentication */}
                  <View className="px-6 mt-8">
                    <Text className="text-neutral200 font-sora text-sm mb-4">
                      Active Authentication Path
                    </Text>

                    {activeAuth.map((method, index) => (
                      <TouchableOpacity
                        key={index}
                        className="flex-row items-center py-3"
                        onPress={() => toggleAuth(method, true)}
                        disabled={method === 'Face Scan'}
                      >
                        <MaterialIcons
                          name={method === 'Face Scan' ? 'radio-button-checked' : 'radio-button-on'}
                          size={24}
                          color={method === 'Face Scan' ? '#FFD700' : '#FFD700'}
                        />
                        <Text className="text-white font-sora ml-3">{method}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Inactive Authentication */}
                  <View className="px-6 mt-8">
                    <Text className="text-neutral200 font-sora text-sm mb-4">
                      Inactive Authentication Path
                    </Text>

                    {inactiveAuth.map((method, index) => (
                      <TouchableOpacity
                        key={index}
                        className="flex-row items-center py-3"
                        onPress={() => toggleAuth(method, false)}
                      >
                        <MaterialIcons
                          name="radio-button-off"
                          size={24}
                          color="white"
                        />
                        <Text className="text-white font-sora ml-3">{method}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Note */}
                  <Text className="text-neutral200 font-sora text-sm text-center px-6 mt-8">
                    Note: 'Face Scan' (OTP) is required and cannot be removed.
                  </Text>

                  {/* Proceed Button */}
                  <View className="px-6 mt-8 mb-8">
                    <Button
                      text="Proceed"
                      onPress={handleProceed}
                      isDisabled={activeAuth.length !== 3}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}
