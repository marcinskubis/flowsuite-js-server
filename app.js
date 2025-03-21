var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const projectRoutes = require("./routes/project");
const taskRoutes = require("./routes/task");
const statusRoutes = require("./routes/status");

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5176",
    "http://localhost:5175",
    "https://flow-suite-client.vercel.app",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

require("dotenv").config();

var app = express();

connectDB();

app.use(cors(corsOptions));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/status", statusRoutes);

module.exports = app;
