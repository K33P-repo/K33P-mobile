import Button from "@/components/Button";
import PhoneInput from "@/components/PhoneInput";
import TabLayout from "@/components/TabLayout";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function PhoneInputScreen() {
  const router = useRouter();
  return (
    <View className="flex-1">
      
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
          onPress={() => router.push('/sign-up/otp')}
          outline={false}
          isLoading={false}
        />
      </View>
    </View>
  );
}