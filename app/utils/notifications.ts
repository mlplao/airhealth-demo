import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

// Configure how notifications behave when received while the app is foregrounded
export const configureNotifications = () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
};

// Request notification permissions and get token
export const setupNotifications = async (): Promise<string | null> => {
    if (!Device.isDevice) {
        console.log("Must use physical device for notifications");
        return null;
    }

    // Request permissions
    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") {
        Alert.alert(
            "Permission Required",
            "Please enable notifications to receive air quality alerts!"
        );
        return null;
    }

    // Get push token
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        return tokenData.data;
    } catch (error) {
        console.log("Error getting push token:", error);
        return null;
    }
};
