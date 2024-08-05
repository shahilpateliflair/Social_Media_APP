const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    imageUrl: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: 'user', }],
    following: [{ type: Schema.Types.ObjectId, ref: 'user', }],
    // conversations: [{ type: Schema.Types.ObjectId, ref: 'conversation' }],
    age: { type: Number, default: null },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Other",
    },
    country: { type: String, default: null },
    username: { type: String, default: null },
    bio: { type: String, default: null },
    number: { type: String },
    active: { type: Boolean, default: false },
    lastActive: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const userModel = model("user", userSchema);
module.exports = { userModel };
