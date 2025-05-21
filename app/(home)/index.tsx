import { Button } from "@/components/Button";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WalletModal } from "@/components/WalletModal";

import SlideImg3, {
  default as SlideImg1,
  default as SlideImg2,
} from "../../assets/images/carouselImage.png";
import TopLeft from "../../assets/images/info.png";
import ArrowLeft from "../../assets/images/left.png";
import TopRight from "../../assets/images/topright.png";
import ArrowRight from "../../assets/images/right.png";

const { width: screenWidth } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    image: SlideImg1,
    label: "What is K33P?",
    headline: "Decentralized digital safe for your Key-phrases.",
  },
  {
    id: 2,
    image: SlideImg2,
    label: "FAST",
    headline: "Instant transactions",
  },
  {
    id: 3,
    image: SlideImg3,
    label: "EASY",
    headline: "Just a tap away",
  },
];

const ITEM_WIDTH = screenWidth * 0.85;
const ITEM_SPACING = screenWidth * 0.05; // peek size on the right

export default function Index() {
  const [current, setCurrent] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const flatListRef = useRef(null);

  const onViewRef = React.useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrent(viewableItems[0].index);
    }
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

  const prevSlide = () => {
    const prevIndex = current === 0 ? slides.length - 1 : current - 1;
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
  };

  const nextSlide = () => {
    const nextIndex = current === slides.length - 1 ? 0 : current + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const handleScanDevice = () => {
    setModalVisible(false);
    router.push("/(home)/scanning");
  };

  const handleAddManually = () => {
    setModalVisible(false);
    router.push("/(home)/manual");
  };

  const renderItem = ({ item, index }) => {
    return (
      <View
        style={{
          width: ITEM_WIDTH,
          marginRight: ITEM_SPACING,
          backgroundColor: "#121212", // bg-mainBlack
          borderRadius: 12,
          padding: 8,
          flexDirection: "row",
          alignItems: "center",
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
              color: "#B0B0B0",
              fontSize: 12,
              marginBottom: 4,
              fontFamily: "Sora-Regular",
            }}
          >
            {item.label}
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontFamily: "Sora-Bold",
            }}
          >
            {item.headline}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-neutral800 justify-between px-4 pt-6 pb-12 relative">
      {/* Top Icons */}
      <View className="absolute top-10 left-4">
        <Image source={TopLeft} className="w-10 h-10" resizeMode="contain" />
      </View>
      <View className="absolute top-10 right-4">
        <Image source={TopRight} className="w-10 h-10" resizeMode="contain" />
      </View>

      {/* Carousel with Peeking */}
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
          contentContainerStyle={{ paddingLeft: 20 }}
          onViewableItemsChanged={onViewRef.current}
          viewabilityConfig={viewConfigRef.current}
          pagingEnabled={false} // paging false because of peeking
        />

        {/* Arrows & Dots */}
        <View className="flex-row items-center justify-between px-4 mt-6">
          <TouchableOpacity onPress={prevSlide}>
            <Image source={ArrowLeft} />
          </TouchableOpacity>

          <View className="flex-row gap-3 items-center">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === current
                    ? "bg-main w-4 h-2"
                    : "bg-neutral100 w-2 h-2"
                }`}
              />
            ))}
          </View>

          <TouchableOpacity onPress={nextSlide}>
            <Image source={ArrowRight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View className="bg-mainBlack px-4 py-8 rounded-3xl space-y-4">
        <View className="items-center mb-4">
          <Text className="text-white font-sora-semibold text-sm">
            Connect Wallet
          </Text>
        </View>

        <Button text="Add New Wallet" onPress={openModal} />
      </View>
     
      <WalletModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onScanDevice={handleScanDevice}
        onAddManually={handleAddManually}
        scanButtonText="Scan Device" 
        manualButtonText="Add Manually" 
      />
    </View>
  );
}
