const express = require("express");
const mongoose = require("mongoose");
const { Types } = require("mongoose");
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
app.use(express.json());
const bcrypt = require("bcryptjs");

const { userModel } = require("../src/models/login");
const { postModel } = require("../src/models/posts");
const { videoModel } = require("../src/models/video");
const { storyModel } = require("../src/models/story");
const { tweetModel } = require("../src/models/timeline");
const { notificationModel } = require("../src/models/notifications");
const { Chat } = require("../src/models/chat");

const TypingStatus = require("../src/models/typingstatus");
const Message = require("./models/chat");
// const chatController = require('./controller/message');
const chatRouter = require("./routes/messagechat");
const OTPRoutes = require("./routes/otp");

const loginRoutes = require("../src/routes/login");
const userProfileRoutes = require("../src/routes/profile"); 
const fetchAllRoutes = require("../src/routes/getAllPosts"); 
const partial = require("../src/routes/partial"); 

const authRoutes = require("../src/routes/user");
var path = require("path");
const upload = require("../src/routes/multer");
const uploadVideo = require("../src/routes/multerVideo");
const authenticateToken = require("../src/routes/user");



const JWT_SECRET = "your_jwt_secret";

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

// mongoose.connect("mongodb://localhost:27017/social-media");
const MONGOURI='mongodb+srv://shahilkumarpatel9393:EB7T7mrXq1BMTXFb@social-media.dimhcce.mongodb.net/'

mongoose.connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });


app.get("/" ,async (req, res)=>{
  await res.send("Project on");
})
app.use("/auth",  loginRoutes);
app.use("/userProfile", userProfileRoutes);
app.use("/fetchAllUserData",fetchAllRoutes);
app.use("/partial", partial);
app.use("/chats", chatRouter);
app.use("/api", OTPRoutes);

app.put("/message/:id", async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true }
    );
    res.json(message);
  } catch (error) {
    // console.error('Error updating message status:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// app.use('/public', express.static(path.join(__dirname, '..', 'public')));
const publicDirectoryPath = path.join(__dirname, "public");

app.use(express.static(publicDirectoryPath));



app.get("/user/:userId/following", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUser = await userModel
      .findById(userId)
      .populate("following", "_id");

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const followingIds = currentUser.following.map((user) => user._id);
    const notFollowingUsers = await userModel.find({
      _id: { $nin: followingIds },
    });

    res.status(200).json({ notFollowingUsers });
  } catch (error) {
    console.error("Error fetching not following users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/getFollowerUsers", authenticateToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const users = await userModel.find().lean(); // Retrieve all users
    const currentUser = await userModel.findById(currentUserId).lean();

    // Add isFollowed property to each user
    users.forEach((user) => {
      user.isFollowed = currentUser.following.includes(user._id.toString());
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/getAllVideo", async (req, res) => {
  try {
    const posts = await videoModel.find().select("video");

    res.status(200).json({ posts });
  } catch (error) {
    // console.error("Error retrieving user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/uploadStory/:id", upload.single("image"), async (req, res) => {
  const userId = req.params.id;
  const imagePath = req.file ? `/images/uploads/${req.file.filename}` : null;

  if (!userId || !imagePath) {
    return res
      .status(400)
      .json({ message: "Invalid user ID or missing image" });
  }

  try {
    const storyExpiresAt = new Date();
    storyExpiresAt.setHours(storyExpiresAt.getHours() + 24);
    // storyExpiresAt.setMinutes(storyExpiresAt.getMinutes() + 1);

    const newStory = new storyModel({
      user: userId,
      image: imagePath,
      storyExpiresAt: storyExpiresAt,
    });

    const savedStory = await newStory.save();

    res.status(201).json({
      message: "Story submitted successfully",
      story: savedStory,
    });
  } catch (error) {
    console.error("Error uploading story:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/story", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userStory = await storyModel.find({ user: userId });

    if (!userStory || userStory.length === 0) {
      return res.status(404).json({ message: "User posts not found" });
    }

    res.status(200).json(userStory);
  } catch (error) {
    console.error("Error retrieving user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/getAllTweets", async (req, res) => {
  try {
    const posts = await tweetModel.find().populate({
      path: "user",
      select: "name imageUrl username",
    });

    res.status(200).json({ posts });
  } catch (error) {
    // console.error("Error retrieving user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.post("/notifications/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { message } = req.body;
    // const notification = new notificationModel({ message, userId });
    // await notification.save();
    const newNotifications = new notificationModel({
      user: userId,
      message,
    });

    const savedNotifications = await newNotifications.save();
    res.status(201).json(savedNotifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/showNotifications", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userNotifications = await notificationModel.find({ user: userId });

    if (!userNotifications || userNotifications.length === 0) {
      return res.status(404).json({ message: "User posts not found" });
    }

    res.status(200).json(userNotifications);
  } catch (error) {
    console.error("Error retrieving user posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.post("/follow/:userId", authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;

  try {
    // Perform necessary operations to follow the user
    const userToFollow = await userModel.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the user is already being followed
    if (userToFollow.followers.includes(currentUserId)) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    }

    // Update userToFollow and currentUser with the follow relationship
    userToFollow.followers.push(currentUserId);
    await userToFollow.save();

    const currentUser = await userModel.findById(currentUserId);
    currentUser.following.push(userId);
    await currentUser.save();

    res.json({ message: "Followed successfully" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/posts/following", authenticateToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const currentUser = await userModel
      .findById(currentUserId)
      .populate("following");

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingUsersIds = currentUser.following.map((user) => user._id);
    const postsFromFollowingUsers = await postModel
      .find({ user: { $in: followingUsersIds } })
      .populate("user")
      .populate({
        path: "comments.user",
        select: "_id name name imageUrl",
      })
      .sort({ createdAt: -1 }); // Sort by most recent posts first

    res.json(postsFromFollowingUsers);
  } catch (error) {
    console.error("Error fetching posts from following users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/story/following", authenticateToken, async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const currentUser = await userModel
      .findById(currentUserId)
      .populate("following");

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingUsersIds = currentUser.following.map((user) => user._id);
    const postsFromFollowingUsers = await storyModel
      .find({ user: { $in: followingUsersIds } })
      .populate("user")
      .sort({ createdAt: -1 }); // Sort by most recent posts first

    res.json(postsFromFollowingUsers);
  } catch (error) {
    console.error("Error fetching posts from following users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post("/:postId/comments", authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body; // No need to extract userId from the body

  try {
    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      user: req.userId, // Use req.userId obtained from the token
      comment: text,
      createdAt: new Date(),
    };

    // Add the new comment to the post's comments array
    post.comments.push(newComment);
    await post.save();

    res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/:postId/getcomments", authenticateToken, async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await postModel
      .findById(postId)
      .populate("user", "Image")
      .populate({
        path: "comments.user",
        select: "comments.imageUrl",
      });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
app.post("/:postId/like", async (req, res) => {
  const { userId } = req.body;
  const { postId } = req.params;

  try {
    const updatedPost = await postModel.findById(postId);

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    const likedByIndex = updatedPost.likedBy.indexOf(userId);

    if (likedByIndex === -1) {
      // User has not liked this post, add the like
      updatedPost.likedBy.push(userId);
      updatedPost.totalLikes++;
    } else {
      // User has already liked this post, remove the like
      updatedPost.likedBy.splice(likedByIndex, 1);
      updatedPost.totalLikes--;
    }

    const savedPost = await updatedPost.save();

    res
      .status(200)
      .json({ message: "Post like status updated", updatedPost: savedPost });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/:postId/isLikedBy/:userId", async (req, res) => {
  const { userId, postId } = req.params;
  if (
    !mongoose.Types.ObjectId.isValid(postId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLikedByUser = post.likedBy.includes(userId);
    res.status(200).json({ isLiked: isLikedByUser });
  } catch (error) {
    console.error("Error checking if post is liked by user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/:tweetId/liketweet", authenticateToken, async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user.id;

  console.log("Received request to like tweet:", tweetId, "by user:", userId);

  try {
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
      console.log("Invalid tweet ID format:", tweetId);
      return res.status(400).json({ message: "Invalid tweet ID format" });
    }

    const tweet = await tweetModel.findById(tweetId);

    if (!tweet) {
      console.log("Tweet not found with ID:", tweetId);
      return res.status(404).json({ message: "Post not found" });
    }

    const likedByIndex = tweet.likedBy.indexOf(userId);

    if (likedByIndex === -1) {
      // Like the tweet
      tweet.likedBy.push(userId);
      tweet.totalLikes++;
    } else {
      // Unlike the tweet
      tweet.likedBy.splice(likedByIndex, 1);
      tweet.totalLikes--;
    }

    // Save the updated tweet
    const savedTweet = await tweet.save();

    return res
      .status(200)
      .json({ message: "Post like status updated", updatedTweet: savedTweet });
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.get("/:tweetId/isLiked/:userId", async (req, res) => {
  const { userId, tweetId } = req.params;

  try {
    const tweet = await tweetModel.findById(tweetId);

    if (!tweet) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLikedByUser = tweet.likedBy.includes(userId);
    res.status(200).json({ isLiked: isLikedByUser });
  } catch (error) {
    console.error("Error checking if tweet is liked by user:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// >>>>>>>>>>

app.get("/:userId/isFollowing/:followId", async (req, res) => {
  const { userId, followId } = req.params;

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = user.followers.includes(followId);
    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/unfollow/:userId", authenticateToken, async (req, res) => {
  const userId = req.params.userId;
  const currentUserId = req.user.id;

  try {
    const userToUnfollow = await userModel.findById(userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: "User not found" });
    }

    const currentUser = await userModel.findById(currentUserId);

    // Check if the current user is following the user to unfollow
    const isFollowing = currentUser.following.includes(userId);
    if (!isFollowing) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    // Remove userId from the currentUser's following array
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );

    // Remove currentUserId from the userToUnfollow's followers array
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/:userId/followers", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel
      .findById(userId)
      .populate("followers")
      .populate("following");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const followersCount = user.followers.length;
    const followingCount = user.following.length;

    res.status(200).json({ followersCount, followingCount });
    // res.status(200).json({ followersCount: user.followers.length },);
  } catch (error) {
    console.error("Error fetching followers count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/:userId/following", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findById(userId).populate("following");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ followingCount: user.following.length });
  } catch (error) {
    console.error("Error fetching following count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/:userId/post", async (req, res) => {
  const { userId } = req.params;

  try {
    // Count the total number of posts for the specified user
    const postCount = await postModel.countDocuments({ user: userId });

    res.status(200).json({ postCount });
  } catch (error) {
    console.error("Error fetching post count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/cities", async (req, res) => {
  try {
    const cities = await userModel.find().distinct("address"); 
    res.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const userProfile = await userModel
      .findById(userId)
      .populate("followers", "name username imageUrl active");

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
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


app.get("/lastActivity/:id", updateLastActive, async (req, res) => {
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

app.get("/usersByCity/:city", async (req, res) => {
  const address = req.params.city;
  try {
    const users = await userModel.find({ address });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users by city:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



const port = 5000;
app.listen(port, () => {
  console.log("app is listen on this " + port);
});



