// components/ContactSupportModal.tsx
import Button from '@/components/Button';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';

const SUPPORT_EMAIL = 'k33p_onchain@outlook.com';

type ContactSupportModalProps = {
    visible: boolean;
    onClose: () => void;
    email?: string; // optional override, defaults to SUPPORT_EMAIL
};

export default function ContactSupportModal({
    visible,
    onClose,
    email = SUPPORT_EMAIL,
}: ContactSupportModalProps) {
    const [isSending, setIsSending] = useState(false);

    const handleContactSupport = async () => {
        setIsSending(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const mailUrl = `mailto:${email}`;
            const supported = await Linking.canOpenURL(mailUrl);

            if (supported) {
                await Linking.openURL(mailUrl);
            } else {
                console.error('No email app available to handle this request');
            }
        } catch (error) {
            console.error('Failed to open email app:', error);
        } finally {
            setIsSending(false);
            onClose();
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                className="absolute inset-0 bg-black/60"
            />
            <View className="flex-1 justify-center items-center">
                <View className="bg-mainBlack rounded-3xl p-6 w-4/5">
                    <Text className="text-white font-sora text-sm text-center mb-6">
                        {email}
                    </Text>
                    {isSending ? (
                        <View className="py-3 rounded-xl items-center justify-center bg-main">
                            <ActivityIndicator size="small" color="#000000" />
                        </View>
                    ) : (
                        <Button
                            text="Contact Support"
                            onPress={handleContactSupport}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
}