// sicknessPollutantMap.ts
export const sicknessPollutantMap: Record<string, string[]> = {
    Asthma: ["pm25", "pm10", "o3", "no2"],
    "Allergic Rhinitis": ["pm25", "pm10", "o3"],
    COPD: ["pm25", "pm10", "o3", "no2"],
    "Heart Disease": ["pm25", "co", "no2"],
    Hypertension: ["pm25", "no2"],
    "Pneumonia (Recent)": ["pm25", "pm10"],
    "Tuberculosis (History)": ["pm25", "pm10"],
    Diabetes: ["pm25"],
    Pregnancy: ["pm25", "pm10", "o3"],
};
