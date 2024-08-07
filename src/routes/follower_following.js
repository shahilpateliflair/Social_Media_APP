const express = require("express");
const { userModel } = require("../models/login"); // Ensure correct import of userModel
const authenticateToken = require('../routes/user'); // Ensure correct import of middleware
const router = express.Router();

router.post("/follow/:userId", authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;

  try {
    // Perform necessary operations to follow the user
    const userToFollow = await userModel.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already being followed
    if (userToFollow.followers.includes(currentUserId)) {
      return res.status(400).json({ error: "You are already following this user" });
    }

    // Update userToFollow and currentUser with the follow relationship
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    const currentUser = await userModel.findById(currentUserId);
    currentUser.following.push(userId);
    await currentUser.save();

    res.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/unfollow/:userId", authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;

  try {
    const userToUnfollow = await userModel.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUser = await userModel.findById(currentUserId);

    // Check if the current user is following the user to unfollow
    const isFollowing = currentUser.following.includes(userId);
    if (!isFollowing) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    // Remove userId from the currentUser's following array
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );

    // Remove currentUserId from the userToUnfollow's followers array
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/:userId/followers", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel
      .findById(userId)
      .populate("followers")
      .populate("following");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    res.status(200).json({ followersCount, followingCount });
    // res.status(200).json({ followersCount: user.followers.length },);
  } catch (error) {
    console.error("Error fetching followers count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:userId/following", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findById(userId).populate("following");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ followingCount: user.following.length });
  } catch (error) {
    console.error("Error fetching following count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
