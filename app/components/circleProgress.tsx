import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

// Simple two-color interpolation
const interpolateColor = (color1: any, color2: any, factor: any) => {
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

// Multi-stop interpolation
const getInterpolatedColor = (percentage: number) => {
  const stops = [
    { pct: 0, color: "#8E24AA" }, // Purple - Hazardous
    { pct: 5, color: "#F44336" }, // Red - Very Unhealthy
    { pct: 20, color: "#FF9800" }, // Orange - Unhealthy
    { pct: 40, color: "#FFC107" }, // Yellow - Moderate
    { pct: 60, color: "#8BC34A" }, // Light Green - Good to Moderate
    { pct: 85, color: "#4CAF50" }, // Green - Good
    { pct: 100, color: "#4CAF50" }, // Cap at Green
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
          stroke="#f1f1f1ff"
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
      <Text className="absolute text-xl font-bold">{percentage}%</Text>
    </View>
  );
};

export default CircularProgress;
