import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
// app.use("/api/reports", reportRoutes);
// app.use("/api/notifications", notificationRoutes);

// Default route
app.get("/", (req, res) => {
    res.send("AirHealth Backend is running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
