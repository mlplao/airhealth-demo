import { Entypo } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import airQualityService, {
    PollutantsData,
} from "./components/airQualityService";
import CircularStatus from "./components/circleProgress";
import HealthRecommendationModal from "./components/healthRecommendationModal";
import PollutantDetailModal from "./components/pollutantDetailModal";
import { pollutantDetails } from "./components/pollutantDetails";
import "./global.css";
import Header from "./header";

export default function SelectedPlace() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPollutant, setSelectedPollutant] = useState<string | null>(
        null
    );

    // Read parameters passed to this screen
    const { lat, lng, location_name } = useLocalSearchParams<{
        lat: string;
        lng: string;
        location_name: string;
    }>();

    const [airQuality, setAirQuality] = useState<{
        percentage: number;
        status: string;
        color?: string;
        dominantPollutant?: string;
    } | null>(null);

    const [pollutants, setPollutants] = useState<PollutantsData | null>(null);
    const [showAllPollutants, setShowAllPollutants] = useState(false);

    const recommendation = airQualityService.getHealthRecommendation(
        airQuality?.status || "Unknown",
        airQuality?.percentage || 0
    );

    useEffect(() => {
        if (!lat || !lng) return;

        (async () => {
            try {
                const aqi = await airQualityService.getAirQuality(
                    Number(lat),
                    Number(lng)
                );
                setAirQuality(aqi);

                const pol = await airQualityService.getPollutants(
                    Number(lat),
                    Number(lng)
                );
                setPollutants(pol);
            } catch (error) {
                console.error("Error fetching air quality data:", error);
            }
        })();
    }, [lat, lng]);

    // Pollutant key mapping for detail modal
    const pollutantKeyMap: Record<string, string> = {
        "PM2.5": "pm25",
        PM10: "pm10",
        "O₃": "o3",
        CO: "co",
        "NO₂": "no2",
        "SO₂": "so2",
    };

    return (
        <ScrollView
            className="flex-1"
            contentContainerStyle={{
                alignItems: "center",
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

            {/* City Name */}
            <Text className="text-3xl font-bold text-black shadow-lg shadow-black/15 mb-4">
                {location_name
                    ? location_name.toUpperCase()
                    : "Unknown Location"}
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

            <HealthRecommendationModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                recommendation={recommendation}
            />

            {/* Pollutants */}
            {pollutants ? (
                (() => {
                    const pollutantList = [
                        { label: "PM2.5", key: "pm25", data: pollutants.pm25 },
                        { label: "PM10", key: "pm10", data: pollutants.pm10 },
                        { label: "O₃", key: "o3", data: pollutants.o3 },
                        { label: "CO", key: "co", data: pollutants.co },
                        { label: "NO₂", key: "no2", data: pollutants.no2 },
                        { label: "SO₂", key: "so2", data: pollutants.so2 },
                    ];

                    const pollutantFriendlyNames: Record<string, string> = {
                        "PM2.5": "Tiny Particles",
                        PM10: "Coarse Dust",
                        "O₃": "Ozone",
                        CO: "Carbon Monoxide",
                        "NO₂": "Nitrogen Dioxide",
                        "SO₂": "Sulfur Dioxide",
                    };

                    const statusOrder = [
                        "Good",
                        "Moderate",
                        "Low",
                        "Unhealthy for Sensitive",
                        "Unhealthy",
                        "Very Unhealthy",
                        "Hazardous",
                    ];

                    const sortedPollutants = pollutantList.sort((a, b) => {
                        if (a.key === airQuality?.dominantPollutant) return -1;
                        if (b.key === airQuality?.dominantPollutant) return 1;
                        return 0;
                    });

                    const visiblePollutants = showAllPollutants
                        ? sortedPollutants
                        : [sortedPollutants[0]];

                    return (
                        <>
                            {visiblePollutants.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="w-[80%] bg-white rounded-[20px] mb-6 p-5 shadow-sm"
                                    onPress={() =>
                                        setSelectedPollutant(item.key)
                                    }
                                >
                                    <View className="flex-row items-center justify-between">
                                        {/* Left Side — pollutant name */}
                                        <View>
                                            <Text className="font-bold text-lg text-gray-900">
                                                {pollutantFriendlyNames[
                                                    item.label
                                                ] || item.label}
                                            </Text>
                                            <Text className="text-sm text-gray-500 mt-1">
                                                {item.label}
                                            </Text>
                                        </View>

                                        {/* Right Side — pollutant value and status */}
                                        <View className="items-end">
                                            <Text className="font-semibold text-lg text-gray-800">
                                                {item.data?.value ?? 0}
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
                                                                  "Low"
                                                              )
                                                            ? "text-amber-500"
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
                            ))}

                            {/* Toggle Button */}
                            <TouchableOpacity
                                className="mb-8 flex-row items-center justify-center"
                                onPress={() =>
                                    setShowAllPollutants(!showAllPollutants)
                                }
                                activeOpacity={0.8}
                            >
                                <Text className="text-gray-600 font-semibold text-base">
                                    {showAllPollutants
                                        ? "SHOW LESS"
                                        : "FULL BREAKDOWN"}
                                </Text>
                                <Entypo
                                    name={
                                        showAllPollutants
                                            ? "chevron-small-up"
                                            : "chevron-small-down"
                                    }
                                    size={22}
                                    color="#4B5563" // gray-600 color
                                    style={{ marginLeft: 4 }}
                                />
                            </TouchableOpacity>
                        </>
                    );
                })()
            ) : (
                <Text>Loading pollutants...</Text>
            )}

            {/* Pollutant Detail Modal */}
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
