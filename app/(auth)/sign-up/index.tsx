import { View, Text } from 'react-native';
import React from 'react';
import TextInput from '../../../components/TextInput';

export default function Index() {  // Component names should be PascalCase
  return (
    <View>
      <Text>index</Text>
      <TextInput 
        title="Enter Phone Number" 
        placeholder="+234-801-2345-678" 
        initialValue="" 
        minLength={10}  // No extra parentheses needed
        onValidChange={(isValid) => console.log(isValid)} 
        autoFocus={true}  // Explicit boolean for consistency
      />
    </View>
  );
}