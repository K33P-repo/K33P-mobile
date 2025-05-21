import React, { useState } from "react";
import { TouchableOpacity, Text, View, Image } from "react-native";
import TwelveSeedPhrases from "@/components/twelve";
import TwentyFourSeedPhrases from "@/components/twentyfour";
import { Button } from "@/components/Button";
import { useRouter } from "expo-router";
import PersonBig from '../../../assets/images/PersonBig.png'

const App: React.FC = () => {
  const router = useRouter();
  const [activeKeys, setActiveKeys] = useState<"12" | "24">("12");

  return (
    <View style={{ flex: 1 }} className="bg-mainBlack mt-[144px]">
      <TouchableOpacity className="absolute top-[64px] left-5 " >
        <Image source={PersonBig} className="w-10 h-10" resizeMode="contain" />
      </TouchableOpacity>
      <View className="flex flex-row h-[40px]">
        {/* 12 Keys Button */}
        <TouchableOpacity
          onPress={() => setActiveKeys("12")}
          className={`text-lg font-bold ml-4 h-[40px] rounded-lg text-center w-[167px] py-2 px-[10px] ${
            activeKeys === "12" ? "bg-white" : ""
          }`}
        >
          <Text className={`text-mainBlack text-lg font-bold text-center ${
            activeKeys === "12" ? "text-mainBlack" : "text-neutral200"
          }`}>
            12 Keys
          </Text>
        </TouchableOpacity>

        {/* 24 Keys Button */}
        <TouchableOpacity
          onPress={() => setActiveKeys("24")}
          className={`mr-5 h-[40px] rounded-lg text-center w-[167px] py-2 px-[10px] ${
            activeKeys === "24" ? "bg-white" : ""
          }`}
        >
          <Text className={`text-mainBlack text-lg font-bold text-center ${
            activeKeys === "24" ? "text-mainBlack" : "text-neutral200"
          }`}>
            24 Keys
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditionally render the component based on activeKeys */}
      {activeKeys === "12" ? (
        <TwelveSeedPhrases
        />
      ) : (
        <TwentyFourSeedPhrases
        />
      )}

      <View className="absolute top-[550px] left-[20px] w-[350px]">
        <Button
          text="Proceed"
          onPress={() => router.push("/")}
          isDisabled={true}
          customColor="#666666"
        />
      </View>
    </View>
  );
};
export default App;