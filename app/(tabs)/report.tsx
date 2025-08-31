import React from "react";
import { Platform, ScrollView, StatusBar, Text, View } from "react-native";
import Header from "../header";

const Report = () => {
  const paddingTop = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        alignItems: "center",
        paddingTop,
        paddingBottom: 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Header />
      <Text className="text-2xl font-bold text-black text-shadow-lg mb-4">
        Community Reporting
      </Text>
      <View
        className="w-[80%] h-12 rounded-xl shadow-lg shadow-black/10 flex items-center justify-center mb-8"
        style={{ backgroundColor: "#8bf889ff" }}
      >
        <Text
          className="text-lg text-white text-shadow-md font-bold"
          style={{ color: "#003406" }}
        >
          Report
        </Text>
      </View>

      {/* Example user post */}
      <View className="w-[80%] p-4 rounded-xl shadow-lg shadow-black/10 flex items-justify justify-start gap-3 flex-col bg-white ">
        <View className="w-full flex justify-start items-center flex-row">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              overflow: "hidden",
              marginRight: 12,
              backgroundColor: "#e0e0e0",
              justifyContent: "center",
              alignItems: "center",
            }}
          ></View>
          <Text className="text-base text-black">Jenny</Text>
        </View>
        <Text className="text-base text-black">
          Wow! This is a great day today! Hopefully everyone is having it too!
        </Text>
        <View className="w-full h-40 flex bg-gray-200 rounded-lg"></View>
      </View>
    </ScrollView>
  );
};

export default Report;
