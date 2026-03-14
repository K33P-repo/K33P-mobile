import { BackIcon, PHONE } from '@/assets/images/svg';
import Button from '@/components/Button';
import helpContent from '@/constants/support.json';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SearchIcon from '../../../assets/images/search.png';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ITEM_WIDTH = screenWidth * 0.91;
const ITEM_SPACING = screenWidth * 0.02;

interface SearchResult {
  id: number;
  section: string;
  title: string;
  route: string;
  highlightedContent: JSX.Element[];
}

const highlightText = (text: string, query: string): JSX.Element => {
  if (!query) return <Text className="text-white">{text}</Text>;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <Text className="text-white">
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Text key={i} className="text-main">{part}</Text>
        ) : (
          part
        )
      )}
    </Text>
  );
};

const SearchResultCard = memo(
  ({
    item,
    index,
    isActive,
    onPress,
  }: {
    item: SearchResult;
    index: number;
    isActive: boolean;
    onPress: (route: string) => void;
  }) => (
    <View
      style={{
        width: ITEM_WIDTH,
        marginRight: ITEM_SPACING,
        marginLeft: index === 0 ? -ITEM_SPACING / 2 : 0,
        backgroundColor: '#222222',
        borderRadius: 12,
        opacity: isActive ? 1 : 0.6,
        height: screenHeight * 0.68,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(item.route)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text className="text-neutral100 font-space-mono text-xs">
          About K33P {item.title}
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={true}
        indicatorStyle="white"
        scrollEnabled={isActive}
        nestedScrollEnabled={false}
        bounces={Platform.OS === 'ios'}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
      >
        {item.highlightedContent}
      </ScrollView>
    </View>
  )
);

SearchResultCard.displayName = 'SearchResultCard';

export default function SupportSearchScreen() {
  const { query = '', from = 'support' } = useLocalSearchParams<{ query: string; from: string }>();

  const [searchQuery, setSearchQuery] = useState(query);
  const [searchCurrent, setSearchCurrent] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!searchQuery.trim()) {
      router.back();
    }
  }, [searchQuery, router]);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    helpContent.helpSections.forEach((section) => {
      const hasMatch = section.content.some((c) => {
        const full = (c.heading || '') + ' ' + c.text;
        return full.toLowerCase().includes(lowerQuery);
      });

      if (hasMatch) {
        const highlighted = section.content.map((c, i) => (
          <View key={i} className="mb-5">
            {c.heading && (
              <Text className="text-main font-sora-bold text-sm mb-2 underline">
                {highlightText(c.heading, searchQuery)}
              </Text>
            )}
            <Text className="text-white font-sora text-sm leading-6">
              {c.id === 1 ? (
                <>
                  <Text className="text-main">
                    {highlightText('K33P', searchQuery)}
                  </Text>
                  {highlightText(c.text.substring(4), searchQuery)}
                </>
              ) : (
                highlightText(c.text, searchQuery)
              )}
            </Text>
          </View>
        ));

        results.push({
          id: helpContent.helpSections.findIndex((s) => s.section === section.section) + 1,
          section: section.section,
          title: section.title,
          route: `/support/${section.section.toLowerCase().replace(' ', '-')}`,
          highlightedContent: highlighted,
        });
      }
    });

    // Sort results based on the source screen
    return results.sort((a, b) => {
      const fromLower = from.toLowerCase();
      
      // If from support center, prioritize Account first
      if (fromLower === 'support') {
        if (a.section === 'Account') return -1;
        if (b.section === 'Account') return 1;
        return 0;
      }
      
      // For specific screens, prioritize that section
      if (fromLower.includes('account') && a.section === 'Account') return -1;
      if (fromLower.includes('account') && b.section === 'Account') return 1;
      
      if (fromLower.includes('authentication') && a.section === 'Authentication') return -1;
      if (fromLower.includes('authentication') && b.section === 'Authentication') return 1;
      
      if (fromLower.includes('payment') && a.section === 'Payment') return -1;
      if (fromLower.includes('payment') && b.section === 'Payment') return 1;
      
      if ((fromLower.includes('lite') || fromLower.includes('lightpaper')) && a.section === 'Lightpaper') return -1;
      if ((fromLower.includes('lite') || fromLower.includes('lightpaper')) && b.section === 'Lightpaper') return 1;
      
      if ((fromLower.includes('vault') || fromLower.includes('recovery')) && a.section === 'Vault Access') return -1;
      if ((fromLower.includes('vault') || fromLower.includes('recovery')) && b.section === 'Vault Access') return 1;
      
      return 0;
    });
  }, [searchQuery, from]);

  useEffect(() => {
    setSearchCurrent(0);
    flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [searchResults]);

  const goToPrev = useCallback(() => {
    if (searchCurrent <= 0) return;
    const next = searchCurrent - 1;
    setSearchCurrent(next);
    flatListRef.current?.scrollToIndex({ index: next, animated: true, viewPosition: 0 });
  }, [searchCurrent]);

  const goToNext = useCallback(() => {
    if (searchCurrent >= searchResults.length - 1) return;
    const next = searchCurrent + 1;
    setSearchCurrent(next);
    flatListRef.current?.scrollToIndex({ index: next, animated: true, viewPosition: 0 });
  }, [searchCurrent, searchResults.length]);

  const navigateToResult = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const renderCard = useCallback(
    ({ item, index }: { item: SearchResult; index: number }) => (
      <SearchResultCard
        item={item}
        index={index} 
        isActive={index === searchCurrent}
        onPress={navigateToResult}
      />
    ),
    [searchCurrent, navigateToResult]
  );

  const getHeaderTitle = () => {
    const fromLower = from.toLowerCase();
    if (fromLower.includes('account')) return 'Account';
    if (fromLower.includes('authentication')) return 'Authentication';
    if (fromLower.includes('payment')) return 'Payment';
    if (fromLower.includes('lite') || fromLower.includes('lightpaper')) return 'Lite Paper';
    if (fromLower.includes('vault') || fromLower.includes('recovery')) return 'Vault Access';
    return 'Support Center';
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const supportPhoneNumber = helpContent.support.phoneNumber;

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

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <View className="flex-1">
        
        {/* Header */}
        <View className="mb-4 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-4 z-10">
            <BackIcon style={{ left: '50%', transform: [{ translateX: '-50%' }] }} />
          </TouchableOpacity>

          <View className="items-center justify-center">
            <Text className="text-sm text-white font-sora-bold mt-3">
              {getHeaderTitle()}
            </Text>
          </View>

          <TouchableOpacity onPress={openModal} className="absolute right-4 p-2">
            <PHONE style={{ left: '50%', transform: [{ translateX: '-50%' }] }} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center bg-searchBg rounded-xl px-3 py-1">
            <Image source={SearchIcon} className="w-5 h-5 mr-2" resizeMode="contain" />
            <TextInput
              ref={inputRef}
              className="flex-1 text-white font-sora text-sm"
              placeholder="Search..."
              placeholderTextColor="#B0B0B0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={false}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Results area */}
        {searchQuery.trim() ? (
          searchResults.length > 0 ? (
            <View className="flex-1">
              <FlatList
                ref={flatListRef}
                data={searchResults}
                horizontal
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => `result-${item.id}`}
                renderItem={renderCard}
                getItemLayout={(_, index) => ({
                  length: ITEM_WIDTH + ITEM_SPACING,
                  offset: (ITEM_WIDTH + ITEM_SPACING) * index,
                  index,
                })}
                contentContainerStyle={{
                  paddingLeft: 20,
                  paddingRight: ITEM_SPACING,
                }}
                initialNumToRender={1}
                maxToRenderPerBatch={2}
                windowSize={3}
              />

              <View className="flex-row items-center justify-between px-5 mt-2 mb-8">
                <TouchableOpacity
                  onPress={goToPrev}
                  activeOpacity={0.7}
                  disabled={searchCurrent === 0}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="chevron-back-outline"
                    size={20}
                    color={searchCurrent === 0 ? '#555' : '#fff'}
                  />
                </TouchableOpacity>

                <View className="flex-row gap-3 items-center bg-neutral700 rounded-full px-4 py-2">
                  {searchResults.map((_, index) => (
                    <View
                      key={index}
                      style={{
                        width: index === searchCurrent ? 16 : 8,
                        height: 8,
                        borderRadius: 8,
                        backgroundColor: index === searchCurrent ? '#ffffff' : '#B0B0B0',
                      }}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={goToNext}
                  activeOpacity={0.7}
                  disabled={searchCurrent === searchResults.length - 1}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name="chevron-forward-outline"
                    size={20}
                    color={searchCurrent === searchResults.length - 1 ? '#555' : '#fff'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center px-8">
              <Text className="text-neutral200 font-sora text-sm text-center">
                No results found for "{searchQuery}"
              </Text>
            </View>
          )
        ) : (
          <View className="flex-1 justify-center items-center px-8">
            <Text className="text-neutral300 font-sora text-base text-center">
              Start typing to search
            </Text>
          </View>
        )}
      </View>

      {/* Phone modal */}
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