import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, StatusBar, TextInput, View } from "react-native";
import "../global.css";
import Header from "../header";

const Search = () => {
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

      {/* Search Bar */}
      <View
        className="w-[80%] h-14 bg-white rounded-3xl flex-row items-center px-6 mb-6"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 4, // Android shadow
        }}
      >
        <TextInput
          placeholder="Search for places..."
          placeholderTextColor="#9ca3af"
          className="flex-1 text-base"
          style={{
            outlineStyle: "none", // Removes blue outline on web
          }}
        />
        <Ionicons
          name="search"
          size={22}
          color="#9ca3af"
          style={{ marginRight: 8 }}
        />
      </View>
    </ScrollView>
  );
};

export default Search;
