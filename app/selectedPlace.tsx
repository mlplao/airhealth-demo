import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import airQualityService, {
    PollutantsData,
} from "./components/airQualityService";
import CircularProgress from "./components/circleProgress";
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
    } | null>(null);

    const [pollutants, setPollutants] = useState<PollutantsData | null>(null);

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

            {/* City Name */}
            <Text className="text-4xl font-bold text-black shadow-lg shadow-black/15 mb-4 text-center px-3">
                {location_name || "Unknown Location"}
            </Text>

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
                <CircularProgress
                    percentage={airQuality?.percentage || 0}
                    size={180}
                    strokeWidth={10}
                    color={airQuality?.color}
                />
            </View>

            {/* Status */}
            <TouchableOpacity
                className="mb-8 flex flex-row items-center justify-between gap-4"
                onPress={() => setModalVisible(true)}
            >
                <Text className="font-bold text-2xl text-black">
                    {airQuality?.status || "Unknown"}
                </Text>
                <AntDesign name="question-circle" size={20} color="#000000ff" />
            </TouchableOpacity>

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

                    return pollutantList.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="w-[80%] bg-white rounded-[20px] mb-6 p-5"
                            onPress={() => {
                                const key = pollutantKeyMap[item.label];
                                setSelectedPollutant(key); // Open modal with details
                            }}
                            activeOpacity={0.9}
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
