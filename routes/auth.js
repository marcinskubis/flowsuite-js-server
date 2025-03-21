const express = require("express");
const { register, login, auth, logout } = require("../controllers/authController");
const googleAuth = require("../middleware/googleAuth");
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/", auth);

router.post("/logout", logout);

router.post("/google-login", googleAuth);

module.exports = router;
