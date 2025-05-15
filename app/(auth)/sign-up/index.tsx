import { View } from "react-native";
import React from "react";
import PhoneInput from "@/components/PhoneInput";
import TabLayout from "@/components/TabLayout";
import Button from "@/components/Button";

export default function PhoneInputScreen() {
  return (
    <View className="absolute w-[375px] h-[812px] top-[100px] left-[949px] rounded-3xl bg-[#1A1A1A] overflow-hidden shadow-lg">
      
      <View className="flex-1 p-5 justify-between pb-10">
        <TabLayout />
        <PhoneInput
          title="Enter Phone Number"
          placeholder="+234-801-2345-678"
          initialValue=""
          minLength={10}
          onValidChange={(isValid) => console.log(isValid)}
          autoFocus={true}
        />
        <Button
          text="Proceed"
          isDisabled={true}
          onPress={() => console.log("Proceed button pressed")}
          outline={false}
          isLoading={false}
        />
      </View>
    </View>
  );
}