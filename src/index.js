const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
var path = require("path");

const app = express();
app.use(express.json());

const { userModel } = require("../src/models/login");
const { postModel } = require("../src/models/posts");
const { notificationModel } = require("../src/models/notifications");

const chatRouter = require("./routes/messagechat");
const OTPRoutes = require("./routes/otp");
const loginRoutes = require("../src/routes/login");
const userProfileRoutes = require("../src/routes/profile");
const partial = require("../src/routes/partial");
const authenticateToken = require("../src/routes/user");
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
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:4200"],
  })
);

// mongoose.connect("mongodb://localhost:27017/social-media");
const MONGOURI =
  "mongodb+srv://shahilkumarpatel9393:EB7T7mrXq1BMTXFb@social-media.dimhcce.mongodb.net/";

mongoose
  .connect(MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

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
// app.use('/public', express.static(path.join(__dirname, '..', 'public')));
const publicDirectoryPath = path.join(__dirname, "public");
app.use(express.static(publicDirectoryPath));

app.get("/", async (req, res) => {
  await res.send("Project on");
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


const port = 5000;
app.listen(port, () => {
  console.log("app is listen on this " + port);
});
