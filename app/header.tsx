import React from "react";
import { TouchableOpacity, View } from "react-native";

const Header = () => {
    return (
        <View className="w-full mb-8 px-4">
            <TouchableOpacity
                onPress={() => console.log("Menu pressed!")}
            ></TouchableOpacity>
            <View className="w-7" />
        </View>
    );
};

export default Header;
