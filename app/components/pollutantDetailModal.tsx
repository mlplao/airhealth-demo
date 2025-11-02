import { AntDesign } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { PollutantInfo } from "../components/pollutantDetails";

type Props = {
    visible: boolean;
    onClose: () => void;
    pollutantInfo?: PollutantInfo;
};

export default function PollutantDetailModal({
    visible,
    onClose,
    pollutantInfo,
}: Props) {
    if (!pollutantInfo) return null;

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            {/* Background overlay */}
            <Pressable
                className="flex-1 bg-black/40 items-center justify-center"
                onPress={onClose}
            >
                {/* Modal content */}
                <Pressable
                    className="w-[85%] bg-white rounded-2xl p-6 shadow-lg"
                    onPress={(e) => e.stopPropagation()} // prevent closing when tapping inside
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold text-gray-900">
                            {pollutantInfo.displayName}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <AntDesign
                                name="close-circle"
                                size={22}
                                color="#555"
                            />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        className="max-h-[65vh]"
                    >
                        <Text className="text-base text-gray-800 mb-1 font-semibold">
                            {pollutantInfo.fullName}
                        </Text>

                        <Text className="text-sm text-gray-700 mb-4">
                            {pollutantInfo.description}
                        </Text>

                        <View className="border-t border-gray-200 my-3" />

                        <Text className="text-base font-semibold text-gray-900 mb-1">
                            Common Sources
                        </Text>
                        <Text className="text-sm text-gray-700 mb-4">
                            {pollutantInfo.sources}
                        </Text>

                        <View className="border-t border-gray-200 my-3" />

                        <Text className="text-base font-semibold text-gray-900 mb-1">
                            Health Effects
                        </Text>
                        <Text className="text-sm text-gray-700 mb-6">
                            {pollutantInfo.healthEffects}
                        </Text>

                        <Text className="text-xs text-gray-500 italic">
                            Unit: {pollutantInfo.units}
                        </Text>
                    </ScrollView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
