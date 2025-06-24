import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { usePhoneStore } from '@/store/usePhoneStore';
import { usePinStore } from '@/store/usePinStore';
import { getStoredWallets } from '@/utils/storage';

import SlideImg1 from '../../assets/images/carouselImage.png';
import SlideImg3 from '../../assets/images/carouselImage2.png';
import SlideImg2 from '../../assets/images/carouselImage3.png';
import TopLeft from '../../assets/images/info.png';
import ArrowLeft from '../../assets/images/left.png';
import TopRight from '../../assets/images/person.png';
import ArrowRight from '../../assets/images/right.png';

const { width: screenWidth } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    image: SlideImg1,
    label: 'What is K33P?',
    headline: 'Decentralized digital safe for your Key-phrases.',
  },
  {
    id: 2,
    image: SlideImg2,
    label: 'Why K33P?',
    headline: 'Lifetime access to key phrases + NOK Setup.',
  },
  {
    id: 3,
    image: SlideImg3,
    label: 'How to get started with K33P?',
    headline: 'Deposit 2ADA, Create DID, Take back your 2ADA.',
  },
];

const ITEM_WIDTH = screenWidth * 0.91;
const ITEM_SPACING = screenWidth * 0.02;

export default function Index() {
  const [current, setCurrent] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isStoreHydrated, setIsStoreHydrated] = useState(false);
  const router = useRouter();
  const flatListRef = useRef(null);

  const { phoneNumber } = usePhoneStore();
  const { pin, hasPin } = usePinStore();

  useEffect(() => {
    const unsubscribePin = usePinStore.persist.onFinishHydration(() => {
      setIsStoreHydrated(true);
    });

    if (usePinStore.persist.hasHydrated()) {
      setIsStoreHydrated(true);
    }

    return () => {
      unsubscribePin();
    };
  }, []);

  useEffect(() => {
    const checkUserSessionAndWallets = async () => {
      if (!isStoreHydrated) {
        return;
      }

      if (!phoneNumber) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please sign in again.',
          [{ text: 'OK', onPress: () => router.replace('/sign-in') }]
        );
        return;
      }

      if (hasPin && (pin === null || pin === undefined || pin === '')) {
        Alert.alert(
          'PIN Required',
          'Your PIN is missing or invalid. Please set your PIN again.',
          [{ text: 'OK', onPress: () => router.replace('/sign-in') }]
        );
        return;
      }

      const pinToUse = hasPin ? pin || '' : '';

      if (phoneNumber && (pinToUse !== null || !hasPin)) {
        try {
          const storedWallets = await getStoredWallets(phoneNumber, pinToUse);
          if (storedWallets.length > 0) {
            router.replace('/(home)/add-to-wallet');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to retrieve wallet data. Please try again.');
          router.replace('/sign-in');
        }
      }
    };

    checkUserSessionAndWallets();
  }, [isStoreHydrated, phoneNumber, pin, hasPin, router]);

  const onViewRef = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrent(viewableItems[0].index);
    }
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const prevSlide = useCallback(() => {
    const prevIndex = current === 0 ? slides.length - 1 : current - 1;
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
  }, [current]);

  const nextSlide = useCallback(() => {
    const nextIndex = current === slides.length - 1 ? 0 : current + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, [current]);

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  const renderItem = useCallback(({ item, index }) => (
    <View
      style={{
        width: ITEM_WIDTH,
        marginRight: ITEM_SPACING,
        backgroundColor: '#121212',
        borderRadius: 12,
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        opacity: index === current ? 1 : 0.6,
      }}
    >
      <Image
        source={item.image}
        style={{ width: 80, height: 80, marginRight: 20 }}
        resizeMode="contain"
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: '#B0B0B0',
            fontSize: 12,
            marginBottom: 4,
            fontFamily: 'Sora-Regular',
          }}
        >
          {item.label}
        </Text>
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            fontFamily: 'Sora-Bold',
          }}
        >
          {item.headline}
        </Text>
      </View>
    </View>
  ), [current]);

  return (
    <View className="flex-1 bg-neutral800 justify-between pt-6 pb-12 relative">
      <View className="absolute top-10 left-4">
        <Image source={TopLeft} className="w-10 h-10" resizeMode="contain" />
      </View>
      <View className="absolute top-10 right-4">
        <Image source={TopRight} className="w-10 h-10" resizeMode="contain" />
      </View>

      <View style={{ marginTop: 80 }}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          snapToInterval={ITEM_WIDTH + ITEM_SPACING}
          decelerationRate="fast"
          snapToAlignment="start"
          initialScrollIndex={0}
          getItemLayout={(data, index) => ({
            length: ITEM_WIDTH + ITEM_SPACING,
            offset: (ITEM_WIDTH + ITEM_SPACING) * index,
            index,
          })}
          contentContainerStyle={{ paddingLeft: 27, paddingRight: ITEM_SPACING }}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          pagingEnabled={false}
        />

<View className="flex-row items-center justify-between px-6 mt-6">
          <TouchableOpacity onPress={prevSlide}>
            <Image source={ArrowLeft} />
          </TouchableOpacity>

          <View className="flex-row gap-3 items-center">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === current ? 'bg-main w-4 h-2' : 'bg-neutral100 w-2 h-2'
                }`}
              />
            ))}
          </View>

          <TouchableOpacity onPress={nextSlide}>
            <Image source={ArrowRight} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-mainBlack px-4 py-8 rounded-3xl space-y-4 mt-10 mx-3">
        <View className="items-center mb-4">
          <Text className="text-neutral200 font-sora-semibold text-sm">Connect</Text>
        </View>
        <Button text="Add New Wallet" onPress={openModal} />
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
              How do you want to add wallet
            </Text>
            <View className="space-y-4 gap-4">
              <Button
                text="Scan Device"
                onPress={() => {
                  closeModal();
                  router.push('/search');
                }}
              />
              <Button
                text="Add Manually"
                onPress={() => {
                  closeModal();
                  router.push('/add-manually');
                }}
                outline
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}