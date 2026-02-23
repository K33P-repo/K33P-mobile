// LightpaperHelpScreen.tsx
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SearchIcon from '../../../assets/images/search.png';

import { BackIcon, PHONE } from '@/assets/images/svg';
import helpContent from '@/constants/support.json';

interface SearchResult {
  id: number;
  section: string;
  title: string;
  route: string;
  highlightedContent: JSX.Element[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ITEM_WIDTH = screenWidth * 0.91;
const ITEM_SPACING = screenWidth * 0.02;

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

// ─── Reusable isolated card (same as Account & Payment) ───────────────────────
const SearchResultCard = React.memo(
  ({
    item,
    isActive,
    onPress,
  }: {
    item: SearchResult;
    isActive: boolean;
    onPress: (route: string) => void;
  }) => (
    <View
      style={{
        width: ITEM_WIDTH,
        marginRight: ITEM_SPACING,
        backgroundColor: '#222222',
        borderRadius: 12,
        opacity: isActive ? 1 : 0.6,
        height: screenHeight * 0.7,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(item.route)}
        style={{ paddingHorizontal: 16, paddingVertical: 12 }}
      >
        <Text className="text-neutral100 font-space-mono text-xs">
          About K33P {item.title}
        </Text>
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator
        scrollEnabled={isActive}
        keyboardShouldPersistTaps="handled"
      >
        {item.highlightedContent}
      </ScrollView>
    </View>
  )
);

SearchResultCard.displayName = 'SearchResultCard';

// ─── Main component ───────────────────────────────────────────────────────────
export default function LightpaperHelpScreen() {
  const router = useRouter();
  const [searchCurrent, setSearchCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const searchFlatListRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);

  const lightpaperContent = helpContent.helpSections.find(
    (section) => section.section === 'Lightpaper'
  );
  const supportPhoneNumber = helpContent.support.phoneNumber;

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
          <View key={i} className="mb-4">
            {c.heading && (
              <Text
                className="text-main font-sora-bold text-sm mb-2"
                style={{ textDecorationLine: 'underline' }}
              >
                {highlightText(c.heading, searchQuery)}
              </Text>
            )}
            <Text className="text-white font-sora text-sm leading-relaxed">
              {c.id === 1 ? (
                <>
                  <Text className="text-main">{highlightText('K33P', searchQuery)}</Text>
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

    // Prioritize Lightpaper section
    return results.sort((a, b) => {
      if (a.section === 'Lightpaper') return -1;
      if (b.section === 'Lightpaper') return 1;
      return 0;
    });
  }, [searchQuery]);

  useEffect(() => {
    setSearchCurrent(0);
  }, [searchResults]);

  const goToPrev = useCallback(() => {
    if (searchCurrent === 0) return;
    const next = searchCurrent - 1;
    setSearchCurrent(next);
    searchFlatListRef.current?.scrollToIndex({ index: next, animated: true });
  }, [searchCurrent]);

  const goToNext = useCallback(() => {
    if (searchCurrent === searchResults.length - 1) return;
    const next = searchCurrent + 1;
    setSearchCurrent(next);
    searchFlatListRef.current?.scrollToIndex({ index: next, animated: true });
  }, [searchCurrent, searchResults.length]);

  const navigateToSearchResult = useCallback((route: string) => {
    router.push(route);
  }, [router]);

  const renderSearchResultItem = useCallback(
    ({ item, index }: { item: SearchResult; index: number }) => (
      <SearchResultCard
        item={item}
        isActive={index === searchCurrent}
        onPress={navigateToSearchResult}
      />
    ),
    [searchCurrent, navigateToSearchResult]
  );

  const renderLightpaperContentItem = useCallback(({ item }: { item: any }) => (
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
  ), []);

  if (!lightpaperContent) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-white">Content not found</Text>
      </View>
    );
  }

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const handleCallSupport = async () => {
    setIsCalling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
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
      {/* Header */}
      <View className="mb-4 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="absolute left-4 z-10">
          <BackIcon style={{ left: '50%', transform: [{ translateX: '-50%' }] }} />
        </TouchableOpacity>

        <View className="items-center justify-center">
          <Text className="text-sm text-white font-sora-bold mt-3">
            {lightpaperContent.title}
          </Text>
        </View>

        <TouchableOpacity onPress={openModal} className="absolute right-4 p-2">
          <PHONE style={{ left: '50%', transform: [{ translateX: '-50%' }] }} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View className="px-4 mb-4">
        <View className="flex-row items-center bg-searchBg rounded-xl px-3 py-1">
          <Image source={SearchIcon} className="w-5 h-5 mr-2" resizeMode="contain" />
          <TextInput
            ref={searchInputRef}
            className="flex-1 ml-1 text-white font-sora text-sm"
            placeholder="Search.."
            placeholderTextColor="#B0B0B0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Main content area */}
      {searchQuery ? (
        searchResults.length > 0 ? (
          <View className="flex-1">
            <FlatList
              ref={searchFlatListRef}
              data={searchResults}
              horizontal
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => `search-${item.section}-${item.id}`}
              renderItem={renderSearchResultItem}
              getItemLayout={(_, index) => ({
                length: ITEM_WIDTH + ITEM_SPACING,
                offset: (ITEM_WIDTH + ITEM_SPACING) * index,
                index,
              })}
              contentContainerStyle={{ paddingLeft: 20, paddingRight: ITEM_SPACING }}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews={false}
            />

            {/* Arrow navigation */}
            <View className="flex-row items-center justify-between px-4 mt-4 mb-8">
              <TouchableOpacity
                onPress={goToPrev}
                activeOpacity={0.7}
                disabled={searchCurrent === 0}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={24}
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
                  size={24}
                  color={searchCurrent === searchResults.length - 1 ? '#555' : '#fff'}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-neutral200 font-sora text-sm text-center">
              No results found for "{searchQuery}"
            </Text>
          </View>
        )
      ) : (
        <View className="flex-1 px-4">
          <View className="mt-4 p-4 rounded-lg bg-[#222222] flex-1">
            <Text className="text-neutral100 text-xs font-space-mono mb-4">
              About K33P Lightpaper
            </Text>
            <FlatList
              data={lightpaperContent.content}
              keyExtractor={(item) => `lightpaper-${item.id}`}
              renderItem={renderLightpaperContentItem}
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
      )}

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