import { View } from 'react-native';
import React from 'react';
import PhoneInput from '@/components/PhoneInput'; 
import OTPVerificationScreen from '@/components/OTP';
import SetupPinScreen from '@/components/SetupPinScreen';
import TabLayout from '@/components/TabLayout';


export default function PhoneInputScreen() {  
  return (
    <View>
      
      <PhoneInput 
        title="Enter Phone Number" 
        placeholder="+234-801-2345-678" 
        initialValue="" 
        minLength={10}
        onValidChange={(isValid) => console.log(isValid)} 
        autoFocus={true}
      />
      
      <OTPVerificationScreen/>
    <TabLayout/>
      <SetupPinScreen/>

      
    </View>
  );
}