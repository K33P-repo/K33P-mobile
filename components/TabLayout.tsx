import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { View } from "react-native";

export default function TabLayout() {
  return (
    <View className="items-center bg-mainBlack h-20">
      <View className="flex-row items-center w-[120px] h-4 mt-16 ml-4"> 
        {/* First Material Icon - Wrapped in View */}
        <View className="w-8 h-6 justify-center items-center"> 
          <MaterialCommunityIcons name="briefcase" size={20} color="#B8B8B8" />
        </View>
        
        {/* Entypo Icon - Wrapped in same size container */}
        <View className="w-[12px] h-8 justify-center items-center">
          <Entypo name="dots-three-horizontal" size={10} color="#B8B8B8" />
        </View>
        
        {/* Second Material Icon */}
        <View className="w-8 h-6 justify-center items-center">
          <MaterialCommunityIcons name="briefcase" size={20} color="#B8B8B8" />
        </View>

        <View className="w-[12px] h-8 justify-center items-center">
          <Entypo name="dots-three-horizontal" size={10} color="#B8B8B8"/>
        </View>

        {/* Third Material Icon */}
        <View className="w-8 h-6 justify-center items-center ">
          <MaterialCommunityIcons name="briefcase" size={20} color="#B8B8B8" />
        </View>
      </View>
    </View>
  );
}