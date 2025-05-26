// screens/wallet-folders.tsx
import Button from '@/components/Button';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import FolderIcon from '../../../assets/images/folder.png';
import TopLeft from '../../../assets/images/info.png';
import TopRight from '../../../assets/images/person.png';

interface Wallet {
  id: string;
  name: string;
  keyType?: '12' | '24';
}

export default function Index() {
  const [addWalletModalVisible, setAddWalletModalVisible] = useState(false);
  const [walletActionModalVisible, setWalletActionModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Initialize wallets state from params or local storage
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    try {
      // Try to get from navigation params first
      if (params.wallets) {
        return JSON.parse(params.wallets as string);
      }
      // Fallback to empty array
      return [];
    } catch (e) {
      console.error('Error parsing wallets:', e);
      return [];
    }
  });

  // Update wallets when params change (coming back from AddKey screen)
  useEffect(() => {
    if (params.updatedWallet) {
      try {
        const updatedWallet = JSON.parse(params.updatedWallet as string);
        setWallets(prevWallets => 
          prevWallets.map(w => 
            w.id === updatedWallet.id ? updatedWallet : w
          )
        );
      } catch (e) {
        console.error('Error parsing updated wallet:', e);
      }
    }
  }, [params.updatedWallet]);

  const openAddWalletModal = () => {
    setAddWalletModalVisible(true);
  };

  const closeAddWalletModal = () => {
    setAddWalletModalVisible(false);
  };

  const openWalletActionModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setWalletActionModalVisible(true);
  };

  const closeWalletActionModal = () => {
    setWalletActionModalVisible(false);
    setSelectedWallet(null);
  };

  const handleAddNewWallet = () => {
    router.push({
      pathname: '/add-manually',
      params: {
        wallets: JSON.stringify(wallets)
      }
    });
  };

  const handleRemoveWallet = () => {
    if (selectedWallet) {
      const updatedWallets = wallets.filter(w => w.id !== selectedWallet.id);
      setWallets(updatedWallets);
      closeWalletActionModal();
    }
  };

  // Group wallets into rows of 2 for the grid
  const walletRows = [];
  for (let i = 0; i < wallets.length; i += 2) {
    walletRows.push(wallets.slice(i, i + 2));
  }

  return (
    <View className="flex-1 bg-neutral800 px-4 pt-6 pb-12 relative">
      {/* Top Icons */}
      <View className="absolute top-10 left-4">
        <Image source={TopLeft} className="w-10 h-10" resizeMode="contain" />
      </View>
      <View className="absolute top-10 right-4">
        <Image source={TopRight} className="w-10 h-10" resizeMode="contain" />
      </View>

      {/* Middle Content - Wallet Folders Grid */}
      <View className="flex-1 justify-center mt-24">
        {wallets.length > 0 ? (
          <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
            {walletRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} className="flex-row justify-around mb-8">
                {row.map((wallet) => (
                  <TouchableOpacity 
                    key={wallet.id}
                    onPress={() => openWalletActionModal(wallet)}
                    className="items-center w-1/2 px-2"
                  >
                    <View className="items-center">
                      <Image 
                        source={FolderIcon} 
                        resizeMode="contain" 
                      />
                      <Text className="text-white font-sora text-base text-center mb-1 mt-5">
                        {wallet.keyType ? `${wallet.keyType} Keys` : 'Add Key Phrases'}
                      </Text>
                      <Text className="text-neutral100 font-sora text-sm text-center">
                        {wallet.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {row.length === 1 && <View className="w-1/2 px-2" />}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View className="items-center justify-center">
            <Text className="text-white font-sora-semibold text-lg text-center mb-4">
              No wallets selected yet
            </Text>
            <Text className="text-neutral400 font-sora text-sm text-center">
              Add wallets to get started
            </Text>
          </View>
        )}
      </View>

      {/* Add Wallet Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={addWalletModalVisible}
        onRequestClose={closeAddWalletModal}
      >
        <Pressable 
          onPress={closeAddWalletModal}
          className="absolute inset-0 bg-black/70"
        />
        
        <View className="flex-1 justify-center items-center">
          <View className="bg-mainBlack rounded-3xl p-6 w-4/5">
            <Text className="text-white font-sora text-sm text-center mb-6">
              How do you want to add wallet
            </Text>
            
            <View className="space-y-4 gap-4">
              <Button 
                text="Scan Device" 
                onPress={() => {
                  closeAddWalletModal();
                  router.push('/search'); 
                }}
              />
              
              <Button 
                text="Add Manually" 
                onPress={() => {
                  closeAddWalletModal();
                  router.push({
                    pathname: '/add-manually',
                    params: {
                      wallets: JSON.stringify(wallets)
                    }
                  });
                }}
                outline
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Wallet Action Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={walletActionModalVisible}
        onRequestClose={closeWalletActionModal}
      >
        <Pressable 
          onPress={closeWalletActionModal}
          className="absolute inset-0 bg-black/80"
        />
        
        <View className="flex-1 justify-center items-center">
          <View className="bg-mainBlack rounded-3xl p-6 w-4/5">
            <View className="space-y-4 gap-4">
              <Button 
                text={selectedWallet?.keyType ? 'View Key Phrases' : 'Add Key Phrases'} 
                onPress={() => {
                  closeWalletActionModal();
                  router.push({
                    pathname: "/(home)/add-key-phrases",
                    params: { 
                      walletId: selectedWallet?.id,
                      walletName: selectedWallet?.name,
                      wallets: JSON.stringify(wallets)
                    }
                  });
                }}
              />
              
              <Button 
                text="Remove Wallet" 
                onPress={handleRemoveWallet}
                danger
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Buttons */}
      <View className="bg-mainBlack px-4 py-8 rounded-3xl space-y-4">
        <View className="items-center mb-4">
          <Text className="text-white font-sora-semibold text-sm">Connect Wallet</Text>
        </View>

        <Button 
          text={wallets.length > 0 ? "Add Another Wallet" : "Add New Wallet"}
          onPress={openAddWalletModal} 
        />
      </View>
    </View>
  );
}