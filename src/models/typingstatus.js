const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const typingSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'user', required: true },
  
   
    isTyping: { type: Boolean, default: false },
}, 
{ timestamps: true }
);

const TypingStatus = model('TypingStatus', typingSchema);

module.exports = TypingStatus;