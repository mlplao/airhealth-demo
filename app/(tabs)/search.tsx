import React, { useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Api key for Google Places API
const GOOGLE_API_KEY = "AIzaSyCDnj-plCPLhZUgdc7VDGX-DITm2pZAYA8";

// ---------- Type Definitions ----------
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

// ---------- Component ----------
export default function Search() {
    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<PlacePrediction[]>([]);

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

    const handleSelectPlace = async (placeId: string): Promise<void> => {
        try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
            const response = await fetch(detailsUrl);
            const data: PlaceDetailsResponse = await response.json();

            if (!data?.result) {
                console.warn("No result found for place ID:", placeId);
                return;
            }

            const { name, geometry } = data.result;
            const { lat, lng } = geometry.location;

            console.log("Selected Place:", { name, lat, lng });
        } catch (error) {
            console.error("Error fetching place details:", error);
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
                    placeholder="Search for cities..."
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-base"
                    value={query}
                    onChangeText={searchPlaces}
                />
            </View>

            {/* Results List */}
            {results.map((item) => (
                <TouchableOpacity
                    key={item.place_id}
                    onPress={() => handleSelectPlace(item.place_id)}
                    className="w-[80%] bg-white rounded-xl p-4 mb-3"
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

            {results.length == 0 && (
                <Text className="text-gray-500 mt-10 w-[80%]">
                    Recently searched locations.
                </Text>
            )}
        </ScrollView>
    );
}
