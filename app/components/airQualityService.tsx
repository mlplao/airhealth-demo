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
    dominantPollutant: string;
}

export interface PollutantsData {
    pm25: { value: number; status: string };
    pm10: { value: number; status: string };
    o3: { value: number; status: string };
    co: { value: number; status: string };
    no2: { value: number; status: string };
    so2: { value: number; status: string };
}

const GOOGLE_API_KEY = "AIzaSyCDnj-plCPLhZUgdc7VDGX-DITm2pZAYA8"; // <-- replace with your key

// For pollutants status computation
function getPollutantStatus(code: string, value: number): string {
    switch (code) {
        case "o3":
            // O₃: EPA uses ppb, API returns ppb - Direct comparison
            // EPA standards: 0-54 ppb (Good), 55-70 ppb (Moderate), etc.
            if (value <= 54) return "Good";
            if (value <= 70) return "Moderate";
            if (value <= 85) return "Unhealthy for Sensitive";
            if (value <= 105) return "Unhealthy";
            if (value <= 200) return "Very Unhealthy";
            return "Hazardous";

        case "co":
            // CO: EPA uses ppm, API returns ppb - Convert ppb → ppm
            // 1 ppm = 1000 ppb
            const coPpm = value / 1000;
            if (coPpm <= 4.4) return "Good";
            if (coPpm <= 9.4) return "Moderate";
            if (coPpm <= 12.4) return "Unhealthy for Sensitive";
            if (coPpm <= 15.4) return "Unhealthy";
            if (coPpm <= 30.4) return "Very Unhealthy";
            return "Hazardous";

        case "pm25":
            // PM2.5: EPA uses µg/m³, API returns µg/m³ - Direct comparison
            if (value <= 12.0) return "Good";
            if (value <= 35.4) return "Moderate";
            if (value <= 55.4) return "Unhealthy for Sensitive";
            if (value <= 150.4) return "Unhealthy";
            if (value <= 250.4) return "Very Unhealthy";
            return "Hazardous";

        case "pm10":
            // PM10: EPA uses µg/m³, API returns µg/m³ - Direct comparison
            if (value <= 54) return "Good";
            if (value <= 154) return "Moderate";
            if (value <= 254) return "Unhealthy for Sensitive";
            if (value <= 354) return "Unhealthy";
            if (value <= 424) return "Very Unhealthy";
            return "Hazardous";

        case "no2":
            // NO₂: EPA uses ppb, API returns ppb - Direct comparison
            if (value <= 53) return "Good";
            if (value <= 100) return "Moderate";
            if (value <= 360) return "Unhealthy for Sensitive";
            if (value <= 649) return "Unhealthy";
            if (value <= 1249) return "Very Unhealthy";
            return "Hazardous";

        case "so2":
            // SO₂: EPA uses ppb, API returns ppb - Direct comparison
            if (value <= 35) return "Good";
            if (value <= 75) return "Moderate";
            if (value <= 185) return "Unhealthy for Sensitive";
            if (value <= 304) return "Unhealthy";
            if (value <= 604) return "Very Unhealthy";
            return "Hazardous";

        default:
            return "Unknown";
    }
}

function normalizedColorToHex(color: any): string {
    // Default gray if color is missing or invalid
    if (
        !color ||
        typeof color !== "object" ||
        (color.red == null && color.green == null && color.blue == null)
    ) {
        return "#A9A9A9";
    }

    // Helper: safely convert normalized color (0–1) to hex pair
    const toHex = (c: number | undefined) => {
        if (typeof c !== "number" || isNaN(c)) return "00"; // fallback to 0 if invalid
        return Math.round(Math.min(1, Math.max(0, c)) * 255)
            .toString(16)
            .padStart(2, "0")
            .toUpperCase();
    };

    // Provide fallback values for any missing channel
    const r = toHex(color.red ?? 0);
    const g = toHex(color.green ?? 0);
    const b = toHex(color.blue ?? 0);

    return `#${r}${g}${b}`;
}

function simplifyStatus(category: string): string {
    if (!category) return "Unknown";

    const lower = category.toLowerCase().trim();

    if (lower.includes("good") || lower.includes("excellent")) return "Good";
    if (lower.includes("moderate")) return "Moderate";
    if (lower.includes("low")) return "Low";
    if (
        lower.includes("unhealthy for sensitive") ||
        lower.includes("sensitive groups")
    )
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
    let min: number, max: number;

    switch (simplified) {
        case "Good":
            min = 90;
            max = 98;
            break;
        case "Moderate":
            min = 70;
            max = 89;
            break;
        case "Unhealthy for Sensitive":
            min = 50;
            max = 69;
            break;
        case "Unhealthy":
            min = 30;
            max = 49;
            break;
        case "Very Unhealthy":
            min = 10;
            max = 29;
            break;
        case "Hazardous":
            min = 0;
            max = 9;
            break;
        default:
            min = 0;
            max = 100;
    }

    // Constrain to category range
    raw = Math.min(max, Math.max(min, raw));

    // Add subtle variation (±2 points) while staying in range
    const variation = (Math.random() - 0.5) * 4;
    raw = Math.min(max, Math.max(min, raw + variation));

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
        let city = address?.city || address?.district || "Unknown";

        // Check for "San Fernando City" and rename it
        if (city === "San Fernando City") {
            city = "City of San Fernando";
        }

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            city,
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
            const dominantPollutant = data?.indexes?.[0]?.dominantPollutant;

            // Calculate percentage using improved algorithm
            const percentage = getAirQualityPercentage(aqi, rawCategory);

            // convert to hex
            const color = normalizedColorToHex(colorData);

            return { percentage, status, aqi, color, dominantPollutant };
        } catch (error) {
            console.error("Error fetching air quality:", error);
            return {
                percentage: 0,
                status: "Unavailable",
                aqi: 0,
                color: "#A9A9A9", // fallback gray
                dominantPollutant: "Unavailable",
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
                pm25: { value: 0, status: "Unknown" },
                pm10: { value: 0, status: "Unknown" },
                o3: { value: 0, status: "Unknown" },
                co: { value: 0, status: "Unknown" },
                no2: { value: 0, status: "Unknown" },
                so2: { value: 0, status: "Unknown" },
            };

            pollutants.forEach((p: any) => {
                const code = p.code?.toLowerCase();
                const value = p.concentration?.value || 0;
                const rounded = Math.round(value * 100) / 100;
                const status = getPollutantStatus(code, rounded);

                if (concentrations[code as keyof PollutantsData]) {
                    (
                        concentrations[code as keyof PollutantsData] as any
                    ).value = rounded;
                    (
                        concentrations[code as keyof PollutantsData] as any
                    ).status = status;
                }
            });

            return concentrations;
        } catch (error) {
            console.error("Error fetching pollutants:", error);
            return {
                pm25: { value: 0, status: "Unknown" },
                pm10: { value: 0, status: "Unknown" },
                o3: { value: 0, status: "Unknown" },
                co: { value: 0, status: "Unknown" },
                no2: { value: 0, status: "Unknown" },
                so2: { value: 0, status: "Unknown" },
            };
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
            case "Low":
                return "Air quality is slightly declining. Sensitive individuals may experience mild discomfort outdoors.";
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
