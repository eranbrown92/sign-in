require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const PORT = process.env.PORT || 3001;

// DB connection
mongoose.connect(process.env.MONGO_URI, (err) => {
  if (err) {
    console.error("Failed to connect to DB. Exiting program");
    process.exit(1);
  } else {
    app.listen(PORT, () =>
      console.log(
        `Listening on port:${PORT}\nDB:${mongoose.connection.db.namespace}`
      )
    );
  }
});

// model
const user = require("./models/user.model");

// middleware
app.use(express.json());

// Routes
// Get all users
app.get("/", async (req, res) => {
  const users = await user.find({});
  res.json(users);
});

// Sign in
app.post("/signin", async (req, res) => {
  // check for duplicates
  try {
    const dup = await user.findOne({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    });
    if (dup) {
      res.status(400).json({
        success: false,
        err: `${req.body.firstname}, looks like you already signed in.`,
      });
    } else {
      // sign user in
      const newUser = await new user(req.body);
      await newUser.save();
      res.status(201).json({
        success: true,
        message: `${req.body.firstname}, thank you for signing in.`,
      });
    }
  } catch (err) {
    res
      .status(400)
      .json({ success: false, err: "Bad request. Please try again." });
  }
});
