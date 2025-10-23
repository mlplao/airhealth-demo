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

function simplifyStatus(category: string): string {
    if (!category) return "Unknown";

    const lower = category.toLowerCase();

    if (lower.includes("good")) return "Good";
    if (lower.includes("moderate")) return "Moderate";
    if (lower.includes("unhealthy for sensitive groups"))
        return "Unhealthy for Sensitive";
    if (lower.includes("unhealthy")) return "Unhealthy";
    if (lower.includes("very unhealthy")) return "Very Unhealthy";
    if (lower.includes("hazardous")) return "Hazardous";

    return category.split(" ")[0];
}

function getAirQualityPercentage(
    aqi: number,
    scale: "universal" | "us" = "universal"
): number {
    // Convert UAQI → US AQI approximation (based on empirical mapping)
    // Source: Google Air Quality docs + EPA scale comparison
    let usAqi = aqi;
    if (scale === "universal") {
        if (aqi <= 50) {
            usAqi = aqi * 1.3; // slight boost for lower values
        } else if (aqi <= 100) {
            usAqi = 50 + (aqi - 50) * 1.4;
        } else if (aqi <= 200) {
            usAqi = 120 + (aqi - 100) * 1.2;
        } else {
            usAqi = aqi * 1.1; // rough linear stretch for high values
        }
    }

    // Now apply your standard US AQI → % conversion
    let percent: number;

    if (usAqi <= 50) {
        // Good (Green)
        percent = 90 + (50 - usAqi) * 0.2;
    } else if (usAqi <= 100) {
        // Moderate (Yellow)
        percent = 90 - ((usAqi - 50) / 50) * 20;
    } else if (usAqi <= 150) {
        // Unhealthy for Sensitive Groups (Orange)
        percent = 70 - ((usAqi - 100) / 50) * 20;
    } else if (usAqi <= 200) {
        // Unhealthy (Red)
        percent = 50 - ((usAqi - 150) / 50) * 20;
    } else if (usAqi <= 300) {
        // Very Unhealthy (Purple)
        percent = 30 - ((usAqi - 200) / 100) * 20;
    } else {
        // Hazardous (Maroon)
        percent = Math.max(0, 10 - ((usAqi - 300) / 200) * 10);
    }

    return Math.max(0, Math.min(100, Math.round(percent)));
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

            // Calculate percentage using improved algorithm
            const percentage = getAirQualityPercentage(aqi);

            return { percentage, status, aqi };
        } catch (error) {
            console.error("Error fetching air quality:", error);
            return { percentage: 0, status: "Unavailable", aqi: 0 };
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
