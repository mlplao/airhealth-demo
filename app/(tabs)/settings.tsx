import { router } from "expo-router";
import React from "react";
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../context/authContext";
import "../global.css";
import Header from "../header";
// Notifications
import * as Notifications from "expo-notifications";

export default function Index() {
    const { logout } = useAuth();

    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

    const handleSignOut = async () => {
        try {
            await logout();
            router.replace("/(auth)/login");
            Alert.alert("Signed Out", "You have been signed out.");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    const sendTestNotification = async () => {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "AirHealth",
                    body: "Air quality has changed in your area! Tap to view details.",
                    data: { screen: "home" },
                },
                trigger: null,
            });
            Alert.alert("Success", "Test notification sent!");
        } catch (error) {
            Alert.alert("Error", "Failed to send test notification");
            console.error(error);
        }
    };

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

            <View className="w-[80%] bg-gray-100 rounded-lg p-4 shadow mb-4">
                <Text className="text-lg text-gray-800 mb-2">
                    Developer Tools
                </Text>
                <TouchableOpacity
                    className="py-3"
                    onPress={sendTestNotification}
                >
                    <Text className="text-base text-blue-600 font-semibold">
                        Send Test Notification
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="w-[80%] bg-gray-100 rounded-lg p-4 shadow">
                <TouchableOpacity className="py-3" onPress={handleSignOut}>
                    <Text className="text-base text-red-600 font-semibold">
                        Sign out
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
