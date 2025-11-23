import { Entypo, Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface StetosProps {
    visible: boolean;
    onClose: () => void;
    sickness: string;
    pollutant: string;
    status: string;
}

export default function Stethos({
    visible,
    onClose,
    sickness,
    pollutant,
    status,
}: StetosProps) {
    if (!visible) return null;

    const isSafe = status === "Good";

    return (
        <Modal transparent animationType="fade" visible={visible}>
            <View className="flex-1 bg-black/40 items-center justify-center px-8">
                <View className="bg-white w-full rounded-2xl p-6">
                    {/* Header */}
                    <View className="flex-row items-center mb-3">
                        {isSafe ? (
                            <Feather
                                name="check-circle"
                                size={28}
                                color="#16a34a"
                            />
                        ) : (
                            <Entypo name="warning" size={28} color="#dc2626" />
                        )}

                        <Text
                            className={`ml-2 text-xl font-bold ${
                                isSafe ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {isSafe
                                ? "Air Quality is Safe"
                                : "Air Quality Warning"}
                        </Text>
                    </View>

                    {/* Message */}
                    {isSafe ? (
                        <>
                            <Text className="text-gray-700 text-base mb-2">
                                Air quality today looks{" "}
                                <Text className="font-semibold">safe</Text> for
                                people with{" "}
                                <Text className="font-semibold">
                                    {sickness}
                                </Text>
                                .
                            </Text>

                            <Text className="text-gray-700 text-base mb-3">
                                Dominant pollutant:{" "}
                                <Text className="font-semibold">
                                    {pollutant}
                                </Text>{" "}
                                ({status})
                            </Text>

                            <Text className="text-gray-600 text-base mb-6">
                                You may continue outdoor activities normally.
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-gray-700 text-base mb-1">
                                <Text className="font-semibold">
                                    {sickness}
                                </Text>{" "}
                                may worsen today.
                            </Text>

                            <Text className="text-gray-700 text-base mb-3">
                                Dominant pollutant:{" "}
                                <Text className="font-semibold">
                                    {pollutant}
                                </Text>{" "}
                                ({status})
                            </Text>

                            <Text className="text-gray-600 text-base mb-6">
                                This level may trigger breathing difficulty or
                                worsen existing symptoms. Avoid outdoor activity
                                whenever possible.
                            </Text>
                        </>
                    )}

                    {/* CLOSE BUTTON */}
                    <TouchableOpacity
                        onPress={onClose}
                        className={`rounded-xl py-3 active:opacity-80 ${
                            isSafe ? "bg-green-600" : "bg-red-600"
                        }`}
                    >
                        <Text className="text-white text-center font-semibold">
                            Close
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
