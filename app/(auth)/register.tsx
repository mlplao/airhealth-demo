import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const router = useRouter();

    const handleRegister = () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        // ✅ Temporary success message (replace later with backend registration)
        Alert.alert("Success", "Account created successfully!");
        router.push("/(auth)/login");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-center px-8 py-10">
                    <View className="mb-10">
                        <Text className="text-4xl font-bold text-gray-800 mb-2">
                            Create Account
                        </Text>
                        <Text className="text-gray-600 text-base">
                            Sign up to get started
                        </Text>
                    </View>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-gray-700 mb-2 font-medium">
                                Email
                            </Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl px-4 py-4 text-base"
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View className="mt-4">
                            <Text className="text-gray-700 mb-2 font-medium">
                                Password
                            </Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl px-4 py-4 text-base"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View className="mt-4">
                            <Text className="text-gray-700 mb-2 font-medium">
                                Confirm Password
                            </Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl px-4 py-4 text-base"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            className="bg-green-600 rounded-xl py-4 mt-6"
                            onPress={handleRegister}
                        >
                            <Text className="text-white text-center font-bold text-base">
                                Sign Up
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-6">
                            <Text className="text-gray-600">
                                Already have an account?
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push("/(auth)/login")}
                            >
                                <Text className="text-green-600 font-bold ml-2">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;
