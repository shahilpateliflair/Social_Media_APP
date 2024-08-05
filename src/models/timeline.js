const { Schema, model, Types } = require("mongoose");

const tweetSchema= new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    tweet: { type: String, required: true },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    totalLikes: { type: Number, default: 0 },
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

const tweetModel = model("tweet", tweetSchema);
module.exports = { tweetModel };
