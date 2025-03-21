const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("../utils/nodemailer");
const getGravatarUrl = require("../utils/gravatar");
const validator = require("validator");
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email already in use" });

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserGravatar = getGravatarUrl(email);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      avatarUrl: newUserGravatar,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("projects").exec();

    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.password) {
      return res.status(400).json({ message: "User is authenticated via Google." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });
    // res.cookie("userId", JSON.stringify(user._id), {
    //   secure: true,
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 1 * 24 * 60 * 60 * 1000,
    // });

    return res.status(200).json({ message: "Authorized", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.auth = async (req, res) => {
  try {
    const token = req.cookies.token;

    console.log(token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      message: "Authorized",
      userId,
    });
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      secure: true,
      sameSite: "none", // Adjust SameSite policy as needed
      path: "/",
    });

    // res.clearCookie("userId", {
    //   secure: true,
    //   sameSite: "none", // Adjust SameSite policy as needed
    //   path: "/",
    // });
    return res.status(200).json({
      message: "Logged out.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
