require("dotenv").config(); // Load .env first
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const todoRoutes = require("./routes/todos");

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Add CORS middleware here, before any routes or other middleware
app.use(cors(corsOptions));
//app.options('/*', cors(corsOptions));

app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

app.use(cookieParser());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Backend is working!" });
});

app.use("/auth", authRoutes);
app.use("/todos", todoRoutes); // <-- THIS LINE IS REQUIRED


// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});