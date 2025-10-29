import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../firebaseconfig"; // adjust path to your firebase config
import { useAuth } from "./context/authContext";

export default function ReportFunc() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        const fetchUserName = async () => {
            if (user?.uid) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserName(userDoc.data().name || "Anonymous");
                    }
                } catch (error) {
                    console.error("Error fetching user name:", error);
                    setUserName("Anonymous");
                }
            }
        };

        fetchUserName();
    }, [user?.uid]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                base64: true,
                quality: 0.7,
            });

            if (!result.canceled && result.assets?.[0]?.base64) {
                setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to open image picker");
        }
    };

    const handlePost = async () => {
        if (!message.trim()) {
            Alert.alert(
                "Empty Message",
                "Please write something to talk about."
            );
            return;
        }

        if (!user?.uid) {
            Alert.alert("Error", "Something went wrong");
            return;
        }

        setLoading(true);

        try {
            await addDoc(collection(db, "reports"), {
                uidPoster: user.uid,
                name: userName,
                text: message.trim(),
                image: image || null,
                createdAt: serverTimestamp(),
                likes: 0,
                comments: [],
            });

            setMessage("");
            setImage(null);
            Alert.alert("Success", "Your post has been shared!");
        } catch (error) {
            Alert.alert("Error", "Something went wrong while posting.");
            console.error(error);
        } finally {
            setLoading(false);
            router.replace("/(tabs)/report");
        }
    };

    return (
        <View className="flex-1 p-5 bg-gray-50">
            <View className="p-5 rounded-2xl bg-white shadow-sm">
                {/* Message Input */}
                <TextInput
                    className="border border-gray-200 rounded-xl p-3 text-base text-gray-700"
                    placeholder="Write something..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={message}
                    onChangeText={setMessage}
                />

                {/* Image Picker */}
                <TouchableOpacity
                    onPress={pickImage}
                    className="mt-4 border border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center"
                    activeOpacity={0.8}
                >
                    {image ? (
                        <Image
                            source={{ uri: image }}
                            className="w-full h-full rounded-xl"
                            resizeMode="cover"
                        />
                    ) : (
                        <Text className="text-gray-400">
                            Tap to add an image
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Post Button */}
                <TouchableOpacity
                    onPress={handlePost}
                    disabled={loading}
                    className={`mt-6 py-3 rounded-xl flex items-center justify-center ${
                        loading ? "bg-blue-300" : "bg-blue-500"
                    }`}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold text-lg">
                            Post
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
