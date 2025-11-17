import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
    try {
        const snapshot = await db.collection("users").get();
        const users = [];

        snapshot.forEach((doc) => {
            const data = doc.data();

            users.push({
                userId: doc.id,
                name: data.name || null,
                email: data.email || null,
                expoPushToken: data.expoPushToken || null,
                currentLong: data.currentLong || null,
                currentLat: data.currentLat || null,
                currentCity: data.currentCity || null,
                currentAqi: data.currentAqi || null,
            });
        });

        res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
