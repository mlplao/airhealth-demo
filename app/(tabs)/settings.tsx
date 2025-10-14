import { router } from "expo-router";
import React from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import "../global.css";
import Header from "../header";

export default function Index() {
    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{
                alignItems: "center",
                paddingTop,
                paddingBottom: 150,
            }}
            showsVerticalScrollIndicator={false}
        >
            <Header />
            <Text className="text-2xl font-bold text-black mb-6">Settings</Text>

            <View className="w-[80%] bg-gray-100 rounded-lg p-4 shadow mb-4">
                <Text className="text-lg text-gray-800 mb-2">Account</Text>
                <TouchableOpacity className="py-3 border-b border-gray-300">
                    <Text className="text-base">Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-3">
                    <Text className="text-base">Change Password</Text>
                </TouchableOpacity>
            </View>

            <View className="w-[80%] bg-gray-100 rounded-lg p-4 shadow mb-4">
                <Text className="text-lg text-gray-800 mb-2">Preferences</Text>
                <TouchableOpacity className="py-3 border-b border-gray-300">
                    <Text className="text-base">Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-3">
                    <Text className="text-base">Theme</Text>
                </TouchableOpacity>
            </View>

            <View className="w-[80%] bg-gray-100 rounded-lg p-4 shadow">
                <TouchableOpacity
                    className="py-3"
                    onPress={() => router.push("/(auth)/login")}
                >
                    <Text className="text-base">Sign out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
