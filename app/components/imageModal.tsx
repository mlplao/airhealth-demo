import { AntDesign } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface ImageModalProps {
    visible: boolean;
    imageUri: string | null;
    onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
    visible,
    imageUri,
    onClose,
}) => {
    if (!imageUri) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Close Button */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <AntDesign name="close-circle" size={30} color="#fff" />
                </TouchableOpacity>

                {/* Zoomable Image */}
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.scrollContent}
                    maximumZoomScale={5}
                    minimumZoomScale={1}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    bouncesZoom={true}
                    centerContent={true}
                >
                    <Image
                        source={{ uri: imageUri }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 10,
    },
    scrollContainer: {
        width: "100%",
        height: "100%",
    },
    scrollContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    fullImage: {
        width: "100%",
        height: "100%",
    },
});

export default ImageModal;
