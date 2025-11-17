// services/notificationService.js
import fetch from "node-fetch";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send a single Expo push notification
 */
export async function sendPushNotification(
    expoPushToken,
    title,
    body,
    extraData = {}
) {
    if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
        console.warn("Invalid Expo push token:", expoPushToken);
        return { error: "Invalid Expo push token" };
    }

    const message = {
        to: expoPushToken,
        sound: "default",
        title,
        body,
        data: extraData,
    };

    try {
        const response = await fetch(EXPO_PUSH_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(message),
        });

        const data = await response.json();
        console.log("Notification Sent:", data);
        return data;
    } catch (err) {
        console.error("Error sending notification:", err);
        return { error: err.message };
    }
}

/**
 * Send notifications to many users at once
 */
export async function broadcastNotifications(users, title, body) {
    const results = [];

    for (const user of users) {
        if (!user.expoPushToken) continue;
        results.push(
            await sendPushNotification(user.expoPushToken, title, body, {
                userId: user.userId,
            })
        );
    }

    return results;
}
