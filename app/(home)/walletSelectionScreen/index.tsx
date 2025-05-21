import React, { useState } from "react";
import { View, Text } from "react-native";
import WalletOption from "@/components/walletOption";
import { Button } from "@/components/Button";
import { useRouter } from "expo-router";

const WalletSelectionScreen = () => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const router = useRouter();

  const handleManual = () => {
    router.push('/(home)/manual'); // Navigate to manual add screen
  };

  const openNext = () => {
    console.log("next");
  }

  return (
    <View className="flex-1 bg-mainBlack p-4 h-[674px] ">
      <View className="flex-1 ">
        <View className="absolute top-[36px] text-center w-[290px] ml-4">
          <Text
            className="text-center h-[20px] font-sora-bold text-[14px] leading-[14px] text-white"
            style={{ fontWeight: "700" }}
          >
            Choose from your list of active wallet to
          </Text>
          <Text
            className="text-center h-[20px] font-sora-bold text-[14px] leading-[14px]  text-white"
            style={{ fontWeight: "700" }}
          >
            store Key Phrase
          </Text>
        </View>

        <View className=" absolute top-[104px] left-5 mb-8">
          {/* Phantom Wallet - with radio button */}
          <WalletOption
            name="Phantom Wallet"
            showRadio={true}
            onSelect={() => setSelectedWallet("phantom")}
            selected={selectedWallet === "phantom"}
          />

          {/* Trust Wallet - with radio button */}
          <WalletOption
            name="Trust Wallet"
            selected={selectedWallet === "trust"}
            onSelect={() => setSelectedWallet("trust")}
          />
        </View>
      </View>
      <View className="absolute top-[507px] left-5 right-5 py-3 rounded-xl w-full items-center justify-center">
        <Button text="Add Manually" onPress={handleManual} outline={true} />
      </View>
      <View className="absolute top-[565px] left-5 right-5 py-3 rounded-xl w-full items-center justify-center">
        <Button 
          text="Proceed" 
          onPress={openNext} 
          isDisabled={!selectedWallet} 
          customColor={selectedWallet ? "#FFD939" : undefined}
        />
      </View> 
    </View>
  );
};

export default WalletSelectionScreen;

