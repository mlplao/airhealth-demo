import { Entypo } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../firebaseconfig";
import { useAuth } from "../context/authContext";

export default function SickSurvey({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const { user } = useAuth();
    const [selected, setSelected] = useState<string | null>(null);

    const sicknessOptions = [
        "None",
        "Asthma",
        "Allergic Rhinitis",
        "Chronic Obstructive Pulmonary Disease (COPD)",
        "Heart Disease",
        "Hypertension",
        "Pneumonia (Recent)",
        "Tuberculosis (History)",
        "Diabetes",
        "Pregnant",
    ];

    const handleSave = async () => {
        if (!selected || !user?.uid) return;

        await setDoc(
            doc(db, "users", user.uid),
            { sickness: selected },
            { merge: true }
        );

        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            {/* Background overlay */}
            <View className="flex-1 bg-black/40 items-center justify-center px-6">
                {/* Modal Card */}
                <View className="bg-white w-full rounded-2xl p-6">
                    <Text className="text-2xl font-bold text-gray-800 mb-4">
                        Do you have any health condition?
                    </Text>
                    <Text className="text-gray-600 mb-4">
                        This helps AirHealth give you safer recommendations.
                    </Text>

                    {/* List */}
                    <ScrollView className="max-h-[300px] mb-8">
                        {sicknessOptions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                className="flex-row items-center justify-between py-3 border-b border-gray-200"
                                onPress={() => setSelected(item)}
                            >
                                <Text className="text-gray-800 text-base">
                                    {item}
                                </Text>

                                {selected === item && (
                                    <Entypo
                                        name="check"
                                        size={22}
                                        color="#16a34a"
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={!selected}
                        className={`py-3 rounded-xl ${
                            selected ? "bg-green-600" : "bg-gray-300"
                        }`}
                        activeOpacity={0.8}
                    >
                        <Text className="text-center text-white text-lg font-semibold">
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
