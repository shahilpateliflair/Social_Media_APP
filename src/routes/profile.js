const express = require("express");
const mongoose = require("mongoose");
const multer = require("../routes/multer"); // Adjust the path as necessary
const upload = require("../routes/multerVideo"); 
const authenticateToken = require("../routes/user"); // Adjust the path as necessary
const { userModel } = require("../models/login");
const { postModel } = require("../models/posts");
const { videoModel } = require("../models/video");
const { tweetModel } = require("../models/timeline");
const { storyModel } = require("../models/story");
const router = express.Router();

// Profile update route
router.patch("/profile/:id", multer.single("image"), async (req, res) => {
  const userId = req.params.id;
  const { name, email, address, username, bio, country, number, gender, age } = req.body;
  const imagePath = req.file ? `/images/uploads/${req.file.filename}` : null;

  try {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (address) updates.address = address;
    if (username) updates.username = username;
    if (bio) updates.bio = bio;
    if (country) updates.country = country;
    if (number) updates.number = number;
    if (gender) updates.gender = gender;
    if (age) updates.age = age;
    if (imagePath) updates.imageUrl = imagePath;

    const updatedUser = await userModel.findByIdAndUpdate(userId, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


// post route


router.post(
  "/upload/:id",
  multer.single("image"),
  async function (req, res, next) {
    const userId = req.params.id;
    const { caption } = req.body;

    console.log("Request Body:", req.body);

    if (!userId || !caption) {
      return res
        .status(400)
        .json({ message: "Invalid user ID or missing caption" });
    }

    const imagePath = req.file ? `/images/uploads/${req.file.filename}` : null;

    try {
      const newPost = new postModel({
        user: userId,
        caption,
        image: imagePath,
      });

      const savedPost = await newPost.save();

      res.status(200).json({
        message: "Post submitted successfully",
        post: savedPost,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get posts route
router.get("/post", authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const userPosts = await postModel.find({ user: userId });
  
      if (!userPosts || userPosts.length === 0) {
        return res.status(404).json({ message: "User posts not found" });
      }
  
      res.status(200).json(userPosts);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
// Route for uploading video posts
router.post(
  "/uploadVideo/:id",
  upload.single("video"),
  async function (req, res, next) {
    const userId = req.params.id;
    const { caption } = req.body;

    console.log("Request Body:", req.body);

    if (!userId || !caption) {
      return res
        .status(400)
        .json({ message: "Invalid user ID or missing caption" });
    }

    const videoPath = req.file ? `/images/videos/${req.file.filename}` : null;
    console.log("Video Path:", videoPath); // Log video path for debugging

    try {
      const newPost = new videoModel({
        user: userId,
        caption,
        video: videoPath,
      });

      console.log("New Video Post:", newPost);

      const savedPost = await newPost.save();

      console.log("Saved Video Post:", savedPost);

      res.status(200).json({
        message: "Post submitted successfully",
        post: savedPost,
      });
    } catch (error) {
      console.error("Error saving video post:", error);
      res.status(500).json({ message: "Failed to save video post" });
    }
  }
);
// Get videos route
router.get("/postVideo", authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const userPosts = await videoModel.find({ user: userId });
  
      if (!userPosts || userPosts.length === 0) {
        return res.status(404).json({ message: "User posts not found" });
      }
  
      res.status(200).json(userPosts);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  

  // Post tweets route
  router.post("/tweet/:id", async (req, res) => {
    const userId = req.params.id;
    const { tweet } = req.body;
  
    if (!userId || !tweet) {
      return res
        .status(400)
        .json({ message: "Invalid user ID or missing tweet content" });
    }
  
    try {
      const newTweet = new tweetModel({
        user: userId,
        tweet: tweet,
      });
  
      const savedTweet = await newTweet.save();
  
      res
        .status(201)
        .json({ message: "Tweet submitted successfully", tweet: savedTweet });
    } catch (error) {
      console.error("Error saving tweet:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  // Get tweets route
  router.get("/tweet", authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const tweets = await tweetModel.find({ user: userId });
  
      if (!tweets || tweets.length === 0) {
        return res.status(404).json({ message: "User tweets not found" });
      }
  
      res.status(200).json(tweets);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });



module.exports = router;




