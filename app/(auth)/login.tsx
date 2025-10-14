import { Link, useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../../firebaseconfig";
import { useAuth } from "../context/authContext";

const Login = () => {
    const router = useRouter();
    const { user, loading } = useAuth(); // ✅ Correctly destructure from context

    // ✅ Handle redirect after successful login
    useEffect(() => {
        if (!loading && user) {
            router.replace("/(tabs)/home");
        }
    }, [user, loading]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signingIn, setSigningIn] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert(
                "Missing Fields",
                "Please enter both email and password."
            );
            return;
        }

        try {
            setSigningIn(true);
            await signInWithEmailAndPassword(auth, email.trim(), password);
            // AuthContext will automatically detect the user state
        } catch (error: any) {
            console.error(error);
            Alert.alert("Login Failed", error.message);
        } finally {
            setSigningIn(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#22c55e" />
            </View>
        );
    }

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
                                keyboardType="email-address"
                                autoCapitalize="none"
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
                            className={`rounded-xl py-4 mt-6 ${
                                signingIn ? "bg-gray-400" : "bg-green-600"
                            }`}
                            onPress={handleLogin}
                            disabled={signingIn}
                        >
                            {signingIn ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-center font-bold text-base">
                                    Sign In
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center mt-6">
                            <Text className="text-gray-600">
                                Don't have an account?
                            </Text>
                            <Link
                                href="/(auth)/register"
                                className="text-green-600 font-bold ml-2"
                            >
                                Sign Up
                            </Link>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Login;
