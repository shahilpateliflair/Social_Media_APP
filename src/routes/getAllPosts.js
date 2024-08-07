const express = require("express");
const router = express.Router();
const { videoModel } = require("../models/video");
const { postModel } = require("../models/posts");
const { tweetModel } = require("../models/timeline");
const { userModel } = require("../models/login");
const  authenticateToken  = require("../routes/user");
const mongoose = require('mongoose');
router.get("/getAllPost", async (req, res) => {
  try {
    const posts = await postModel
      .find()
      .populate({
        path: "user",
        select: "name imageUrl",
      })
      .populate({
        path: "comments.user",
        select: "name imageUrl",
      })
      .select("image caption comments totalLikes");

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error retrieving user posts:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/getAllVideo", async (req, res) => {
  try {
    const videos = await videoModel.find().select("video");
    res.status(200).json({ videos });
  } catch (error) {
    console.error("Error retrieving videos:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/getAllTweets", async (req, res) => {
  try {
    const tweets = await tweetModel.find().populate({
      path: "user",
      select: "name imageUrl username",
    });

    res.status(200).json({ tweets });
  } catch (error) {
    console.error("Error retrieving tweets:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/getAllReelVideo", async (req, res) => {
  try {
    const posts = await videoModel.find().select("video");

    res.status(200).json({ posts });
  } catch (error) {
    // console.error("Error retrieving user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/:postId/comments", authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body; // No need to extract userId from the body

  try {
    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: req.userId, // Use req.userId obtained from the token
      comment: text,
      createdAt: new Date(),
    };

    // Add the new comment to the post's comments array
    post.comments.push(newComment);
    await post.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/:postId/getcomments", authenticateToken, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await postModel
      .findById(postId)
      .populate("user", "Image")
      .populate({
        path: "comments.user",
        select: "comments.imageUrl",
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.post("/:postId/like", async (req, res) => {
    const { userId } = req.body;
    const { postId } = req.params;
  
    try {
      const updatedPost = await postModel.findById(postId);
  
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      const likedByIndex = updatedPost.likedBy.indexOf(userId);
  
      if (likedByIndex === -1) {
        // User has not liked this post, add the like
        updatedPost.likedBy.push(userId);
        updatedPost.totalLikes++;
      } else {
        // User has already liked this post, remove the like
        updatedPost.likedBy.splice(likedByIndex, 1);
        updatedPost.totalLikes--;
      }
  
      const savedPost = await updatedPost.save();
  
      res.status(200).json({ message: "Post like status updated", updatedPost: savedPost });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.get("/:postId/isLikedBy/:userId", async (req, res) => {
    const { userId, postId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
  
    try {
      const post = await postModel.findById(postId);
  
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
  
      const isLikedByUser = post.likedBy.includes(userId);
      res.status(200).json({ isLiked: isLikedByUser });
    } catch (error) {
      console.error("Error checking if post is liked by user:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  router.get("/:userId/post", async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Count the total number of posts for the specified user
      const postCount = await postModel.countDocuments({ user: userId });
  
      res.status(200).json({ postCount });
    } catch (error) {
      console.error("Error fetching post count:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


router.get("/posts/following", authenticateToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const currentUser = await userModel
      .findById(currentUserId)
      .populate("following");

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingUsersIds = currentUser.following.map((user) => user._id);
    const postsFromFollowingUsers = await postModel
      .find({ user: { $in: followingUsersIds } })
      .populate("user")
      .populate({
        path: "comments.user",
        select: "_id name name imageUrl",
      })
      .sort({ createdAt: -1 }); // Sort by most recent posts first

    res.json(postsFromFollowingUsers);
  } catch (error) {
    console.error("Error fetching posts from following users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
