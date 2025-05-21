import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ImageSourcePropType,
} from "react-native";
import FolderOpen from "../assets/images/Folder open.png";

type FolderProps = {
  name: string;
  title: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: ImageSourcePropType;
};

const Folder: React.FC<FolderProps> = ({
  name,
  title,
  selected = false,
  onPress,
  icon = FolderOpen,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`p-4 items-center ${selected ? "true" : "false"} `}
    >
      <Image source={icon} className="w-[133px] h-[106.4px]" />
      <Text
        className="w-40 h-5 text-center text-[16px] leading-[16px] tracking-[0] font-medium text-white mt-7"
        style={{ fontFamily: "Sora-Medium" }}
      >
        {title}
      </Text>
      <Text
        className="w-40 h-[21px] text-center font-sora text-[14px] leading-[21px] tracking-[0] font-normal text-gray-500 mt-1"

      >
        {name}
      </Text>
    </TouchableOpacity>
  );
};

export default Folder;
