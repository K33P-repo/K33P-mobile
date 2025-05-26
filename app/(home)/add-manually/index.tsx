import Button from '@/components/Button';
import { Octicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import BackButton from '../../../assets/images/back.png';

interface Wallet {
  id: string;
  name: string;
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
];

const popularWallets: Wallet[] = [
  { id: '1', name: 'Phantom Wallet' },
  { id: '2', name: 'Trust Wallet' },
  { id: '3', name: 'Danmask' },
  { id: '4', name: 'Quantum' },
  { id: '5', name: 'CoinKeeper' },
  { id: '6', name: 'X Wallet' },
  { id: '7', name: 'Telegram' },
];

export default function AddManually() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWallets, setSelectedWallets] = useState<Wallet[]>([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const textInputRef = useRef<TextInput>(null);

  React.useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const filteredWallets = allWallets.filter(wallet =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    router.push({
      pathname: '/(home)/add-to-wallet',
      params: { 
        wallets: JSON.stringify(selectedWallets) 
      }
    });
  };

  const handleWalletSelect = (wallet: Wallet) => {
    setSelectedWallets(prevSelected => {
      if (prevSelected.some(w => w.id === wallet.id)) {
        return prevSelected.filter(w => w.id !== wallet.id);
      } else {
        return [...prevSelected, wallet];
      }
    });
    if (!isSearching) expandSearch();
  };

  const removeSelectedWallet = (walletId: string) => {
    setSelectedWallets(selectedWallets.filter(w => w.id !== walletId));
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

  // Calculate dynamic padding top for the scroll view content
  const getScrollViewContentPaddingTop = () => {
    let basePadding = 100; // Default padding below search bar
    if (isSearching && selectedWallets.length > 0) {
      basePadding = 0; // Adjust for selected tags height
    }
    return basePadding;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-neutral800"
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View className="flex-1 px-5">
          {/* Header Area (Back button and Animated Search Input) */}
          <View className="relative flex-row items-center justify-start pt-12 pb-4 h-16">
            <TouchableOpacity onPress={() => router.back()}>
              <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
            </TouchableOpacity>

            <Animated.View
              style={{
                position: 'absolute',
                opacity: searchBarOpacity,
                transform: [{ translateY: searchBarTranslateY }],
                top: 100, // Position it below the back button area
                left: 0,
                right: 0,
                zIndex: 10, // Ensure search bar stays above other content
              }}
              className="bg-mainBlack rounded-xl h-12 flex-row items-center px-4"
            >
              <Octicons name="search" size={16} color="#B8B8B8" />
              <TextInput
                ref={textInputRef}
                className="flex-1 text-white ml-2 font-sora text-sm"
                placeholder="Search wallets..."
                placeholderTextColor="#B0B0B0"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={expandSearch}
              />
            </Animated.View>
          </View>

          {/* Main Content Area */}
          <View className={`flex-1 ${!isSearching ? 'justify-end' : ''}`}>
            {/* Selected Wallets - Visible only when searching and if any wallets are selected */}
            {isSearching && selectedWallets.length > 0 && (
              <View className="flex-row flex-wrap mb-3 mt-28">
                {selectedWallets.map(wallet => (
                  <View key={wallet.id} className="bg-primary100 flex-row items-center rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-black font-sora text-xs mr-2">{wallet.name}</Text>
                    <TouchableOpacity onPress={() => removeSelectedWallet(wallet.id)}>
                      <Octicons name="x" size={12} color="black" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Conditional Content: Search Results OR Initial State/Popular Searches */}
            {isSearching ? (
              <>
                {/* ScrollView for both filtered results and popular searches when searching */}
                <ScrollView
                  className="flex-1"
                  contentContainerStyle={{ paddingTop: getScrollViewContentPaddingTop() }}
                  keyboardShouldPersistTaps="handled"
                >
                  {searchQuery !== '' ? (
                    // Display filtered wallets ONLY when a search query is present
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
                    // If searching but query is empty, show Popular Searches (only if no selected items)
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
              </>
            ) : (
              // Display initial content (question and popular searches) when not searching
              <>
                {selectedWallets.length === 0 && ( // Only show question if no selected wallets
                  <View className="flex-row justify-between items-start mb-8">
                    <Animated.Text
                      style={{ opacity: searchOpacity, flex: 1 }}
                      className="text-white font-sora-bold text-base"
                    >
                      What wallet would you like to add,{'\n'}John?
                    </Animated.Text>
                    <Animated.View style={{ opacity: searchOpacity }}>
                      <TouchableOpacity
                        onPress={toggleSearch}
                        className="bg-mainBlack p-3 rounded-full ml-4"
                      >
                        <Octicons name="search" size={18} color="#FFD700" />
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                )}

                {selectedWallets.length === 0 && ( // Only show popular searches if no selected wallets
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

          {/* Proceed Button - Updated visibility logic */}
          {(selectedWallets.length > 0 || (isSearching && searchQuery !== '')) && (
            <View className="pb-6">
              <Button
          text="Proceed"
          onPress={handleProceed}
          isDisabled={selectedWallets.length === 0}
        />
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}