import Button from '@/components/Button'; // Assuming you have a Button component
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import BackButton from '../../../assets/images/back.png';
import SearchAnimateImage from '../../../assets/images/search-animate.png';

// Dummy data for found wallets (now only two as requested)
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
    <View className="flex-1 bg-neutral800 px-5 pt-12">
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
      <View className="flex-1 justify-center items-center px-8">
        <Text className="text-white font-sora text-sm text-center leading-relaxed">
          K33P is scanning for active wallets on your device
        </Text>
      </View>

      {/* Image at the Bottom */}
      <View className="justify-end items-center">
        <Image
          source={SearchAnimateImage}
          resizeMode="contain"
        />
      </View>

      {/* --- Found Wallets Modal --- */}
      <Modal
        animationType="slide" // Slide from bottom
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
            {/* Draggable Line (white line centered at the top) */}
            <View className="w-16 h-1 bg-white rounded-full self-center mb-4" />

            {/* Modal Title/Text */}
            <Text className="text-white font-sora-bold text-sm text-center mb-6 px-8">
            Choose from your list of active wallet to store Key Phrase
            </Text>

            {/* Wallets List (no borders) */}
            <ScrollView className="flex-1">
              {foundWallets.map(wallet => (
                <TouchableOpacity
                  key={wallet.id}
                  className="flex-row items-center  gap-3 py-3" // Removed border-b and border-neutral700
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

            {/* Proceed Button */}
            <View className="pb-8 pt-4 gap-y-5">
            <Button 
  text="Add Manually" 
  onPress={() => handleAddManually()}
  outline
/>

<Button
  text="Proceed"
  onPress={() => handleProceed()}
  isDisabled={isProceedButtonDisabled}
/>

            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}