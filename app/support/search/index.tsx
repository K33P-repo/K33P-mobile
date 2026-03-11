import { BackIcon } from '@/assets/images/svg';
import helpContent from '@/constants/support.json';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Keyboard,
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
        height: screenHeight * 0.66,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(item.route)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#333',
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
          paddingTop: 12,
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
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  // Focus input on mount → keyboard opens automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // small delay helps on some Android devices

    return () => clearTimeout(timer);
  }, []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];

    helpContent.helpSections.forEach((section) => {
      const hasMatch = section.content.some((c) => {
        const full = (c.heading || '') + ' ' + c.text;
        return full.toLowerCase().includes(searchQuery.toLowerCase());
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

    return results;
  }, [searchQuery]);

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

  // Back button: always go back (standard behavior)
  // If input is empty → back goes back immediately
  const handleBack = () => {
    router.back();
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <View className="flex-1">
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity onPress={handleBack}>
            <BackIcon />
          </TouchableOpacity>

          <Text className="text-white font-sora-bold text-base">
            {getHeaderTitle()}
          </Text>

          <View style={{ width: 24 }} />
        </View>

        {/* Search Input – pre-filled + auto-focus */}
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
              autoFocus={false} // controlled by useEffect above
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

              <View className="flex-row items-center justify-between px-6 py-6">
                <TouchableOpacity
                  onPress={goToPrev}
                  disabled={searchCurrent === 0}
                  activeOpacity={0.7}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Ionicons
                    name="chevron-back-outline"
                    size={36}
                    color={searchCurrent === 0 ? '#444' : '#fff'}
                  />
                </TouchableOpacity>

                <View className="flex-row gap-4 items-center bg-neutral800 rounded-full px-6 py-3">
                  {searchResults.map((_, idx) => (
                    <View
                      key={idx}
                      style={{
                        width: idx === searchCurrent ? 14 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: idx === searchCurrent ? '#fff' : '#666',
                      }}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  onPress={goToNext}
                  disabled={searchCurrent === searchResults.length - 1}
                  activeOpacity={0.7}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Ionicons
                    name="chevron-forward-outline"
                    size={36}
                    color={searchCurrent === searchResults.length - 1 ? '#444' : '#fff'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center px-8">
              <Text className="text-neutral200 font-sora text-base text-center">
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
    </Pressable>
  );
}