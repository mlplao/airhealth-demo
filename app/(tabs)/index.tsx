import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StatusBar, Text, View } from "react-native";
import airQualityService, {
    LocationData,
} from "../components/airQualityService";
import CircularProgress from "../components/circleProgress";
import "../global.css";
import Header from "../header";
import Login from "../login";
import { useTabBarVisibility } from "./_layout";

export default function Index() {
    // For now, just a boolean. Later replace with Firebase auth check
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { setIsVisible } = useTabBarVisibility();

    // Hide tab bar when on login screen
    useEffect(() => {
        setIsVisible(isLoggedIn);
    }, [isLoggedIn]);

    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

    const [location, setLocation] = useState<LocationData | null>(null);
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

    useEffect(() => {
        // Only fetch data if logged in
        if (!isLoggedIn) return;

        (async () => {
            try {
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
            } catch (error) {
                console.error(error);
            }
        })();
    }, [isLoggedIn]);

    // Show login if not logged in
    if (!isLoggedIn) {
        return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

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

            {/* City */}
            <Text className="text-4xl font-bold text-black shadow-lg shadow-black/15 mb-4">
                {location ? location.city : "Loading location..."}
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
            <View className="mb-8 flex flex-row items-center justify-between gap-4">
                <Text className="font-bold text-2xl">
                    {airQuality?.status || "Unknown"}
                </Text>

                <Ionicons
                    className="shadow-md"
                    name="help-circle-outline"
                    size={28}
                    color="#8f8f8fff"
                />
            </View>

            {/* Map Display */}
            <View
                className="w-[80%] mb-8 p-4 rounded-[10px] flex items-center justify-center bg-white"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    elevation: 6,
                }}
            >
                <Link href={"/airmap"} className="font-bold text-lg">
                    View Map
                </Link>
            </View>

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
                    <View
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
                    </View>
                ))
            ) : (
                <Text>Loading pollutants...</Text>
            )}
        </ScrollView>
    );
}
