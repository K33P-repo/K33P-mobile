import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Button } from "@/components/Button";
import { useRouter } from 'expo-router';

type WalletModalProps = {
  visible: boolean;
  onClose: () => void;
  onScanDevice: () => void;
  onAddManually: () => void;
  scanButtonText?: string;    
  manualButtonText?: string;   
};

export const ExtendedModal = ({
  visible,
  onClose,
  scanButtonText = "Scan Device",  // Default value
  manualButtonText = "Add Manually" // Default value
}: WalletModalProps) => {
    const router = useRouter();

    const handleSeedPhrase = () => {
        onClose();
        router.push('/(home)/seedphrase');
    };

    const handleRemove = () => {
      console.log("reomoved");
    }



    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50 relative items-center"
                activeOpacity={1}
                onPressOut={onClose}
            >
                <View className="bg-mainBlack absolute top-[180px] left-[20px] w-[335px] rounded-[24px] pt-6 pr-4 pb-6 pl-4 gap-4">
                    <Text className="text-white text-center font-sora-medium text-[14px] leading-[21px] tracking-[0]">
                        How do you want to add wallet
                    </Text>

                    <View className="flex flex-col gap-2">
                        <Button 
                            text={scanButtonText}  // Use the prop here
                            onPress={handleSeedPhrase} 
                            outline={false} 
                        />

                        <Button
                            text={manualButtonText}  // Use the prop here
                            onPress={handleRemove}
                            outline={true}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};