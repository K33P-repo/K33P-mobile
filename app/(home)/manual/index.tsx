import { WalletModal } from "@/components/WalletModal";
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import {
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  TextInput,
  Dimensions,
} from "react-native";
import PersonBig from "../../../assets/images/PersonBig.png";
import Search from "../../../assets/images/S.png";
import { Button } from "@/components/Button";

const wallets = [
  { id: "1", name: "Phantom Wallet" },
  { id: "2", name: "Trust Wallet" },
  { id: "3", name: "Dannask" },
  { id: "4", name: "Quantum" },
  { id: "5", name: "Coinkeeper" },
  { id: "6", name: "X Wallet" },
  { id: "7", name: "Telegram" },
];

export default function AddWalletScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const router = useRouter();

  const screenWidth = Dimensions.get("window").width;
  // Calculate width to fit screen: screen width - left position (20px) - right position (20px)
  const searchBarExpandedWidth = screenWidth - 40;

  const searchBarWidth = useRef(new Animated.Value(40)).current;
  const searchBarOpacity = useRef(new Animated.Value(0)).current;
  const textInputRef = useRef<TextInput>(null);

  const openModal = () => {
    setModalVisible(true);
  };

  const handleScanDevice = () => {
    setModalVisible(false);
    router.push("/(home)/scanning");
  };

  const handleAddManually = () => {
    setModalVisible(false);
    router.push("/(home)/manual");
  };

  const toggleSearch = () => {
    if (isSearchActive) {
      Animated.parallel([
        Animated.timing(searchBarWidth, {
          toValue: 40,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => setIsSearchActive(false));
    } else {
      setIsSearchActive(true);
      Animated.parallel([
        Animated.timing(searchBarWidth, {
          toValue: searchBarExpandedWidth,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(searchBarOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => {
        textInputRef.current?.focus();
      });
    }
  };



  return (
    <SafeAreaView className="flex-1 bg-[#1A1A1A]">
      {/* Back Arrow / Profile Icon */}
      <TouchableOpacity
        className="absolute top-[64px] left-5"
        onPress={isSearchActive ? toggleSearch : openModal}
      >
        <Image source={PersonBig} className="w-10 h-10" resizeMode="contain" />
      </TouchableOpacity>

      <View className="flex-1 px-6 pt-8">
        {!isSearchActive ? (
          <>
            {/* Initial View (First Screenshot) */}
            <View className="absolute top-[535px] left-[20px] w-[335.1px]">
              <Text className="text-white font-sora-medium text-[16px] leading-[30px]">
                What wallet would you like to add,
              </Text>
              <Text className="text-white font-sora-medium text-[16px] leading-[30px]">
                John
              </Text>
            </View>

            {/* Search Icon */}
            <TouchableOpacity
              className="w-[40px] h-[40px] absolute top-[550px] left-[310px] bg-[#1A1A1A]"
              onPress={toggleSearch}
            >
              <Image source={Search} className="w-full h-full" />
            </TouchableOpacity>

            {/* Popular Searches Label */}
            <Text className="absolute top-[600px] left-[20px] text-neutral100 font-sora-medium text-[12px] leading-[21px]">
              Popular Searches
            </Text>

            {/* Wallet Grid */}
            <View className="absolute top-[625px] left-[20px] w-[250px]">
              <View className="flex-row flex-wrap gap-1">
                {wallets.map((item) => (
                  <View key={item.id}>
                    <TouchableOpacity className="bg-neutral300 rounded-[8px] py-[8px] px-[10px]">
                      <Text className="text-white font-sora-medium text-[14px] leading-[21px] text-center">
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Search View (Second Screenshot) */}
            <View className="absolute top-[148px] left-[20px] right-[20px]">
              <Animated.View
                className="h-[45px] rounded-[12px] bg-[#2A2A2A] flex-row items-center px-[12px]"
                style={{ width: searchBarWidth }}
              >
                <TouchableOpacity onPress={toggleSearch}>
                  <Image source={Search} className="w-5 h-5 mr-2" />
                </TouchableOpacity>
                <Animated.View 
                  style={{ opacity: searchBarOpacity, flex: 1 }}
                >
                  <TextInput
                    ref={textInputRef}
                    className="text-white font-sora-medium text-[16px] w-full"
                    autoFocus={true}
                  />
                </Animated.View>
              </Animated.View>
            </View>

            {/* Popular Searches Label */}
            <Text className="absolute top-[200px] left-[20px] text-neutral-300 font-sora-medium text-[12px] leading-[21px]">
              Popular Searches
            </Text>

            {/* Wallet Grid */}
            <View className="absolute top-[225px] left-[20px] w-[290px]">
              <View className="flex-row flex-wrap gap-1">
                {wallets.map((item) => (
                  <View key={item.id}>
                    <TouchableOpacity className="bg-neutral300 rounded-[8px] py-[8px] px-[10px]">
                      <Text className="text-white font-sora-medium text-[14px] leading-[21px] text-center">
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Proceed Button */}
            <View className="absolute top-[703px] left-[20px] w-[350px]  w-full">
              <Button
                text="Proceed"
                onPress={() => router.push("/")}
                isDisabled={true}
                customColor="#666666"
              />
            </View>
          </>
        )}
      </View>

      <WalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScanDevice={handleScanDevice}
        onAddManually={handleAddManually}
      />
    </SafeAreaView>
  );
}