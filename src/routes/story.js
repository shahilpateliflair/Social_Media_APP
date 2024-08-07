const express = require('express');
const router = express.Router();
const path = require('path');
const { storyModel } = require('../models/story'); // Destructure to get the storyModel
const { userModel } = require('../models/login'); // Destructure to get the userModel
const authenticateToken = require('../routes/user'); // Adjust if necessary
const upload = require('../routes/multer'); // Adjust if necessary

// Upload a story
router.post('/uploadStory/:id', upload.single('image'), async (req, res) => {
  const userId = req.params.id;
  const imagePath = req.file ? `/images/uploads/${req.file.filename}` : null;

  if (!userId || !imagePath) {
    return res.status(400).json({ message: 'Invalid user ID or missing image' });
  }

  try {
    const storyExpiresAt = new Date();
    storyExpiresAt.setHours(storyExpiresAt.getHours() + 24);

    const newStory = new storyModel({
      user: userId,
      image: imagePath,
      storyExpiresAt: storyExpiresAt,
    });

    const savedStory = await newStory.save();

    res.status(201).json({
      message: 'Story submitted successfully',
      story: savedStory,
    });
  } catch (error) {
    console.error('Error uploading story:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's stories
router.get('/story', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userStory = await storyModel.find({ user: userId });

    if (!userStory || userStory.length === 0) {
      return res.status(404).json({ message: 'User posts not found' });
    }

    res.status(200).json(userStory);
  } catch (error) {
    console.error('Error retrieving user posts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get stories from following users
router.get('/story/following', authenticateToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const currentUser = await userModel.findById(currentUserId).populate('following');

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followingUsersIds = currentUser.following.map((user) => user._id);
    const postsFromFollowingUsers = await storyModel.find({ user: { $in: followingUsersIds } })
      .populate('user')
      .sort({ createdAt: -1 });

    res.json(postsFromFollowingUsers);
  } catch (error) {
    console.error('Error fetching posts from following users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
