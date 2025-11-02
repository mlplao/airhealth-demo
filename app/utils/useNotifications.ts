import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { configureNotifications } from "./notifications";

export const useNotifications = () => {
    const router = useRouter();

    useEffect(() => {
        // Configure notification handler
        configureNotifications();

        // Handle notifications when app is open
        const notificationListener =
            Notifications.addNotificationReceivedListener((notification) => {
                console.log("Notification received:", notification);
            });

        // Handle notification taps
        const responseListener =
            Notifications.addNotificationResponseReceivedListener(
                (response) => {
                    console.log("Notification clicked:", response);
                    router.push("/(tabs)/home");
                }
            );

        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }, []);
};
