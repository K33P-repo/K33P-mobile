import Button from '@/components/Button';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import SearchIcon from '../../assets/images/search.png';

import { BackIcon, PHONE } from '@/assets/images/svg';
import Carousel, { Slide } from '@/components/Carousel';
import DraggableBottomSheet, { DraggableBottomSheetRef } from '@/components/Draggablebottomsheet';
import helpContent from '@/constants/support.json';

interface SupportItem {
  id: number;
  title: string;
  expanded: boolean;
  route: string;
  content: {
    firstWord: string;
    heading: string;
    text: string;
  };
}

interface SearchResult {
  id: number;
  section: string;
  title: string;
  route: string;
  highlightedContent: JSX.Element[];
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const supportItems: SupportItem[] = [
  {
    id: 1,
    title: 'Account',
    expanded: false,
    route: '/support/account',
    content: {
      firstWord: 'K33P',
      heading: 'About K33P Account',
      text: 'is a self-custodial digital vault that... '
    }
  },
  {
    id: 2,
    title: 'Authentication',
    expanded: false,
    route: '/support/authentication',
    content: {
      firstWord: 'K33P',
      heading: 'About K33P Authentication',
      text: 'is a self-custodial digital vault that helps you securely store and recover your...'
    }
  },
  {
    id: 3,
    title: 'Payment',
    expanded: false,
    route: '/support/payment',
    content: {
      firstWord: 'K33P',
      heading: 'About K33P Payment',
      text: 'monetizes through a tiered, modular...'
    }
  },
  {
    id: 4,
    title: 'Lite Paper',
    expanded: false,
    route: '/support/lightpaper',
    content: {
      firstWord: 'K33P',
      heading: 'About K33P Lightpaper',
      text: 'is a cutting-edge digital safe designed for securely managing cryptocurrency wallet...'
    }
  },
  {
    id: 5,
    title: 'Vault Access & Recovery',
    expanded: false,
    route: '/support/vault-access',
    content: {
      firstWord: 'Loss of device - ',
      heading: 'About K33P Vault access & Recovery',
      text: 'You can reinstall K33P on a new device and recover your vault by... '
    }
  }
];

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

export default function SupportScreen() {
  const [searchCurrent, setSearchCurrent] = useState(0);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<SupportItem[]>(supportItems);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const router = useRouter();
  const searchFlatListRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);

  // DraggableBottomSheet ref for carousel modal
  const carouselSheetRef = useRef<DraggableBottomSheetRef>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Phone modal — kept exactly as original
  const [modalVisible, setModalVisible] = useState(false);
  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const supportPhoneNumber = '+2348135005000';
  const [isCalling, setIsCalling] = useState(false);

  const handleCallSupport = async () => {
    setIsCalling(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const phoneUrl = `tel:${supportPhoneNumber}`;
      const supported = await Linking.canOpenURL(phoneUrl);
      
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        console.error("Phone calls are not supported on this device");
      }
    } catch (error) {
      console.error('Failed to open phone dialer:', error);
    } finally {
      setIsCalling(false);
      closeModal();
    }
  };

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, expanded: !item.expanded }
        : { ...item, expanded: false }
    ));
  };

  const navigateToItem = (route: string) => {
    router.push(route);
  };

  const filterItems = (query: string) => {
    if (!query) {
      return supportItems.map(item => ({ ...item, expanded: false }));
    }
    return supportItems.filter(item => 
      item.title.toLowerCase().includes(query.toLowerCase())
    ).map(item => ({ ...item, expanded: false }));
  };

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setItems(filterItems(query));
      return;
    }

    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    helpContent.helpSections.forEach(section => {
      const hasMatchingContent = section.content.some(contentItem => {
        const fullText = (contentItem.heading || '') + ' ' + contentItem.text;
        return fullText.toLowerCase().includes(lowerQuery);
      });

      if (hasMatchingContent) {
        const highlightedContent = section.content.map((contentItem, index) => {
          return (
            <View key={index} className="mb-4">
              {contentItem.heading && (
                <Text className="text-main font-sora-bold text-sm mb-2" style={{textDecorationLine: 'underline'}}>
                  {highlightText(contentItem.heading, query)}
                </Text>
              )}
              <Text className="text-white font-sora text-sm leading-relaxed">
                {contentItem.id === 1 ? (
                  <>
                    <Text className="text-main">
                      {highlightText('K33P', query)}
                    </Text>
                    {highlightText(contentItem.text.substring(4), query)}
                  </>
                ) : (
                  highlightText(contentItem.text, query)
                )}
              </Text>
            </View>
          );
        });

        results.push({
          id: helpContent.helpSections.findIndex(s => s.section === section.section) + 1,
          section: section.section,
          title: section.title,
          route: `/support/${section.section.toLowerCase().replace(' ', '-')}`,
          highlightedContent
        });
      }
    });

    setSearchResults(results);
    setItems([]);
  };

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setItems(filterItems(searchQuery));
    }
  }, [searchQuery]);

  const onSearchViewRef = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setSearchCurrent(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const openCarouselModal = useCallback((item: Slide) => {
    setSelectedSlide(item);
    setTimeout(() => carouselSheetRef.current?.open(), 0);
  }, []);

  const closeCarouselModal = useCallback(() => {
    carouselSheetRef.current?.close();
  }, []);

  const navigateToSearchResult = (route: string) => {
    router.push(route);
  };

  const renderSearchResultItem = useCallback(({ item, index }: { item: SearchResult; index: number }) => {
    return (
      <View
        style={{
          width: ITEM_WIDTH,
          marginRight: ITEM_SPACING,
          backgroundColor: '#222222',
          borderRadius: 12,
          opacity: index === searchCurrent ? 1 : 0.6,
          height: screenHeight * 0.66,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigateToSearchResult(item.route)}
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
        
        <FlatList
          data={item.highlightedContent}
          keyExtractor={(_, idx) => `content-${item.id}-${idx}`}
          renderItem={({ item: content }) => content}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          scrollEnabled={index === searchCurrent}
          nestedScrollEnabled={true}
          bounces={true}
          removeClippedSubviews={false}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
        />
      </View>
    );
  }, [searchCurrent, navigateToSearchResult]);

  return (
    <TouchableWithoutFeedback onPress={() => {
      if (isKeyboardVisible) {
        Keyboard.dismiss();
      }
    }}>
      <View className="flex-1">
        {/* Header - Fixed Position */}
        <View className="mb-4 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="absolute left-4 z-10">
            <BackIcon
              style={{
                left: '50%',
                transform: [{ translateX: '-50%' }],
              }}
            />
          </TouchableOpacity>

          <View className="items-center justify-center">
            <Text className='text-sm text-white font-sora-bold mt-3'>
              Support Center
            </Text>
          </View>

          <TouchableOpacity 
            onPress={openModal}
            className="absolute right-4 p-2"
          >
            <PHONE
              style={{
                left: '50%',
                transform: [{ translateX: '-50%' }],
              }}
            />
          </TouchableOpacity>
        </View>

        <View className="flex-1">
        <View className="px-4 mb-4">
        <View className="flex-row items-center bg-searchBg rounded-xl px-3 py-1">
          <Image 
            source={SearchIcon} 
            className="w-5 h-5 mr-2" 
            resizeMode="contain" 
          />
          <TextInput
            ref={searchInputRef}
            className="flex-1 text-white font-sora text-sm"
            placeholder="Search..."
            placeholderTextColor="#B0B0B0"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.trim().length > 0) {
                router.push({
                  pathname: '/support/search',
                  params: { query: text, from: 'support' } // ← pass origin
                });
              }
            }}
            onFocus={() => {
              setIsKeyboardVisible(true);
              // If empty → go back (optional – depends on your preference)
            /*   if (searchQuery.trim() === '') {
                router.back();
              } */
            }}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>
          {/* Search Results Carousel */}
          {searchQuery && searchResults.length > 0 && (
            <View className="flex-1">
              <View>
                <FlatList
                  ref={searchFlatListRef}
                  data={searchResults}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `${item.section}-${item.id}`}
                  renderItem={renderSearchResultItem}
                  snapToInterval={ITEM_WIDTH + ITEM_SPACING}
                  decelerationRate="fast"
                  snapToAlignment="start"
                  initialScrollIndex={0}
                  getItemLayout={(data, index) => ({
                    length: ITEM_WIDTH + ITEM_SPACING,
                    offset: (ITEM_WIDTH + ITEM_SPACING) * index,
                    index,
                  })}
                  contentContainerStyle={{ paddingLeft: 20, paddingRight: ITEM_SPACING }}
                  onViewableItemsChanged={onSearchViewRef.current}
                  viewabilityConfig={viewConfigRef.current}
                  pagingEnabled={false}
                />

                <View className="flex-row items-center justify-between px-4 mt-6">
                  <TouchableOpacity
                    onPress={() => {
                      const prevIndex = searchCurrent === 0 ? searchResults.length - 1 : searchCurrent - 1;
                      searchFlatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
                    }}
                    activeOpacity={0.7}
                    disabled={searchCurrent === 0}
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
                          backgroundColor: '#B0B0B0',
                        }}
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      const nextIndex = searchCurrent === searchResults.length - 1 ? 0 : searchCurrent + 1;
                      searchFlatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
                    }}
                    activeOpacity={0.7}
                    disabled={searchCurrent === searchResults.length - 1}
                  >
                    <Ionicons
                      name="chevron-forward-outline"
                      size={24}
                      color={searchCurrent === searchResults.length - 1 ? '#555' : '#fff'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* No Search Results Message */}
          {searchQuery && searchResults.length === 0 && (
            <View className="flex-1 justify-center items-center">
              <Text className="text-neutral200 font-sora text-sm text-center">
                No results found for "{searchQuery}"
              </Text>
            </View>
          )}

          {/* Regular Content (only shown when not searching) */}
          {!searchQuery && (
            <View className="flex-1">
              {/* Use the Carousel Component */}
              <Carousel onSlidePress={openCarouselModal} />

              {/* Support Items List */}
              <View className="mt-8 px-2 flex-1">
                {items.map((item) => (
                  <View key={item.id} className="mb-4">
                    <TouchableOpacity 
                      onPress={() => toggleItem(item.id)}
                      className="flex-row justify-between items-center py-3 px-4 bg-neutral700 rounded-lg"
                    >
                      <Text 
                        className={`font-sora-bold text-sm ${
                          item.expanded ? 'text-white' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </Text>
                      <AntDesign 
                        name={item.expanded ? 'arrow-down' : 'arrow-right'} 
                        size={16} 
                        color='#ffffff'
                      />
                    </TouchableOpacity>
                    {item.expanded && (
                      <View className="mt-5 px-4">
                        <TouchableOpacity 
                          onPress={() => navigateToItem(item.route)}
                          className="py-3 px-3 bg-[#222222] rounded-lg"
                        >
                          <Text className="text-neutral100 font-space-mono text-xs mb-2">
                            {item.content.heading}
                          </Text>

                          <Text className="flex-wrap text-white font-sora text-sm leading-relaxed">
                            <Text className="font-sora text-sm text-main">
                              {item.content.firstWord + ' '}
                            </Text>
                            {item.content.text}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── Carousel Item — DraggableBottomSheet (drag to close) ── */}
        <DraggableBottomSheet
          ref={carouselSheetRef}
          snapHeight="70%"
          backgroundColor="#111111"
          onClose={() => setSelectedSlide(null)}
        >
          {selectedSlide && (
            <>
              <Image
                source={selectedSlide.modalImage}
                className="w-full h-[30%] object-cover rounded-t-3xl"
              />
              <View className="px-6 py-4">
                <Text className="text-neutral100 font-space-mono text-sm mb-2">
                  {selectedSlide.label}
                </Text>
                <Text className="text-white font-sora-bold text-lg mb-2">
                  {selectedSlide.headline}
                </Text>
                <Text className="text-neutral200 font-sora text-sm">
                  {selectedSlide.description}
                </Text>
              </View>
              <View className="absolute bottom-16 left-0 right-0 px-6">
                <Button 
                  text="Close" 
                  onPress={closeCarouselModal}
                  outline
                />
              </View>
            </>
          )}
        </DraggableBottomSheet>

        {/* Phone Modal — kept exactly as original */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <Pressable 
            onPress={closeModal} 
            className="absolute inset-0 bg-black/60"
          />
          <View className="flex-1 justify-center items-center">
            <View className="bg-mainBlack rounded-3xl p-6 w-4/5">
              <Text className="text-white font-sora text-sm text-center mb-6">
                +234 813 500 5000
              </Text>
              {isCalling ? (
                <View className="py-3 rounded-xl items-center justify-center bg-main">
                  <ActivityIndicator size="small" color="#000000" />
                </View>
              ) : (
                <Button 
                  text="Call Support" 
                  onPress={handleCallSupport}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}