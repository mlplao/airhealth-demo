import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

const API_KEY = "AIzaSyCDnj-plCPLhZUgdc7VDGX-DITm2pZAYA8";

const Airmap = () => {
    const [coords, setCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [heatmapVisible, setHeatmapVisible] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.error("Location permission not granted");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    if (!coords) {
        return <ActivityIndicator size="large" color="blue" />;
    }

    return (
        <View style={{ flex: 1 }}>
            <MapView
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.3,
                    longitudeDelta: 0.3,
                }}
                customMapStyle={[
                    {
                        elementType: "geometry",
                        stylers: [{ color: "#f5f5f5" }],
                    },
                    {
                        elementType: "labels.icon",
                        stylers: [{ visibility: "off" }],
                    },
                    {
                        elementType: "labels.text.fill",
                        stylers: [{ color: "#616161" }],
                    },
                    {
                        elementType: "labels.text.stroke",
                        stylers: [{ color: "#f5f5f5" }],
                    },
                    {
                        featureType: "administrative",
                        elementType: "geometry",
                        stylers: [{ visibility: "off" }],
                    },
                    { featureType: "poi", stylers: [{ visibility: "off" }] },
                    { featureType: "road", stylers: [{ color: "#ffffff" }] },
                    {
                        featureType: "transit",
                        stylers: [{ visibility: "off" }],
                    },
                    { featureType: "water", stylers: [{ color: "#e0e0e0" }] },
                ]}
            >
                <UrlTile
                    urlTemplate={`https://airquality.googleapis.com/v1/mapTypes/US_AQI/heatmapTiles/{z}/{x}/{y}?key=${API_KEY}`}
                    zIndex={0}
                    maximumZ={20}
                    flipY={false}
                    tileSize={256}
                    opacity={heatmapVisible ? 1 : 0}
                />

                {/* Marker */}
                <Marker
                    coordinate={coords}
                    title="You are here"
                    pinColor="#27AE60"
                />
            </MapView>

            {/* Bottom heatmap legend */}
            <View style={styles.legendContainer}>
                <View style={styles.legendHeader}>
                    <Text style={styles.legendTitle}>Heatmap</Text>
                    <Switch
                        value={heatmapVisible}
                        onValueChange={setHeatmapVisible}
                        trackColor={{ false: "#d1d5db", true: "#60a5fa" }}
                        thumbColor={heatmapVisible ? "#2563eb" : "#f4f4f5"}
                    />
                </View>

                {/* Gradient bar */}
                <LinearGradient
                    colors={["#ff0000", "#ffe600ff", "#06ca06ff"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.gradientBar}
                />

                {/* Labels under the bar */}
                <View style={styles.legendLabels}>
                    <Text style={styles.labelText}>Poor</Text>
                    <Text style={styles.labelText}>Excellent</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    legendContainer: {
        position: "absolute",
        bottom: 25,
        left: 20,
        right: 20,
        backgroundColor: "white",
        borderRadius: 12,
        padding: 14,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    legendHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    legendTitle: {
        fontWeight: "600",
        fontSize: 16,
    },
    gradientBar: {
        height: 6,
        borderRadius: 5,
    },
    legendLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
    },
    labelText: {
        fontSize: 12,
        color: "#6b7280",
    },
});

export default Airmap;
