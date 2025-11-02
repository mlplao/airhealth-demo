import { router } from "expo-router";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebaseconfig";
import Header from "../header";

interface ReportPost {
    id: string;
    uidPoster: string;
    text: string;
    image?: string | null;
    createdAt?: { seconds: number; nanoseconds: number };
    name?: string;
}

interface PinnedReportData {
    message: string;
    imageBase64?: string | null;
}

const Report = () => {
    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

    const [posts, setPosts] = useState<ReportPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [pinned, setPinned] = useState<PinnedReportData | null>(null);
    const [pinnedLoading, setPinnedLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, "reports"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: ReportPost[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<ReportPost, "id">),
            }));
            setPosts(fetched);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const fetchPinnedReport = async () => {
            try {
                const pinnedDoc = await getDoc(doc(db, "pinned", "report"));
                if (pinnedDoc.exists()) {
                    setPinned(pinnedDoc.data() as PinnedReportData);
                }
            } catch (error) {
                console.error("Error fetching pinned report:", error);
            } finally {
                setPinnedLoading(false);
            }
        };

        fetchPinnedReport();
    }, []);

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

            {/* Create Report Button */}
            <TouchableOpacity
                className="w-[80%] h-12 rounded-xl shadow-lg shadow-black/10 flex items-center justify-center mb-8"
                style={{ backgroundColor: "rgb(156, 163, 175)" }}
                onPress={() => {
                    router.push("/reportFunc");
                }}
            >
                <Text className="text-lg text-white text-shadow-md font-bold">
                    Report
                </Text>
            </TouchableOpacity>

            {/* Modify - This should show the pinned report */}
            {pinnedLoading ? (
                <View className="w-[80%] items-center justify-center py-6">
                    <ActivityIndicator size="small" color="#666" />
                    <Text className="text-gray-500 mt-2 text-sm">
                        Loading pinned report...
                    </Text>
                </View>
            ) : pinned ? (
                <>
                    <View className="w-[80%] p-4 rounded-xl shadow-lg shadow-black/10 bg-white mb-6 border border-blue-400">
                        <View className="w-full items-center mb-2">
                            <Text className="font-bold text-blue-600 text-lg">
                                AirHealth Admin
                            </Text>
                        </View>

                        {/* Pinned Message */}
                        <Text className="text-base text-gray-900 mb-2">
                            {pinned.message || "No pinned message yet."}
                        </Text>

                        {/* Pinned Image (optional) */}
                        {pinned.imageBase64 && (
                            <Image
                                source={{ uri: pinned.imageBase64 }}
                                className="w-full h-40 rounded-lg bg-gray-200 mt-2"
                                resizeMode="cover"
                            />
                        )}
                    </View>
                </>
            ) : (
                <>
                    <View className="w-[80%] p-4 rounded-xl bg-gray-100 mb-6">
                        <Text className="text-gray-600 italic text-center">
                            Pinned report available.
                        </Text>
                    </View>
                </>
            )}

            <View className="container w-[80%] border-b border-gray-400 mb-6"></View>

            {/* Posts */}
            {loading ? (
                <ActivityIndicator size="large" color="#999" />
            ) : posts.length === 0 ? (
                <Text className="text-gray-400 text-base mt-10">
                    No reports yet. Be the first to post!
                </Text>
            ) : (
                posts.map((post) => (
                    <View
                        key={post.id}
                        className="w-[80%] p-4 rounded-xl shadow-lg shadow-black/10 flex items-justify justify-start gap-3 flex-col bg-white mb-6"
                    >
                        {/* User Info */}
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
                            >
                                {/* Placeholder profile circle */}
                                <Text className="text-gray-600 font-bold">
                                    {post.name
                                        ? post.name.slice(0, 2).toUpperCase()
                                        : "U"}
                                </Text>
                            </View>
                            <Text className="text-base text-black">
                                {post.name || "Anonymous"}
                            </Text>
                        </View>

                        {/* Post Text */}
                        <Text className="text-base text-black">
                            {post.text}
                        </Text>

                        {/* Post Image (optional) */}
                        {post.image && (
                            <Image
                                source={{ uri: post.image }}
                                className="w-full h-40 rounded-lg bg-gray-200"
                                resizeMode="cover"
                            />
                        )}
                    </View>
                ))
            )}
        </ScrollView>
    );
};

export default Report;
