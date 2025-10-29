// components/airQualityService.tsx
import * as Location from "expo-location";

export interface LocationData {
    latitude: number;
    longitude: number;
    city: string;
}

export interface AirQualityData {
    percentage: number;
    status: string;
    aqi: number; // Added AQI value for reference
    color: string; // Added color field (in hex format)
}

export interface PollutantsData {
    pm25: number;
    pm10: number;
    o3: number;
    co: number;
    no2: number;
    so2: number;
}

const GOOGLE_API_KEY = "AIzaSyCDnj-plCPLhZUgdc7VDGX-DITm2pZAYA8"; // <-- replace with your key

function normalizedColorToHex(color: any): string {
    if (!color) return "#A9A9A9"; // default gray if missing
    const toHex = (c: number) =>
        Math.round(c * 255)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase();
    return `#${toHex(color.red)}${toHex(color.green)}${toHex(color.blue)}`;
}

function simplifyStatus(category: string): string {
    if (!category) return "Unknown";

    const lower = category.toLowerCase();

    if (lower.includes("good") || lower.includes("excellent")) return "Good";
    if (lower.includes("moderate")) return "Moderate";
    if (lower.includes("unhealthy for sensitive groups"))
        return "Unhealthy for Sensitive";
    if (lower.includes("unhealthy")) return "Unhealthy";
    if (lower.includes("very unhealthy")) return "Very Unhealthy";
    if (lower.includes("hazardous")) return "Hazardous";

    return category.split(" ")[0];
}

function getAirQualityPercentage(aqi: number, category: string): number {
    // Convert AQI (0–500) into a 0–100 scale (inversely)
    // 0 AQI = 100%, 500 AQI = 0%
    let raw = Math.max(0, Math.min(100, 100 - (aqi / 500) * 100));

    // Adjust by category for smoother feel
    const simplified = simplifyStatus(category);
    switch (simplified) {
        case "Good":
            raw = Math.max(90, raw);
            break;
        case "Moderate":
            raw = Math.min(89, Math.max(70, raw));
            break;
        case "Unhealthy for Sensitive":
            raw = Math.min(69, Math.max(50, raw));
            break;
        case "Unhealthy":
            raw = Math.min(49, Math.max(30, raw));
            break;
        case "Very Unhealthy":
            raw = Math.min(29, Math.max(10, raw));
            break;
        case "Hazardous":
            raw = Math.min(9, Math.max(0, raw));
            break;
    }

    return Math.round(raw);
}

const airQualityService = {
    async getCurrentLocation(): Promise<LocationData> {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            throw new Error("Location permission not granted");
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });

        const address = reverseGeocode[0];

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            city: address?.city || address?.district || "Unknown",
        };
    },

    async getAirQuality(
        latitude: number,
        longitude: number
    ): Promise<AirQualityData> {
        try {
            const response = await fetch(
                `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: { latitude, longitude },
                        extraComputations: ["HEALTH_RECOMMENDATIONS"],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // index for testing purposes
            const index = data?.indexes?.[0] || {};
            const aqi = data?.indexes?.[0]?.aqi || 0;
            const rawCategory = data?.indexes?.[0]?.category || "Unknown";
            const status = simplifyStatus(rawCategory);
            const colorData = index?.color || null; // get color data

            // Calculate percentage using improved algorithm
            const percentage = getAirQualityPercentage(aqi, rawCategory);

            // convert to hex
            const color = normalizedColorToHex(colorData);

            return { percentage, status, aqi, color };
        } catch (error) {
            console.error("Error fetching air quality:", error);
            return {
                percentage: 0,
                status: "Unavailable",
                aqi: 0,
                color: "#A9A9A9", // fallback gray
            };
        }
    },

    async getPollutants(
        latitude: number,
        longitude: number
    ): Promise<PollutantsData> {
        try {
            const response = await fetch(
                `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        location: { latitude, longitude },
                        extraComputations: ["POLLUTANT_CONCENTRATION"],
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            const pollutants = data?.pollutants || [];
            const concentrations: PollutantsData = {
                pm25: 0,
                pm10: 0,
                o3: 0,
                co: 0,
                no2: 0,
                so2: 0,
            };

            pollutants.forEach((p: any) => {
                const code = p.code?.toLowerCase();
                const value = p.concentration?.value || 0;

                switch (code) {
                    case "pm25":
                        concentrations.pm25 = Math.round(value * 100) / 100; // Round to 2 decimal places
                        break;
                    case "pm10":
                        concentrations.pm10 = Math.round(value * 100) / 100;
                        break;
                    case "o3":
                        concentrations.o3 = Math.round(value * 100) / 100;
                        break;
                    case "co":
                        concentrations.co = Math.round(value * 100) / 100;
                        break;
                    case "no2":
                        concentrations.no2 = Math.round(value * 100) / 100;
                        break;
                    case "so2":
                        concentrations.so2 = Math.round(value * 100) / 100;
                        break;
                }
            });

            return concentrations;
        } catch (error) {
            console.error("Error fetching pollutants:", error);
            return { pm25: 0, pm10: 0, o3: 0, co: 0, no2: 0, so2: 0 };
        }
    },

    // Utility function to get color based on air quality percentage
    getAirQualityColor(percentage: number): string {
        if (percentage >= 85) return "#4CAF50"; // Green - Good
        if (percentage >= 60) return "#8BC34A"; // Light Green - Good to Moderate
        if (percentage >= 40) return "#FFC107"; // Yellow - Moderate to Unhealthy for Sensitive
        if (percentage >= 20) return "#FF9800"; // Orange - Unhealthy
        if (percentage >= 5) return "#F44336"; // Red - Very Unhealthy
        return "#8E24AA"; // Purple - Hazardous
    },

    // Utility function to get recommendation based on air quality
    getHealthRecommendation(status: string, percentage: number): string {
        switch (status) {
            case "Good":
                return "Air quality is excellent. Perfect for outdoor activities!";
            case "Moderate":
                return "Air quality is acceptable for most people. Sensitive individuals should consider limiting outdoor activities.";
            case "Unhealthy for Sensitive":
                return "Sensitive groups should avoid outdoor activities. Others can enjoy outdoor activities with caution.";
            case "Unhealthy":
                return "Everyone should limit outdoor activities, especially strenuous exercise.";
            case "Very Unhealthy":
                return "Avoid outdoor activities. Stay indoors with windows closed.";
            case "Hazardous":
                return "Health warning! Avoid all outdoor activities. Emergency conditions.";
            default:
                return "Air quality data unavailable. Check local conditions before outdoor activities.";
        }
    },
};

export default airQualityService;
