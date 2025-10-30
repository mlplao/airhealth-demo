import express from "express";
import { db } from "../config/firebase.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const snapshot = await db.collection("reports").get();
        const reports = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        res.json(reports);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
});

export default router;
