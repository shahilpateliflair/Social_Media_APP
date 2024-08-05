const { Schema, model, Types } = require("mongoose");

const storySchema= new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    image: { type: String, required: true },
    storyExpiresAt: { type: Date, required: true,expires: 0  },
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

const storyModel = model("story", storySchema);
module.exports = { storyModel };
