import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularStatusProps {
    size?: number;
    color?: string; // AQI color
    status?: string; // AQI status text
}

const CircularStatus = ({
    size = 180,
    color = "#4CAF50",
    status = "Unknown",
}: CircularStatusProps) => {
    const radius = size / 2;

    return (
        <View
            className="items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
        >
            <Svg width={size} height={size}>
                {/* Filled Circle */}
                <Circle cx={radius} cy={radius} r={radius} fill={color} />
            </Svg>

            {/* Center Status Text */}
            <Text
                className="absolute font-bold text-black text-center"
                style={{
                    fontSize: 22,
                    width: size * 0.9,
                }}
            >
                {status}
            </Text>
        </View>
    );
};

export default CircularStatus;
