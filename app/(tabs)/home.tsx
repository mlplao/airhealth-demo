import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
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
import CircularProgress from "../components/circleProgress";
import "../global.css";
import Header from "../header";
// Vector Icons
import { AntDesign } from "@expo/vector-icons";
import HealthRecommendationModal from "../components/healthRecommendationModal";
// Auth
import { useAuth } from "../context/authContext";
// Firestore
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
// Notifications
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// Configure how notifications behave when received while the app is foregrounded
export default function Index() {
    const { user } = useAuth();
    const paddingTop =
        Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;
    const [modalVisible, setModalVisible] = useState(false);

    // Health recommendation based on air quality status
    const [location, setLocation] = useState<LocationData | null>(null);
    const [airQuality, setAirQuality] = useState<{
        percentage: number;
        status: string;
        color: string;
        aqi: number;
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

    // Request notification permissions and get token
    const setupNotifications = async () => {
        if (!Device.isDevice) {
            console.log("Must use physical device for notifications");
            return null;
        }

        // Request permissions
        const { status: existingStatus } =
            await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            Alert.alert(
                "Permission Required",
                "Please enable notifications to receive air quality alerts!"
            );
            return null;
        }

        // Get push token
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            return tokenData.data;
        } catch (error) {
            console.log("Error getting push token:", error);
            return null;
        }
    };

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

        // Handle notifications when app is open
        const notificationListener =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("Notification received:", notification);
            });

        // Handle notification taps
        const responseListener =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log("Notification clicked:", response);
                    router.push("/(tabs)/home");
                }
            );

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
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
