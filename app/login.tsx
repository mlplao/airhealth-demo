// login.tsx
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface LoginProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = () => {
        // For now, just call success callback
        // Later add Firebase authentication:
        // try {
        //   await signInWithEmailAndPassword(auth, email, password);
        //   onLoginSuccess();
        // } catch (error) {
        //   Alert.alert('Error', error.message);
        // }

        onLoginSuccess();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-center px-8">
                    <View className="mb-10">
                        <Text className="text-4xl font-bold text-gray-800 mb-2">
                            Welcome Back
                        </Text>
                        <Text className="text-gray-600 text-base">
                            Sign in to continue
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

                        <TouchableOpacity
                            className="bg-green-600 rounded-xl py-4 mt-6"
                            onPress={handleLogin}
                        >
                            <Text className="text-white text-center font-bold text-base">
                                Sign In
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-6">
                            <Text className="text-gray-600">
                                Don't have an account?
                            </Text>
                            <TouchableOpacity>
                                <Text className="text-green-600 font-bold ml-2">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;
