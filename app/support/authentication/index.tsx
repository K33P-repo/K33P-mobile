import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import SearchIcon from '../../../assets/images/search.png';

import { BackIcon, PHONE } from '@/assets/images/svg';
import helpContent from '@/constants/support.json';

export default function AuthenticationHelpScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  const authContent = helpContent.helpSections.find(
    section => section.section === 'Authentication'
  );
  const supportPhoneNumber = helpContent.support.phoneNumber;

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setIsKeyboardVisible(true)
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setIsKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleCallSupport = async () => {
    setIsCalling(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const phoneUrl = `tel:${supportPhoneNumber}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) await Linking.openURL(phoneUrl);
    } catch (error) {
      console.error('Failed to open phone dialer:', error);
    } finally {
      setIsCalling(false);
      closeModal();
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleFocus = () => {
    setIsKeyboardVisible(true);
  };

  const renderAuthContentItem = ({ item }: { item: any }) => (
    <View className="mb-6">
      {item.heading && (
        <Text className="text-main font-sora-bold text-sm mb-4 underline">
          {item.heading}
        </Text>
      )}
      <Text className="text-white font-sora text-sm leading-relaxed">
        {item.text}
      </Text>
    </View>
  );

  if (!authContent) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white">Content not found</Text>
      </View>
    );
  }

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <View className="mb-4 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 z-10">
          <BackIcon style={{ left: '50%', transform: [{ translateX: '-50%' }] }} />
        </TouchableOpacity>

        <View className="items-center justify-center">
          <Text className="text-sm text-white font-sora-bold mt-3">
            {authContent.title}
          </Text>
        </View>

        <TouchableOpacity onPress={openModal} className="absolute right-4 p-2">
          <PHONE style={{ left: '50%', transform: [{ translateX: '-50%' }] }} />
        </TouchableOpacity>
      </View>

      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-searchBg rounded-xl px-3 py-1">
          <Image source={SearchIcon} className="w-5 h-5 mr-2" resizeMode="contain" />
          <TextInput
            ref={searchInputRef}
            className="flex-1 ml-1 text-white font-sora text-sm"
            placeholder="Search.."
            placeholderTextColor="#B0B0B0"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim().length > 0) {
                router.push({
                  pathname: '/support/search',
                  params: { query: text, from: 'authentication' }
                });
              }
            }}
            onFocus={handleFocus}
            returnKeyType="search"
          />
        </View>
      </View>

      <View className="flex-1 px-4">
        <View className="mt-4 p-4 rounded-lg bg-[#222222] flex-1">
          <Text className="text-neutral100 text-xs font-space-mono mb-4">
            About K33P Authentication
          </Text>
          <FlatList
            data={authContent.content}
            keyExtractor={item => `auth-${item.id}`}
            renderItem={renderAuthContentItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="interactive"
            removeClippedSubviews={false}
            maxToRenderPerBatch={5}
            windowSize={5}
            initialNumToRender={5}
          />
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} className="absolute inset-0 bg-black/60" />
        <View className="flex-1 justify-center items-center">
          <View className="bg-mainBlack rounded-3xl p-6 w-4/5">
            <Text className="text-white font-sora text-sm text-center mb-6">
              {supportPhoneNumber}
            </Text>
            {isCalling ? (
              <View className="py-3 rounded-xl items-center justify-center bg-main">
                <ActivityIndicator size="small" color="#000000" />
              </View>
            ) : (
              <Button text="Call Support" onPress={handleCallSupport} />
            )}
          </View>
        </View>
      </Modal>
    </Pressable>
  );
}