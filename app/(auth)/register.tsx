import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore"; // import Firestore methods
import React, { useState } from "react";
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
import { auth, db } from "../../firebaseconfig"; // import db

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword || !name) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            // Create account in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            const user = userCredential.user;

            // Set display name in Auth
            await updateProfile(user, { displayName: name });

            // Store user data in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name,
                email,
                createdAt: serverTimestamp(),
                userId: user.uid,
                role: "user", // optional, if you’ll have admin vs normal users
            });

            Alert.alert("Success", "Account created successfully!");
            router.push("/(tabs)/home");
        } catch (error: any) {
            let message = "Something went wrong.";
            if (error.code === "auth/email-already-in-use")
                message = "This email is already registered.";
            else if (error.code === "auth/invalid-email")
                message = "Invalid email address.";
            else if (error.code === "auth/weak-password")
                message = "Password should be at least 6 characters.";

            Alert.alert("Registration Failed", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1 justify-start px-8 py-10">
                    <View className="mb-10">
                        <Text className="text-4xl font-bold text-gray-800 mb-2">
                            Create Account
                        </Text>
                        <Text className="text-gray-600 text-base">
                            Sign up to get the latest air quality updates!
                        </Text>
                    </View>

                    <View className="space-y-4">
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 font-medium">
                                Name
                            </Text>
                            <TextInput
                                className="bg-gray-100 rounded-xl px-4 py-4 text-base"
                                placeholder="Enter your name"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

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
                            className={`rounded-xl py-4 mt-6 ${
                                loading ? "bg-gray-400" : "bg-green-600"
                            }`}
                            onPress={handleRegister}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-center font-bold text-base">
                                    Sign Up
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default Register;
