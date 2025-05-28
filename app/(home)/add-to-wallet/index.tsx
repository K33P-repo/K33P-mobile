import Button from '@/components/Button';
import { getStoredWallets, addWallets as storageAddWallets, storeWallets } from '@/utils/storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, // Import Alert for user feedback
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
  fileId?: string; // fileId is crucial for deletion
}

export default function Index() {
  const [addWalletModalVisible, setAddWalletModalVisible] = useState(false);
  const [walletActionModalVisible, setWalletActionModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('WalletFolders - Navigation params:', params);
    if (params.updatedWallet) {
      console.log('WalletFolders - Updated Wallet from params:', JSON.parse(params.updatedWallet as string));
    }
    if (params.newWallets) {
      console.log('WalletFolders - New Wallets from params:', JSON.parse(params.newWallets as string));
    }
  }, [params]);

  useFocusEffect(
    useCallback(() => {
      console.log('WalletFolders - useFocusEffect: Loading wallets from storage...');
      const loadData = async () => {
        const savedWallets = await getStoredWallets();
        console.log('WalletFolders - Wallets loaded from storage:', savedWallets);
        setWallets(savedWallets);
      };
      loadData();

      return () => {};
    }, [])
  );

  useEffect(() => {
    if (params.updatedWallet) {
      try {
        const updatedWallet = JSON.parse(params.updatedWallet as string) as Wallet;
        console.log('WalletFolders - Processing updatedWallet param:', updatedWallet);

        const updateAndSave = async () => {
          const currentWallets = await getStoredWallets();
          const newWallets = currentWallets.map((wallet) =>
            wallet.id === updatedWallet.id
              ? { ...wallet, keyType: updatedWallet.keyType, fileId: updatedWallet.fileId }
              : wallet
          );
          await storeWallets(newWallets);
          console.log('WalletFolders - Wallet updated and saved to storage. Triggering re-render.');
          setWallets(newWallets);
        };
        updateAndSave();

      } catch (e) {
        console.error('WalletFolders - Error parsing updated wallet from params:', e);
      }
    }
  }, [params.updatedWallet]);

  useEffect(() => {
    if (params.newWallets) {
      try {
        const newlyAddedWallets: Wallet[] = JSON.parse(params.newWallets as string);
        console.log('WalletFolders - Processing newWallets param:', newlyAddedWallets);

        const addAndSave = async () => {
          const updatedWallets = await storageAddWallets(newlyAddedWallets);
          console.log('WalletFolders - New wallets added and saved to storage. Triggering re-render.');
          setWallets(updatedWallets);
        };
        addAndSave();

      } catch (e) {
        console.error('WalletFolders - Error parsing new wallets from params:', e);
      }
    }
  }, [params.newWallets]);

  const openAddWalletModal = () => setAddWalletModalVisible(true);
  const closeAddWalletModal = () => setAddWalletModalVisible(false);

  const openWalletActionModal = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setWalletActionModalVisible(true);
  };

  const closeWalletActionModal = () => {
    setSelectedWallet(null);
    setWalletActionModalVisible(false);
  };

  const handleRemoveWallet = async () => {
    if (!selectedWallet) return;

    // Optional: Ask for confirmation before deleting
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to remove ${selectedWallet.name} and its associated key phrases? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => closeWalletActionModal(), // Close modal on cancel
        },
        {
          text: "Delete",
          onPress: async () => {
            console.log('WalletFolders - Attempting to remove wallet:', selectedWallet.name);

            // Step 1: Attempt to delete the file from the backend if fileId exists
            if (selectedWallet.fileId) {
              try {
                const response = await fetch('https://k33p-backend.onrender.com/api/v1/vault/delete', {
                  method: 'DELETE', // Use DELETE method as per API spec
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ file_id: selectedWallet.fileId }),
                });

                const responseData = await response.json();

                if (response.ok && responseData.status === 'success') {
                  console.log('WalletFolders - File deleted from backend successfully:', responseData.message);
                  Alert.alert('Success', 'Key phrases deleted from backend.');
                } else {
                  console.error('WalletFolders - Failed to delete file from backend:', responseData.message || 'Unknown error');
                  Alert.alert('Error', `Failed to delete key phrases from backend: ${responseData.message || 'Please try again.'}`);
                  // Decide if you want to proceed with local deletion even if backend fails
                  // For now, we'll proceed with local deletion as the wallet should be removed from the app anyway.
                }
              } catch (error) {
                console.error('WalletFolders - Network or API error during file deletion:', error);
                Alert.alert('Error', 'Network error or server unreachable during key phrase deletion. Please check your connection.');
                // Proceed with local deletion
              }
            } else {
              console.log('WalletFolders - No fileId found for wallet, skipping backend deletion.');
            }

            // Step 2: Remove the wallet from local storage
            const updatedWallets = wallets.filter(w => w.id !== selectedWallet.id);
            setWallets(updatedWallets);
            await storeWallets(updatedWallets); // Ensure removal is persisted locally
            console.log('WalletFolders - Wallets after local removal and save:', updatedWallets);
            closeWalletActionModal();
          },
          style: "destructive", // Make the Delete button red/warning color
        },
      ]
    );
  };

  const walletRows = [];
  for (let i = 0; i < wallets.length; i += 2) {
    walletRows.push(wallets.slice(i, i + 2));
  }

  return (
    <View className="flex-1 bg-neutral800 px-4 pt-6 pb-12 relative">
      <View className="absolute top-10 left-4">
        <Image source={TopLeft} className="w-10 h-10" resizeMode="contain" />
      </View>
      <View className="absolute top-10 right-4">
        <Image source={TopRight} className="w-10 h-10" resizeMode="contain" />
      </View>

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
                      <Image source={FolderIcon} resizeMode="contain" />
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

      <Modal
        animationType="fade"
        transparent
        visible={addWalletModalVisible}
        onRequestClose={closeAddWalletModal}
      >
        <Pressable onPress={closeAddWalletModal} className="absolute inset-0 bg-black/70" />
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
                  });
                }}
                outline
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={walletActionModalVisible}
        onRequestClose={closeWalletActionModal}
      >
        <Pressable onPress={closeWalletActionModal} className="absolute inset-0 bg-black/80" />
        <View className="flex-1 justify-center items-center">
          <View className="bg-mainBlack rounded-3xl p-6 w-4/5">
            <View className="space-y-4 gap-4">
            <Button
                text={selectedWallet?.keyType ? 'View Key Phrases' : 'Add Key Phrases'}
                onPress={() => {
                  closeWalletActionModal();
                  if (selectedWallet?.keyType) {
                    router.push({
                      pathname: "/(home)/view-key-phrases",
                      params: {
                        fileId: selectedWallet?.fileId || '',
                      }
                    });
                  } else {
                    router.push({
                      pathname: "/(home)/add-key-phrases",
                      params: {
                        walletId: selectedWallet?.id,
                        walletName: selectedWallet?.name,
                        walletFileId: selectedWallet?.fileId || '',
                        walletKeyType: selectedWallet?.keyType || '',
                      }
                    });
                  }
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