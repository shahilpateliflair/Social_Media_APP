const express = require("express");
const Chat = require("../models/chat");
const userModel = require("../models/login");
const router = express.Router();

router.put("/message/:id", async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Chat.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


const updateLastActive = async (req, res, next) => {
    if (req.user) {
      try {
        await userModel.findByIdAndUpdate(req.user._id, {
          lastActive: Date.now(),
        });
      } catch (error) {}
    }
    next();
  };

  
router.get("/lastActivity/:id", updateLastActive, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("lastActive"); // Assuming you have a field 'lastActive' in your User model
    if (user) {
      res.json({ lastActive: user.lastActive });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
