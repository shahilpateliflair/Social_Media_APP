const { Schema, model, Types } = require("mongoose");

const postSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    caption: { type: String, required: true },

    video: { type: String },
    
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

const videoModel = model("reels", postSchema);
module.exports = { videoModel };
