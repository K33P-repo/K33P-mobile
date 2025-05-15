import { View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
  return (
    <View className="flex-1 items-center justify-center bg-[#1e1e1e]">
      <View className="flex-row items-center"> 
        {/* First Material Icon - Wrapped in View */}
        <View className="w-8 h-8 justify-center items-center"> 
          <MaterialCommunityIcons name="briefcase" size={20} color="#B8B8B8" />
        </View>
        
        {/* Entypo Icon - Wrapped in same size container */}
        <View className="w-[12px] h-8 justify-center items-center">
          <Entypo name="dots-three-horizontal" size={10} color="#B8B8B8" />
        </View>
        
        {/* Second Material Icon */}
        <View className="w-8 h-8 justify-center items-center">
          <MaterialCommunityIcons name="briefcase" size={20} color="#B8B8B8" />
        </View>

        <View className="w-[12px] h-8 justify-center items-center">
          <Entypo name="dots-three-horizontal" size={10} color="#B8B8B8"/>
        </View>

        {/* Third Material Icon */}
        <View className="w-8 h-8 justify-center items-center">
          <MaterialCommunityIcons name="briefcase" size={20} color="#B8B8B8" />
        </View>
      </View>
    </View>
  );
}