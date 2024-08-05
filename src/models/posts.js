const { Schema, model, Types } = require("mongoose");
const replySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false } // We use _id: false because replies are embedded documents.
);
const postSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    caption: { type: String, required: true },
    image: { type: String },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'user' }],
    totalLikes: { type: Number, default: 0 },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'user', required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        replies: [replySchema]
      }
    ]
    
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


const postModel = model("post", postSchema);
module.exports = { postModel };
