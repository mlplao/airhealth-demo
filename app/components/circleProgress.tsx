import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressProps {
    percentage?: number;
    size?: number;
    strokeWidth?: number;
    color?: string; // <-- New color prop from API
}

const CircularProgress = ({
    percentage = 0,
    size = 120,
    strokeWidth = 16,
    color = "#4CAF50", // Default green if no color provided
}: CircularProgressProps) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (circumference * percentage) / 100;

    return (
        <View className="items-center justify-center">
            <Svg width={size} height={size}>
                {/* Background circle */}
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
                    stroke={color}
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
