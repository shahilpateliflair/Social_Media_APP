const express = require('express');
const router = express.Router();
const {videoModel} = require('../models/video');
const {postModel} = require('../models/posts'); 
const {tweetModel} = require('../models/timeline'); 
const { authenticateToken } = require('../routes/user'); 

router.get("/getAllPost", async (req, res) => {
    try {
        const posts = await postModel.find().populate({
            path: "user",
            select: "name imageUrl",
        }).populate({
            path: "comments.user",
            select: "name imageUrl",
        }).select("image caption comments totalLikes");

        res.status(200).json({ posts });
    } catch (error) {
        console.error("Error retrieving user posts:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/getAllVideo", async (req, res) => {
    try {
        const videos = await videoModel.find().select('video');
        res.status(200).json({ videos });
    } catch (error) {
        console.error("Error retrieving videos:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/getAllTweets", async (req, res) => {
    try {
        const tweets = await tweetModel.find().populate({
            path: 'user',
            select: 'name imageUrl username'
        });

        res.status(200).json({ tweets });
    } catch (error) {
        console.error("Error retrieving tweets:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;