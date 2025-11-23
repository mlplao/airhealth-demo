import { EvilIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from "../../firebaseconfig";
import { useAuth } from "../context/authContext";

const GOOGLE_API_KEY = "AIzaSyB83MnrMzIyIh1k-jNRm0GEKalWAE3XbUI"; // lloyd's key

interface PlacePrediction {
    place_id: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
}

interface PlaceDetailsResponse {
    result: {
        name: string;
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    };
}

export default function Search() {
    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PlacePrediction[]>([]);
    const [recentSearches, setRecentSearches] = useState<any[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchRecentSearches = async () => {
            if (!user?.uid) return;
            try {
                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setRecentSearches(data.recentSearches || []);
                }
            } catch (error) {
                console.error("Error fetching recent searches:", error);
            }
        };

        fetchRecentSearches();
    }, [user]);

    const searchPlaces = async (text: string): Promise<void> => {
        setQuery(text);
        if (text.length < 2) {
            setResults([]);
            return;
        }

        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            text
        )}&components=country:ph&types=(cities)&key=${GOOGLE_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            setResults(data.predictions || []);
        } catch (error) {
            console.error("Error fetching places:", error);
        }
    };

    const handleSelectPlace = async (place: any): Promise<void> => {
        try {
            const placeId = typeof place === "string" ? place : null;

            let name = "";
            let lat = 0;
            let lng = 0;

            if (placeId) {
                // From Google autocomplete
                const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
                const response = await fetch(detailsUrl);
                const data: PlaceDetailsResponse = await response.json();

                if (!data?.result) {
                    console.warn("No result found for place ID:", placeId);
                    return;
                }

                name = data.result.name;
                lat = data.result.geometry.location.lat;
                lng = data.result.geometry.location.lng;
            } else {
                // From Firestore recentSearches
                name = place.location_name;
                lat = place.lat;
                lng = place.lng;
            }

            // Save to Firestore recentSearches array (limit to 5)
            if (user?.uid) {
                const userRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(userRef);
                const userData = snapshot.exists() ? snapshot.data() : {};

                const updatedSearches = Array.isArray(userData.recentSearches)
                    ? [...userData.recentSearches]
                    : [];

                updatedSearches.unshift({
                    location_name: name,
                    lat,
                    lng,
                    timestamp: Date.now(),
                });

                // Keep only 5 most recent
                if (updatedSearches.length > 5) {
                    updatedSearches.splice(5);
                }

                await updateDoc(userRef, { recentSearches: updatedSearches });
                setRecentSearches(updatedSearches);
            }

            // Reset and navigate
            setResults([]);
            setQuery("");
            router.push({
                pathname: "/selectedPlace",
                params: { lat, lng, location_name: name },
            });
        } catch (error) {
            console.error("Error fetching or saving place details:", error);
        }
    };

    return (
        <ScrollView
            className="flex-1 mt-4"
            contentContainerStyle={{
                alignItems: "center",
                paddingTop,
                paddingBottom: 150,
            }}
            showsVerticalScrollIndicator={false}
        >
            {/* Search Bar */}
            <View
                className="w-[80%] h-14 bg-white rounded-3xl flex-row items-center px-6 mb-2"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 4,
                }}
            >
                <TextInput
                    className="flex-1 text-base"
                    placeholder="Search for a city..."
                    placeholderTextColor={"gray"}
                    value={query}
                    onChangeText={searchPlaces}
                    autoCorrect={false}
                />
                <EvilIcons name="search" size={24} color="black" />
            </View>

            {/* Search Results */}
            {results.length > 0 && (
                <View className="container border w-[80%] mt-4">
                    {results.map((item) => (
                        <TouchableOpacity
                            key={item.place_id}
                            onPress={() => handleSelectPlace(item.place_id)}
                            className="w-[100%] bg-white rounded-xl p-4 mb-3"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                                elevation: 3,
                            }}
                        >
                            <Text className="font-bold text-lg">
                                {item.structured_formatting.main_text}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                {item.structured_formatting.secondary_text}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Recent Searches */}
            <View className="w-[80%] mt-6">
                <Text className="text-gray-600 text-lg mb-3">
                    Recent Searches
                </Text>
                {query.length === 0 &&
                    recentSearches.length > 0 &&
                    recentSearches.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleSelectPlace(item)}
                            className="w-[100%] bg-white rounded-xl p-4 mb-3"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 3,
                                elevation: 3,
                            }}
                        >
                            <Text className="font-bold text-lg">
                                {item.location_name}
                            </Text>
                            <Text className="text-gray-500 text-sm">
                                {new Date(item.timestamp).toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>
        </ScrollView>
    );
}
