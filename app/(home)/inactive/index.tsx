import React, { useState } from "react";
//import { useRouter } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import Folder from "@/components/Folder";
import { Button } from "@/components/Button";
import TopLeft from "../../../assets/images/info.png";
import TopRight from "../../../assets/images/topright.png";
import { ExtendedModal } from "@/components/ExtendedModal";

const FolderScreen = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const folders = [
    {
      name: "Phantom Wallet",
      title: "Add Key Phrase",
      id: "phantom1",
    },
    {
      name: "Trust Wallet",
      title: "Add Key Phrase",
      id: "trust1",
    },
    {
      name: "Trust Wallet",
      title: "Add Key Phrase",
      id: "trust2",
    },
    {
      name: "Phantom Wallet",
      title: "Add Key Phrase",
      id: "phantom2",
    },
  ];

  const openModal = () => {
    setModalVisible(true);
  };


  const handleFolderPress = (folderId: string) => {
    setSelectedFolder(folderId);
    openModal();
  };

  return (
    <View className="flex-1 p-4 bg-bg-neutral800">
      <View className="absolute top-[72px] left-5">
        <Image source={TopLeft} className="w-10 h-10" resizeMode="contain" />
      </View>
      <View className="absolute top-[72px] right-5">
        <Image source={TopRight} className="w-10 h-10" resizeMode="contain" />
      </View>

      <ScrollView
        contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap" }}
        className="mt-[178px] "
      >
        {folders.map((folder) => (
          <View key={folder.id} className="w-1/2 p-2">
            <Folder
              name={folder.name}
              title={folder.title}
              selected={selectedFolder === folder.id}
              onPress={() => handleFolderPress(folder.id)}
            />
          </View>
        ))}
      </ScrollView>

      <View className="bg-[#FFFFFF0A] px-4 py-8 rounded-3xl mb-2 space-y-4">
        <View className="items-center mb-4">
          <Text className="text-white font-sora-semibold text-sm">
            Connect Wallet
          </Text>
        </View>

        <Button
          text="Add New Wallet"
          onPress={() => console.log("Add New Wallet pressed")}
        />
      </View>

      <ExtendedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        scanButtonText="Add Key Phrase"
        manualButtonText="Remove Wallet"
        onScanDevice={() => {
          console.log("Scan device pressed");
        }}
        onAddManually={() => {
          console.log("Add manually pressed");
        }}
      />
    </View>
  );
};

export default FolderScreen;