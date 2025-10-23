import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

// Simple two-color interpolation
const interpolateColor = (color1: string, color2: string, factor: number) => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 0xff,
        g1 = (c1 >> 8) & 0xff,
        b1 = c1 & 0xff;
    const r2 = (c2 >> 16) & 0xff,
        g2 = (c2 >> 8) & 0xff,
        b2 = c2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `rgb(${r},${g},${b})`;
};

// Refined gradient logic — more "sensitive" and dynamic
// 90–100% → Clean nature green
// 86–89% → Slight green-yellow hint
// 70–85% → Orange/red alert transition
// Below 70% → Warning red to dark red
// 🌫️ Muted, natural gradient (less bright, smoother)
// 🌤 Softer, balanced color gradient (clean but not neon)
const getInterpolatedColor = (percentage: number) => {
    const stops = [
        { pct: 0, color: "#7E0023" }, // Maroon (Hazardous)
        { pct: 50, color: "#E74C3C" }, // Soft red (Unhealthy)
        { pct: 70, color: "#E67E22" }, // Orange (Moderate)
        { pct: 86, color: "#F1C40F" }, // Warm yellow (Approaching good)
        { pct: 90, color: "#82C91E" }, // Fresh green (Good)
        { pct: 100, color: "#27AE60" }, // Nature green (Excellent)
    ];

    for (let i = 0; i < stops.length - 1; i++) {
        const start = stops[i];
        const end = stops[i + 1];
        if (percentage >= start.pct && percentage <= end.pct) {
            const factor = (percentage - start.pct) / (end.pct - start.pct);
            return interpolateColor(start.color, end.color, factor);
        }
    }
    return stops[stops.length - 1].color;
};

const CircularProgress = ({ percentage = 0, size = 120, strokeWidth = 16 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    const strokeColor = getInterpolatedColor(percentage);

    return (
        <View className="items-center justify-center">
            <Svg width={size} height={size}>
                {/* Background track */}
                <Circle
                    stroke="#e6e6e6"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <Circle
                    stroke={strokeColor}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={size / 2}
                    originY={size / 2}
                />
            </Svg>
            <Text className="absolute text-xl font-bold text-gray-800">
                {percentage}%
            </Text>
        </View>
    );
};

export default CircularProgress;
