// routes/tweetRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const  authenticateToken  = require('../routes/user'); 
const { tweetModel } = require('../models/timeline'); 



router.post('/:tweetId/liketweet', authenticateToken, async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user.id;

  console.log("Received request to like tweet:", tweetId, "by user:", userId);

  try {
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      console.log("Invalid tweet ID format:", tweetId);
      return res.status(400).json({ message: "Invalid tweet ID format" });
    }

    const tweet = await tweetModel.findById(tweetId);

    if (!tweet) {
      console.log("Tweet not found with ID:", tweetId);
      return res.status(404).json({ message: "Post not found" });
    }

    const likedByIndex = tweet.likedBy.indexOf(userId);

    if (likedByIndex === -1) {
      // Like the tweet
      tweet.likedBy.push(userId);
      tweet.totalLikes++;
    } else {
      // Unlike the tweet
      tweet.likedBy.splice(likedByIndex, 1);
      tweet.totalLikes--;
    }

    // Save the updated tweet
    const savedTweet = await tweet.save();

    return res
      .status(200)
      .json({ message: "Post like status updated", updatedTweet: savedTweet });
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


router.get('/:tweetId/isLiked/:userId', async (req, res) => {
  const { userId, tweetId } = req.params;

  try {
    const tweet = await tweetModel.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLikedByUser = tweet.likedBy.includes(userId);
    res.status(200).json({ isLiked: isLikedByUser });
  } catch (error) {
    console.error("Error checking if tweet is liked by user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Tweets
router.get('/getAllTweets', async (req, res) => {
  try {
    const posts = await tweetModel.find().populate({
      path: "user",
      select: "name imageUrl username",
    });

    res.status(200).json({ posts });
  } catch (error) {
    // console.error("Error retrieving user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
