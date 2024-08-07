const express = require('express');
const router = express.Router();
const { notificationModel } = require('../models/notifications');
const authenticateToken = require('./user');

router.post("/notifications/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { message } = req.body;
        const newNotifications = new notificationModel({
            user: userId,
            message,
        });

        const savedNotifications = await newNotifications.save();
        res.status(201).json(savedNotifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/showNotifications", authenticateToken, async (req, res) => {
    try {
        const userId = req.userId;
        const userNotifications = await notificationModel.find({ user: userId });

        if (!userNotifications || userNotifications.length === 0) {
            return res.status(404).json({ message: "User posts not found" });
        }

        res.status(200).json(userNotifications);
    } catch (error) {
        console.error("Error retrieving user posts:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
