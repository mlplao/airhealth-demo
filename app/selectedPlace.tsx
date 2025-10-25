import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import airQualityService from "./components/airQualityService";
import CircularProgress from "./components/circleProgress";
import HealthRecommendationModal from "./components/healthRecommendationModal";
import "./global.css";
import Header from "./header";

export default function SelectedPlace() {
    const [modalVisible, setModalVisible] = useState(false);

    // Read parameters passed to this screen
    const { lat, lng, location_name } = useLocalSearchParams<{
        lat: string;
        lng: string;
        location_name: string;
    }>();

    const [airQuality, setAirQuality] = useState<{
        percentage: number;
        status: string;
    } | null>(null);
    const [pollutants, setPollutants] = useState<{
        pm25: number;
        pm10: number;
        o3: number;
        co: number;
        no2: number;
        so2: number;
    } | null>(null);

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
            <Text className="text-4xl font-bold text-black shadow-lg shadow-black/15 mb-4">
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
                    strokeWidth={25}
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
                [
                    { label: "PM2.5", value: `${pollutants.pm25} µg/m³` },
                    { label: "PM10", value: `${pollutants.pm10} µg/m³` },
                    { label: "O₃", value: `${pollutants.o3} µg/m³` },
                    { label: "CO", value: `${pollutants.co} µg/m³` },
                    { label: "NO₂", value: `${pollutants.no2} µg/m³` },
                    { label: "SO₂", value: `${pollutants.so2} µg/m³` },
                ].map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        className="w-[80%] h-[70px] bg-white rounded-[20px] mb-8 items-center justify-center flex flex-row p-6"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 6,
                        }}
                    >
                        <Text className="w-[60%] font-bold text-lg">
                            {item.label}
                        </Text>
                        <Text className="w-[40%] font-bold text-lg">
                            {item.value}
                        </Text>
                    </TouchableOpacity>
                ))
            ) : (
                <Text>Loading pollutants...</Text>
            )}
        </ScrollView>
    );
}
