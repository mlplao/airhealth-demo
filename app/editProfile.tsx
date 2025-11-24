import { Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../firebaseconfig";
import { useAuth } from "./context/authContext";
import "./global.css";

export default function EditProfile() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [userData, setUserData] = useState<{
        name: string | null;
        profilePhoto: string | null;
    }>({ name: null, profilePhoto: null });

    const [username, setUsername] = useState("");

    // fetch user data from storage
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user?.uid) return;

            try {
                const userRef = doc(db, "users", user.uid);
                const snap = await getDoc(userRef);

                if (snap.exists()) {
                    const data = snap.data();
                    setUserData({
                        name: data.name || null,
                        profilePhoto: data.profilePhoto || null,
                    });

                    setUsername(data.name || "");
                }
            } catch (err) {
                console.log("Error fetching user:", err);
            }

            setLoading(false);
        };

        fetchUserData();
    }, [user]);

    // SAVE CHANGES TO FIRESTORE
    const handleSave = async () => {
        if (!user?.uid) return;

        setSaving(true);

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                name: username,
            });

            setUserData((prev) => ({ ...prev, name: username }));
        } catch (err) {
            console.log("Error updating profile:", err);
        }

        setSaving(false);
    };

    if (loading)
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );

    const pickImage = async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                alert("Permission required to access photos.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
                base64: true,
                allowsEditing: true,
            });

            if (result.canceled) return;

            const selected = result.assets[0];

            const base64String = `data:${selected.mimeType};base64,${selected.base64}`;

            // Save to Firestore
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { profilePhoto: base64String });

            // Update UI
            setUserData((prev) => ({
                ...prev,
                profilePhoto: base64String,
            }));

            alert("Profile photo updated!");
        } catch (error) {
            console.log("Error updating photo:", error);
            alert("Failed to update photo.");
        }
    };

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            contentContainerStyle={{
                paddingHorizontal: 30,
                paddingTop: 40,
                paddingBottom: 80,
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Photo */}
            <View className="items-center mb-8">
                <View className="relative">
                    {/* Avatar Circle */}
                    <View className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-md overflow-hidden items-center justify-center">
                        {userData.profilePhoto ? (
                            <Image
                                source={{ uri: userData.profilePhoto }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Text className="text-gray-600 font-bold text-3xl">
                                {userData.name
                                    ? userData.name.slice(0, 2).toUpperCase()
                                    : "U"}
                            </Text>
                        )}
                    </View>

                    {/* Camera button OUTSIDE the circle */}
                    <TouchableOpacity
                        className="absolute bottom-0 right-0 bg-green-600 p-2 rounded-full shadow"
                        activeOpacity={0.8}
                        onPress={pickImage}
                    >
                        <Entypo name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <Text className="mt-3 text-base text-gray-700">
                    Change Profile Photo
                </Text>
            </View>

            {/* Form Card */}
            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <Text className="text-gray-700 mb-2 font-medium">Username</Text>
                <TextInput
                    className="border border-gray-300 rounded-xl p-3 mb-8 text-gray-900"
                    placeholder="Enter your full name"
                    placeholderTextColor="#999"
                    value={username}
                    onChangeText={setUsername}
                />

                {/* Save Button */}
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`rounded-xl py-4 shadow-sm mt-2 ${
                        saving ? "bg-gray-600" : "bg-green-600"
                    }`}
                >
                    <Text className="text-white text-center text-lg font-semibold">
                        {saving ? "Saving..." : "Save Changes"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
