const express = require("express");
const router = express.Router();
const { userModel } = require("../models/login");

router.post("/search", async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Name parameter is required" });
    }

    const searchTerm = name.toLowerCase();
    const results = await userModel.find({
      name: { $regex: searchTerm, $options: "i" }, // Case-insensitive search
    });

    res.json(results);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

router.get("/getAllUser", async (req, res) => {
  try {
    const users = await userModel.find();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/usersByCity/:city", async (req, res) => {
  const address = req.params.city;
  try {
    const users = await userModel.find({ address });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users by city:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/cities", async (req, res) => {
  try {
    const cities = await userModel.find().distinct("address");
    res.json({ cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


router.get("/usersByCity/:city", async (req, res) => {
  const address = req.params.city;
  try {
    const users = await userModel.find({ address });
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users by city:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



module.exports = router;