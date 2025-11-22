// routes/notifications.js
import express from "express";
import {
    broadcastNotifications,
    sendPushNotification,
} from "../../services/notificationService.js";
import { db } from "../config/firebase.js";

const router = express.Router();

// Test sending notification to a single user
router.post("/single", async (req, res) => {
    const { expoPushToken, title, body } = req.body;

    if (!expoPushToken || !title || !body) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await sendPushNotification(expoPushToken, title, body);
    res.json(result);
});

// Send to ALL USERS
router.post("/broadcast", async (req, res) => {
    const { title, body } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: "Missing title or body" });
    }

    try {
        const snapshot = await db.collection("users").get();
        const users = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            users.push({
                userId: doc.id,
                expoPushToken: data.expoPushToken || null,
                name: data.name || null,
                email: data.email || null,
            });
        });

        const results = await broadcastNotifications(users, title, body);

        res.json({
            message: "Broadcast sent",
            totalSent: results.length,
            results,
        });
    } catch (err) {
        console.error("Error broadcasting:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
