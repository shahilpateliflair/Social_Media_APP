const mongoose = require('mongoose');
const Chat = require('../models/chat');
const { ChatNotify }  = require('../models/chatNotify');
const { userModel }  = require('../models/login');
exports.sendMessage = async (req, res) => {
    const { sender, receiver, message } = req.body;
  
    try {
      const senderUser = await userModel.findById(sender);
      if (!senderUser) {
        return res.status(404).json({ message: 'Sender not found' });
      }
      const senderUsername = senderUser.name;

      const newChat = new Chat({ sender, receiver, message });
      await newChat.save();

      const notification = new ChatNotify({
        user: receiver,
        message: `You have a new message from ${senderUsername}`,
      senderUsername: senderUsername
      });
      await notification.save();
  

      res.status(201).json({ message: 'Message sent successfully', chat: newChat });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  };
  
  exports.getMessages = async (req, res) => {
    const { senderId, receiverId } = req.params;
  
    try {
      const messages = await Chat.find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      }).sort({ timestamp: 1 });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  };

  exports.getLastMessage = async (senderId, receiverId) => {
    try {
      // Ensure senderId and receiverId are valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        throw new Error('Invalid user IDs');
      }
  
      const lastMessage = await Chat.findOne({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId }
        ]
      }).sort({ timestamp: -1 });
  
      if (!lastMessage) {
        // throw new Error('Last message not found');
      }
  
      return lastMessage;
    } catch (error) {
      // console.error('Error fetching last message:', error);
      throw error;
    }
  };
