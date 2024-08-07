const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
dotenv.config();

console.log("MONGODB_URI:", process.env.MONGODB_URI); // Add this line to check if the variable is loaded
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  credentials: true,
  origin: ["http://localhost:4200"],
}));

// Load models
const { userModel } = require("../src/models/login");
const { postModel } = require("../src/models/posts");
const { notificationModel } = require("../src/models/notifications");

// Load routes
const chatRouter = require("./routes/messagechat");
const OTPRoutes = require("./routes/otp");
const loginRoutes = require("../src/routes/login");
const userProfileRoutes = require("../src/routes/profile");
const partial = require("../src/routes/partial");
const tweetRoutes = require("../src/routes/tweet");
const storyRoutes = require("../src/routes/story");
const fetchAllRoutes = require("../src/routes/getAllPosts");
const getAllReelVideo = require("../src/routes/getAllPosts");
const commentOnPost = require("../src/routes/getAllPosts");
const postCount = require("../src/routes/getAllPosts");
const lokedOnPost = require("../src/routes/getAllPosts");
const followersPost = require("../src/routes/getAllPosts");
const seen = require("../src/routes/chat");
const lastseen = require("../src/routes/chat");
const followUser = require("../src/routes/follower_following");
const notifications = require("../src/routes/notifications");

// Setup static files path
const publicDirectoryPath = path.join(__dirname, "public");
app.use(express.static(publicDirectoryPath));

// Setup database connection
const MONGOURI = process.env.MONGODB_URI;
if (!MONGOURI) {
  console.error("MongoDB URI is not defined in environment variables");
  process.exit(1);
}

mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.error("Error connecting to MongoDB:", error));

// Register routes
app.use("/auth", loginRoutes);
app.use("/userProfile", userProfileRoutes);
app.use("/fetchAllUserData", fetchAllRoutes);
app.use("/partial", partial);
app.use("/chats", chatRouter);
app.use("/api", OTPRoutes);
app.use("/tweets", tweetRoutes);
app.use("/api", storyRoutes);
app.use("/apiReelVideo", getAllReelVideo);
app.use("/apiGetSeen", seen);
app.use("/api/GetLastSeen", lastseen);
app.use("/api/followUser", followUser);
app.use("/api/comment", commentOnPost);
app.use("/api/liked", lokedOnPost);
app.use("/api/notifications", notifications);
app.use("/api/postCount", postCount);
app.use("/api/followersPost", followersPost);

// Root route
app.get("/", async (req, res) => {
  res.send("Project on");
});

// Middleware to update last active timestamp
const updateLastActive = async (req, res, next) => {
  if (req.user) {
    try {
      await userModel.findByIdAndUpdate(req.user._id, {
        lastActive: Date.now(),
      });
    } catch (error) {
      console.error("Error updating last active:", error);
    }
  }
  next();
};

// Route to get the last activity of a user
app.get("/lastActivity/:id", updateLastActive, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("lastActive");
    if (user) {
      res.json({ lastActive: user.lastActive });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
