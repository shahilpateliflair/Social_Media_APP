const express = require('express');
const chatController = require('../controller/message');

const router = express.Router();
const {ChatNotify}  = require('../models/chatNotify');
const TypingStatus = require('../models/typingstatus');
const authenticateToken = require('./user');


router.post('/', chatController.sendMessage);
router.get('/messages/:senderId/:receiverId', chatController.getMessages);
// router.get('/last/:receiverId', chatController.getLastMessage); // Update route to specify senderId and receiverId

router.get('/last/:senderId/:receiverId', async (req, res) => {
    const { senderId, receiverId } = req.params;
    try {
      const lastMessage = await chatController.getLastMessage(senderId, receiverId);
      res.status(200).json(lastMessage);
    } catch (error) {
      console.error('Error fetching last message:', error);
      res.status(500).json({ message: 'Failed to fetch last message' });
    }
  });

 
router.get("/notifications", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const notifications = await ChatNotify.find({
      user: userId,
      seen: false,
    }).sort({ timestamp: -1 });

    // Respond with the notifications
    res.status(200).json({ notifications });

    // Delete the notifications after sending the response
    await ChatNotify.deleteMany({
      _id: { $in: notifications.map((n) => n._id) },
    });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({ message: "Failed to retrieve notifications" });
  }
});



router.post("/typing", async (req, res) => {
  const { senderId, receiverId, isTyping } = req.body;
  try {
    await TypingStatus.findOneAndUpdate(
      { senderId, receiverId },
      { isTyping, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true }); // Send success response
  } catch (error) {
    console.error('Error updating typing status:', error);
    res.status(500).json({ success: false, error: "Internal server error" }); // Send error response
  }
});
router.get("/typing-status/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const typingStatus = await TypingStatus.findOne({ senderId, receiverId });
    res.status(200).json({ isTyping: typingStatus ? typingStatus.isTyping : false });
  } catch (error) {
    console.error('Error fetching typing status:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;