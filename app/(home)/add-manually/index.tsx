import { BackIcon } from '@/assets/images/svg';
import Button from '@/components/Button';
import { addWalletToFolder, createWalletData } from '@/utils/wallet-api';
import { Octicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

interface Wallet {
  id: string;
  name: string;
  keyType?: '12' | '24';
  fileId?: string;
  isCustom?: boolean;
}

const allWallets: Wallet[] = [
  { id: '1', name: 'Phantom Wallet' },
  { id: '2', name: 'Trust Wallet' },
  { id: '3', name: 'Danmask' },
  { id: '4', name: 'Quantum' },
  { id: '5', name: 'CoinKeeper' },
  { id: '6', name: 'X Wallet' },
  { id: '7', name: 'Telegram' },
  { id: '8', name: 'MetaMask' },
  { id: '9', name: 'Coinbase Wallet' },
  { id: '10', name: 'Ledger Live' },
  { id: '11', name: 'Trezor Suite' },
  { id: '12', name: 'Exodus' },
  { id: '13', name: 'Atomic Wallet' },
  { id: '14', name: 'MyEtherWallet (MEW)' },
  { id: '15', name: 'Crypto.com Defi Wallet' },
  { id: '16', name: 'Eternl Wallet' },
  { id: '17', name: 'GeroWallet' },
  { id: '18', name: 'Yoroi Wallet' },
  { id: '19', name: 'Typhon Wallet' },
  { id: '20', name: 'Lace Wallet' },
  { id: '21', name: 'Tokero Wallet' },
  { id: '22', name: 'VESPR Wallet' },
  { id: '24', name: 'Keystone' },
  { id: '25', name: 'Coinbase Wallet' },
  { id: '26', name: 'Rainbow Wallet' },
  { id: '27', name: 'Brave Wallet' },
  { id: '28', name: 'Enkrypt' },
  { id: '29', name: 'XDEFI Wallet' },
  { id: '30', name: 'Solfare' },
];

const popularWallets: Wallet[] = [
  { id: '1', name: 'Phantom Wallet' },
  { id: '2', name: 'Trust Wallet' },
  { id: '3', name: 'Danmask' },
  { id: '4', name: 'Quantum' },
  { id: '5', name: 'CoinKeeper' },
  { id: '6', name: 'X Wallet' },
  { id: '7', name: 'Telegram' },
  { id: '8', name: 'Eternl Wallet' },
  { id: '9', name: 'Lace Wallet' },
];

export default function AddManually() {
  const router = useRouter();
  const { folderId } = useLocalSearchParams();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWallets, setSelectedWallets] = useState<Wallet[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textInputRef = useRef<TextInput>(null);
  const keyboardHeightRef = useRef<number>(0);



  useEffect(() => {
    console.log('AddManually: Folder ID received:', folderId);
    if (!folderId) {
      Alert.alert('Error', 'Folder ID not found. Please go back and try again.');
    }
  }, [folderId]);



  const filteredWallets = allWallets.filter(wallet =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasExactMatch = allWallets.some(
    w => w.name.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  const [manualVisibleCount, setManualVisibleCount] = useState<number | null>(null);



  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardHeightRef.current = e.endCoordinates.height;
      console.log('⌨️ Keyboard SHOWN — height:', e.endCoordinates.height);
      setKeyboardVisible(true);
    });
  
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      console.log('⌨️ Keyboard HIDDEN');
      setKeyboardVisible(false);
    });
  
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  
  // Derive it live — reacts to every render automatically
  const visibleCount = manualVisibleCount !== null
  ? manualVisibleCount
  : searchQuery !== ''
    ? filteredWallets.length
    : 0; // 👈 no search text = 0, so button always floats when keyboard is up with empty input


  const shouldFloatButton = isKeyboardVisible && visibleCount <= 4;  
  console.log('🔘 shouldFloatButton:', shouldFloatButton, '| visibleCount:', visibleCount, '| keyboardVisible:', isKeyboardVisible);

  const toggleSearch = () => {
    isSearching ? collapseSearch() : expandSearch();
  };

  const expandSearch = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSearching(true);
      textInputRef.current?.focus();
    });
  };

  const collapseSearch = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSearching(false);
      setSearchQuery('');
    });
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  const handleProceed = () => {
    if (searchQuery.trim() && !hasExactMatch) {
      const customName = searchQuery.trim();
      const customWallet: Wallet = {
        id: `custom-${Date.now()}`,
        name: customName,
        isCustom: true,
      };
  
      setSelectedWallets(prev => {
        if (prev.some(w => w.name.toLowerCase() === customName.toLowerCase())) {
          return prev;
        }
        return [...prev, customWallet];
      });
  
      setManualVisibleCount(0); // 👈 force float after proceed
      setSearchQuery('');
      textInputRef.current?.focus();
      return;
    }
  };

  const handleFinalSubmit = async () => {
    if (!folderId) {
      Alert.alert('Error', 'Folder ID not found. Please try again.');
      return;
    }

    if (selectedWallets.length === 0) {
      Alert.alert('No Wallets Selected', 'Please select or type at least one wallet.');
      return;
    }

    setIsSubmitting(true);

    try {
      const results = await Promise.allSettled(
        selectedWallets.map(async (wallet) => {
          const walletData = createWalletData(wallet.name);
          console.log(`Adding wallet to folder ${folderId}:`, walletData);
          const result = await addWalletToFolder(folderId as string, walletData);
          if (!result.success) {
            throw new Error(result.message || `Failed to add ${wallet.name}`);
          }
          return result;
        })
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected');

      if (failed.length === 0) {
        Alert.alert(
          'Success',
          `${successful} wallet(s) added successfully!`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(home)/add-to-wallet')
            }
          ]
        );
      } else {
        const errorMsg = failed
          .map((r: any) => r.reason?.message || 'Unknown error')
          .join('\n• ');
        Alert.alert('Error', errorMsg, [{ text: 'OK' }]);
      }
    } catch (error: any) {
      console.error('Error adding wallets:', error);
      Alert.alert('Error', 'Failed to add wallets. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalletSelect = (wallet: Wallet) => {
    setSelectedWallets(prev => {
      if (prev.some(w => w.id === wallet.id)) {
        return prev.filter(w => w.id !== wallet.id);
      } else {
        return [...prev, wallet];
      }
    });

    if (!isSearching) expandSearch();
  };

  const removeSelectedWallet = (walletId: string) => {
    setSelectedWallets(prev => prev.filter(w => w.id !== walletId));
  };

  const searchOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const searchBarOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const searchBarTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 0],
  });

  // Determine button text & action
  const shouldShowProceed = searchQuery.trim() !== '' && !hasExactMatch;
  const buttonText = shouldShowProceed
    ? 'Proceed'
    : `Add ${selectedWallets.length} Wallet${selectedWallets.length !== 1 ? 's' : ''}`;

  const onButtonPress = shouldShowProceed ? handleProceed : handleFinalSubmit;

  //const shouldFloatButton = filteredWallets.length <= 4  && isKeyboardVisible;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View className="flex-1 px-5">
          {/* Header */}
          <View>
            <View className="flex-row items-center justify-start mb-4">
              <TouchableOpacity onPress={() => router.back()}>
                <BackIcon width={40} height={40} />
              </TouchableOpacity>
            </View>

            <Animated.View
              style={{
                opacity: searchBarOpacity,
                transform: [{ translateY: searchBarTranslateY }],
              }}
              className="bg-searchBg rounded-xl h-12 flex-row items-center px-4 mb-6"
            >
              <Octicons name="search" size={16} color="#B8B8B8" />
              <TextInput
                ref={textInputRef}
                className="flex-1 text-white ml-2 font-sora text-sm"
                placeholder="Search wallets..."
                placeholderTextColor="#B0B0B0"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (manualVisibleCount !== null) {
                    setManualVisibleCount(null); // 👈 back to real count once typing resumes
                  }
                }}
                onFocus={expandSearch}
              />
            </Animated.View>
          </View>

          {/* Main content */}
          <View className={`flex-1 ${!isSearching ? 'justify-end' : ''}`}>
            {/* Selected chips */}
            {isSearching && selectedWallets.length > 0 && (
              <View className="flex-row flex-wrap mb-3">
                {selectedWallets.map(wallet => (
                  <View
                    key={wallet.id}
                    className="bg-primary100 flex-row items-center rounded-full px-3 py-1 mr-2 mb-2"
                  >
                    <Text className="text-black font-sora text-xs mr-2">{wallet.name}</Text>
                    <TouchableOpacity onPress={() => removeSelectedWallet(wallet.id)}>
                      <Octicons name="x" size={12} color="black" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {isSearching ? (
              <ScrollView className="flex-1 mb-3" keyboardShouldPersistTaps="handled">
                {searchQuery !== '' ? (
                  filteredWallets.map(wallet => (
                    <TouchableOpacity
                      key={wallet.id}
                      className="flex-row justify-between items-center py-3"
                      onPress={() => handleWalletSelect(wallet)}
                    >
                      <Text className="text-white font-sora text-base">{wallet.name}</Text>
                      {selectedWallets.some(w => w.id === wallet.id) ? (
                        <MaterialIcons name="radio-button-checked" size={20} color="#FFD700" />
                      ) : (
                        <MaterialIcons name="radio-button-unchecked" size={20} color="#B0B0B0" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  selectedWallets.length === 0 && (
                    <View className="pb-4">
                      <Text className="text-neutral100 font-space-mono text-xs mb-4">Popular Searches</Text>
                      <View className="flex-row flex-wrap">
                        {popularWallets.map(wallet => (
                          <TouchableOpacity
                            key={wallet.id}
                            className="bg-neutral300 rounded-lg px-4 py-3 mr-2 mb-3"
                            onPress={() => handleWalletSelect(wallet)}
                          >
                            <Text className="text-white font-sora text-sm">{wallet.name}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )
                )}
              </ScrollView>
            ) : (
              <>
                {selectedWallets.length === 0 && (
                  <View className="flex-row justify-between items-start mb-8">
                    <Animated.Text
                      style={{ opacity: searchOpacity, flex: 1 }}
                      className="text-white font-sora-bold text-base"
                    >
                      What wallet would you like to add?
                    </Animated.Text>
                    <Animated.View style={{ opacity: searchOpacity }}>
                      <TouchableOpacity
                        onPress={toggleSearch}
                        className="bg-mainBlack p-3 rounded-full ml-4"
                      >
                        <Octicons name="search" size={18} color="#FFD700" className="-mt-2" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                )}

                {selectedWallets.length === 0 && (
                  <View className="pb-4">
                    <Text className="text-neutral100 font-space-mono text-xs mb-4">Popular Searches</Text>
                    <View className="flex-row flex-wrap">
                      {popularWallets.map(wallet => (
                        <TouchableOpacity
                          key={wallet.id}
                          className="bg-neutral300 rounded-lg px-4 py-3 mr-2 mb-3"
                          onPress={() => handleWalletSelect(wallet)}
                        >
                          <Text className="text-white font-sora text-sm">{wallet.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Button area – now with dynamic positioning */}
          {(selectedWallets.length > 0 || (isSearching && searchQuery.trim() !== '')) && (
            <View
              style={
                shouldFloatButton
                  ? {
                      position: 'absolute',
                      bottom: keyboardHeightRef.current + 16,
                      left: 20,
                      right: 20,
                      zIndex: 10,
                    }
                  : { paddingBottom: 64 }
              }
            >
              <Button
                text={isSubmitting ? "Adding Wallets..." : buttonText}
                onPress={onButtonPress}
                isDisabled={selectedWallets.length === 0 && !shouldShowProceed || isSubmitting}
                loading={isSubmitting}
              />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}