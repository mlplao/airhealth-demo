import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import airQualityService, {
    LocationData,
} from "../components/airQualityService";
import "../global.css";
import Header from "../header";
// Vector Icons
// Modals
import PollutantDetailModal from "../components/pollutantDetailModal";
import { pollutantDetails } from "../components/pollutantDetails";
// Auth
import { useAuth } from "../context/authContext";
// Firestore
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
// Notifications
import CircularStatus from "../components/circleProgress";
import { setupNotifications } from "../utils/notifications";

export default function Index() {
    const { user } = useAuth();
    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
    const [selectedPollutant, setSelectedPollutant] = useState<string | null>(
        null
    );

    // Recommendation data message
    const [recommendation, setRecommendation] = useState<string>(
        "Fetching air quality details..."
    );

    // Health recommendation based on air quality status
    const [location, setLocation] = useState<LocationData | null>(null);
    const [airQuality, setAirQuality] = useState<{
        percentage: number;
        status: string;
        color: string;
        aqi: number;
    } | null>(null);
    const [pollutants, setPollutants] = useState<{
        pm25: { value: number; status: string };
        pm10: { value: number; status: string };
        o3: { value: number; status: string };
        co: { value: number; status: string };
        no2: { value: number; status: string };
        so2: { value: number; status: string };
    } | null>(null);

    useEffect(() => {
        if (airQuality) {
            const rec = airQualityService.getHealthRecommendation(
                airQuality.status,
                airQuality.percentage
            );
            setRecommendation(rec);
        }
    }, [airQuality]);

    const saveToFirestore = async (
        loc: LocationData,
        aqi: number,
        token: string | null
    ) => {
        if (!user?.uid) return;

        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(
                userRef,
                {
                    currentCity: loc.city,
                    currentLong: loc.longitude,
                    currentLat: loc.latitude,
                    currentAqi: aqi,
                    expoPushToken: token,
                },
                { merge: true }
            );
            console.log("Data saved to Firestore successfully");
        } catch (error) {
            console.error("Error saving to Firestore:", error);
        }
    };

    const pollutantKeyMap: Record<string, string> = {
        "PM2.5": "pm25",
        PM10: "pm10",
        "O₃": "o3",
        CO: "co",
        "NO₂": "no2",
        "SO₂": "so2",
    };

    useEffect(() => {
        (async () => {
            try {
                // Setup notifications and get token
                const pushToken = await setupNotifications();

                // Get location and air quality data
                const loc = await airQualityService.getCurrentLocation();
                setLocation(loc);

                const aqi = await airQualityService.getAirQuality(
                    loc.latitude,
                    loc.longitude
                );
                setAirQuality(aqi);

                const pol = await airQualityService.getPollutants(
                    loc.latitude,
                    loc.longitude
                );
                setPollutants(pol);

                // Save everything to Firestore
                await saveToFirestore(loc, aqi.aqi, pushToken);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

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

            {/* AQI Circle */}
            <View
                className="w-[80%] h-[200px] mb-4 items-center justify-center"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 6,
                }}
            >
                <CircularStatus
                    size={180}
                    color={airQuality?.color}
                    status={airQuality?.status}
                />
            </View>

            {/* City */}
            <Text className="text-3xl font-bold text-black shadow-lg shadow-black/15 mb-4">
                {location ? location.city.toUpperCase() : "Loading location..."}
            </Text>

            {/* Air Recommendation */}
            <View
                className={`w-[80%] mb-8 items-center px-6 py-4 rounded-2xl bg-gray-50 shadow-sm border 
    ${
        airQuality?.status === "Good"
            ? "border-green-400"
            : airQuality?.status === "Moderate"
              ? "border-yellow-400"
              : airQuality?.status === "Low"
                ? "border-amber-500"
                : airQuality?.status === "Unhealthy for Sensitive"
                  ? "border-orange-400"
                  : airQuality?.status === "Unhealthy"
                    ? "border-red-400"
                    : airQuality?.status === "Very Unhealthy"
                      ? "border-purple-400"
                      : airQuality?.status === "Hazardous"
                        ? "border-rose-500"
                        : "border-gray-200"
    }`}
            >
                <Text className="text-gray-700 text-center text-base leading-relaxed">
                    {recommendation || "Fetching air quality details..."}
                </Text>
            </View>

            {/* Map Display */}
            <View className="w-[80%] mb-8 rounded-[12px] p-[2px]">
                {/* Rainbow border layer */}
                <LinearGradient
                    colors={[
                        "#FF6B6B", // red
                        "#FFD93D", // yellow
                        "#6BCB77", // green
                        "#4D96FF", // blue
                        "#A66BFF", // purple
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        borderRadius: 12,
                        padding: 2, // thickness of rainbow border
                    }}
                >
                    {/* Inner white button */}
                    <TouchableOpacity
                        onPress={() => router.push("/airmap")}
                        activeOpacity={0.8}
                        className="flex items-center justify-center bg-white rounded-[10px] p-4"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 6,
                        }}
                    >
                        <Text className="font-bold text-lg text-gray-800">
                            Air-Health Map
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Pollutants */}
            {/* Pollutants */}
            {pollutants ? (
                (() => {
                    // Fix label → key mapping (handles subscripts & dots)
                    const pollutantKeyMap: Record<string, string> = {
                        "PM2.5": "pm25",
                        PM10: "pm10",
                        "O₃": "o3",
                        CO: "co",
                        "NO₂": "no2",
                        "SO₂": "so2",
                    };

                    // List of pollutants to display — now using pollutants with { value, status }
                    const pollutantList = [
                        { label: "PM2.5", key: "pm25", data: pollutants.pm25 },
                        { label: "PM10", key: "pm10", data: pollutants.pm10 },
                        { label: "O₃", key: "o3", data: pollutants.o3 },
                        { label: "CO", key: "co", data: pollutants.co },
                        { label: "NO₂", key: "no2", data: pollutants.no2 },
                        { label: "SO₂", key: "so2", data: pollutants.so2 },
                    ];

                    return pollutantList.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="w-[80%] bg-white rounded-[20px] mb-6 p-5"
                            onPress={() => {
                                const key = pollutantKeyMap[item.label];
                                setSelectedPollutant(key);
                            }}
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.15,
                                shadowRadius: 6,
                                elevation: 6,
                            }}
                        >
                            {/* Top Row: Label (left) and Value (right) */}
                            <View className="flex-row items-center justify-between">
                                <Text className="font-bold text-lg text-gray-900">
                                    {item.label}
                                </Text>
                                <View className="items-end">
                                    <Text className="font-semibold text-lg text-gray-800">
                                        {item.data?.value ?? 0} µg/m³
                                    </Text>
                                    <Text
                                        className={`text-sm font-medium mt-1 ${
                                            item.data?.status === "Good"
                                                ? "text-green-600"
                                                : item.data?.status?.includes(
                                                        "Moderate"
                                                    )
                                                  ? "text-yellow-600"
                                                  : item.data?.status?.includes(
                                                          "Unhealthy for Sensitive"
                                                      )
                                                    ? "text-orange-600"
                                                    : item.data?.status?.includes(
                                                            "Unhealthy"
                                                        )
                                                      ? "text-red-600"
                                                      : item.data?.status?.includes(
                                                              "Very Unhealthy"
                                                          )
                                                        ? "text-purple-600"
                                                        : item.data?.status?.includes(
                                                                "Hazardous"
                                                            )
                                                          ? "text-rose-700"
                                                          : "text-gray-600"
                                        }`}
                                    >
                                        {item.data?.status || "Unknown"}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ));
                })()
            ) : (
                <Text>Loading pollutants...</Text>
            )}

            {/* 🧩 Pollutant Detail Modal */}
            <PollutantDetailModal
                visible={!!selectedPollutant}
                onClose={() => setSelectedPollutant(null)}
                pollutantInfo={
                    selectedPollutant
                        ? pollutantDetails[selectedPollutant]
                        : undefined
                }
            />
        </ScrollView>
    );
}
