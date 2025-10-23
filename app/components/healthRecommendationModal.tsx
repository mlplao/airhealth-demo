import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface Props {
    visible: boolean;
    onClose: () => void;
    recommendation: string;
}

const HealthRecommendationModal: React.FC<Props> = ({
    visible,
    onClose,
    recommendation,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-2xl p-6 w-11/12">
                    <Text className="text-lg font-semibold mb-4 text-center">
                        Health Recommendation
                    </Text>
                    <Text className="text-base text-gray-700 mb-6 text-center">
                        {recommendation}
                    </Text>
                    <Pressable
                        onPress={onClose}
                        className="bg-green-500 py-2 rounded-lg"
                    >
                        <Text className="text-white text-center font-semibold">
                            Close
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default HealthRecommendationModal;
