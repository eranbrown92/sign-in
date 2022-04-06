require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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
const member = require("./models/member.model");

// middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
const verifyUser = require("./auth/auth");

// Routes
// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const Member = await member.findOne({ username });
  if (Member == null) {
    res.sendStatus(401);
    return;
  }
  bcrypt.compare(password, Member.hash, (err, result) => {
    if (err) res.sendStatus(401);
    else if (!result) res.sendStatus(401);
    else {
      jwt.sign(
        { id: Member._id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
        (err, token) => {
          if (err) res.sendStatus(500);
          else
            res.json({
              success: true,
              token,
            });
        }
      );
    }
  });
});

// Get all users
// Only logged in users can view all users
app.get("/", verifyUser, async (req, res) => {
  const users = await user.find({});
  res.json(users);
});

// Sign in - guest
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
