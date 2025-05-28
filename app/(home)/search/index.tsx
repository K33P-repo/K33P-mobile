import Button from '@/components/Button'; // Assuming you have a Button component
import { MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BackButton from '../../../assets/images/back.png';

const screenWidth = Dimensions.get('window').width;

const foundWallets = [
  { id: 'MetaMask', name: 'MetaMask' },
  { id: 'Trust Wallet', name: 'Trust Wallet' },
];

export default function SearchPage() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWallets, setSelectedWallets] = useState<string[]>([]); // Store IDs of selected wallets

  useEffect(() => {
    // Set a timeout to open the modal after 5 seconds
    const timer = setTimeout(() => {
      setModalVisible(true);
    }, 5000); // 5000 milliseconds = 5 seconds

    // Clear the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const handleAddManually = () => {
    setModalVisible(false);
    router.push('/add-manually');
  };
  
  const handleProceed = () => {
    if (isProceedButtonDisabled) return;
  
    const selected = foundWallets.filter(wallet => selectedWallets.includes(wallet.id));
    setModalVisible(false);
    
    router.push({
      pathname: '/(home)/add-to-wallet',
      params: {
        wallets: JSON.stringify(selected),
      },
    });
    
  };
  

  const handleWalletSelect = (walletId: string) => {
    setSelectedWallets(prevSelected => {
      if (prevSelected.includes(walletId)) {
        // If already selected, unselect it
        return prevSelected.filter(id => id !== walletId);
      } else {
        // If not selected, add it
        return [...prevSelected, walletId];
      }
    });
  };

  const isProceedButtonDisabled = selectedWallets.length === 0;

  return (
    <View className="flex-1 bg-[#181818] pt-12">
      {/* Back Button */}
      <View className="absolute top-12 left-5 z-10">
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={BackButton}
            className="w-10 h-10"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
  
      {/* Centered Text */}
      <View className="flex-1 justify-center items-center px-8 z-10">
        <Text className="text-white font-sora text-sm text-center leading-relaxed px-8">
          K33P is scanning for active wallets on your device
        </Text>
      </View>
  
      <View
        style={{
          position: 'absolute',
          bottom: -200, 
          width: screenWidth,
          zIndex: 1,
        }}
      >
        <Video
          source={require('../../../assets/animation/search-animate.mp4')}
          shouldPlay
          isLooping
          resizeMode="cover"
          style={{
            width: screenWidth,
            height: 550,
          }}
        />
      </View>
  
      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/70"
          onPress={() => setModalVisible(false)}
        >
          <View
            className="bg-mainBlack rounded-t-3xl pt-4 px-6"
            style={{ height: '70%' }}
            onStartShouldSetResponder={() => true}
          >
            <View className="w-16 h-1 bg-white rounded-full self-center mb-4" />
  
            <Text className="text-white font-sora-bold text-sm text-center mb-6 px-8">
              Choose from your list of active wallet to store Key Phrase
            </Text>
  
            <ScrollView className="flex-1">
              {foundWallets.map(wallet => (
                <TouchableOpacity
                  key={wallet.id}
                  className="flex-row items-center gap-3 py-3"
                  onPress={() => handleWalletSelect(wallet.id)}
                >
                  {selectedWallets.includes(wallet.id) ? (
                    <MaterialIcons name="radio-button-checked" size={20} color="#FFD700" />
                  ) : (
                    <MaterialIcons name="radio-button-unchecked" size={20} color="#B0B0B0" />
                  )}
                  <Text className="text-white font-sora text-base">{wallet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
  
            <View className="pb-8 pt-4 gap-y-5">
              <Button text="Add Manually" onPress={handleAddManually} outline />
              <Button text="Proceed" onPress={handleProceed} isDisabled={isProceedButtonDisabled} />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
  
}