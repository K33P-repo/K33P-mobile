import { useRouter } from "expo-router";
import {React, useState}from "react";
import { View, Text, SafeAreaView, Image, TouchableOpacity } from "react-native";
import PersonBig from '../../../assets/images/PersonBig.png'
import  Search from '../../../assets/images/Group 2284.png'
import { WalletModal } from "@/components/WalletModal";


export default function ScanWalletsScreen() {
  const [modalVisible, setModalVisible] = useState(false)
  const router = useRouter();

  const openModal = () => {
    setModalVisible(true)
  }

    const handleScanDevice = () => {
    setModalVisible(false)
    router.push('/(home)/scanning')
  }

  const handleAddManually = () => {
    setModalVisible(false)
    router.push('/(home)/manual')
  }
  return (
    <SafeAreaView className="flex-1 bg-[#1A1A1A] justify-center items-center relative">
      <TouchableOpacity className="absolute top-[64px] left-5 " onPress={openModal}>
        <Image source={PersonBig} className="w-10 h-10" resizeMode="contain" />
      </TouchableOpacity>
      <View className="absolute top-[319px] left-[54px] w-[260px] h-[42px] justify-center items-center border">
        <Text className="text-white font-sora-medium text-[14px] leading-[21px] tracking-[0] text-center">
          K33P is scanning for active wallets on your device
        </Text>
        
   <TouchableOpacity onPress={() => router.push('/(home)/walletSelectionScreen')}>
    <Text className="text-lg font-semibold text-center text-white">
      Add Wallet Manually
    </Text>
  </TouchableOpacity>
  <TouchableOpacity onPress={() => router.push('/(home)/inactive')}>
    <Text className="text-lg font-semibold text-center text-white">
      Add Wallet Manually
    </Text>
  </TouchableOpacity>
      </View>
      
      <View >
        <Image source={Search} className="w-[520px] h-[300px] mt-[424px]" resizeMode="contain" />
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
