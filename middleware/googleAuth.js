const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage"
);
const { google } = require("googleapis");

const googleAuth = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "No code provided" });
    }

    const { tokens } = await client.getToken(code);

    if (!tokens) {
      return res.status(400).json({ message: "Failed to obtain tokens" });
    }

    client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: client,
      version: "v2",
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    let user = await User.findOne({ email: userInfo.email }).populate("projects").exec();

    if (!user) {
      user = new User({
        googleId: userInfo.id,
        username: userInfo.name,
        email: userInfo.email,
        avatarUrl: userInfo.picture,
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    // res.cookie("userId", JSON.stringify(user._id), {
    //   maxAge: 1 * 24 * 60 * 60 * 1000,
    // });

    return res.status(200).json({ message: "Authorized" });
  } catch (error) {
    console.error("Authentication failed:", error);
    res.status(500).json({ message: "Authentication failed", error: error.message });
  }
};

module.exports = googleAuth;
