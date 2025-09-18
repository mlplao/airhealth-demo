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

function getAirQualityPercentage(aqi: number, category: string): number {
  // First try category-based approach (more reliable)
  const simplified = simplifyStatus(category);

  switch (simplified) {
    case "Good":
      // Good air quality: 85-100% based on how close to 0 AQI
      return Math.max(85, Math.min(100, Math.round(100 - (aqi / 50) * 15)));

    case "Moderate":
      // Moderate air quality: 60-85%
      return Math.max(
        60,
        Math.min(85, Math.round(85 - ((aqi - 50) / 50) * 25))
      );

    case "Unhealthy for Sensitive":
      // Unhealthy for sensitive groups: 40-60%
      return Math.max(
        40,
        Math.min(60, Math.round(60 - ((aqi - 100) / 50) * 20))
      );

    case "Unhealthy":
      // Unhealthy: 20-40%
      return Math.max(
        20,
        Math.min(40, Math.round(40 - ((aqi - 150) / 50) * 20))
      );

    case "Very Unhealthy":
      // Very unhealthy: 5-20%
      return Math.max(
        5,
        Math.min(20, Math.round(20 - ((aqi - 200) / 100) * 15))
      );

    case "Hazardous":
      // Hazardous: 0-5%
      return Math.max(0, Math.min(5, Math.round(5 - ((aqi - 300) / 200) * 5)));

    default:
      // Fallback: Use AQI-based calculation assuming EPA scale
      if (aqi <= 50) return Math.round(100 - (aqi / 50) * 15); // 85-100%
      if (aqi <= 100) return Math.round(85 - ((aqi - 50) / 50) * 25); // 60-85%
      if (aqi <= 150) return Math.round(60 - ((aqi - 100) / 50) * 20); // 40-60%
      if (aqi <= 200) return Math.round(40 - ((aqi - 150) / 50) * 20); // 20-40%
      if (aqi <= 300) return Math.round(20 - ((aqi - 200) / 100) * 15); // 5-20%
      return Math.max(0, Math.round(5 - ((aqi - 300) / 200) * 5)); // 0-5%
  }
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

      const aqi = data?.indexes?.[0]?.aqi || 0;
      const rawCategory = data?.indexes?.[0]?.category || "Unknown";
      const status = simplifyStatus(rawCategory);

      // Calculate percentage using improved algorithm
      const percentage = getAirQualityPercentage(aqi, rawCategory);

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
