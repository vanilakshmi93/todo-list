const express = require("express")
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { createToken, createRefreshToken } = require("../utils/tokenutils")
// const auth = require("../middleware/auth");

// Create router
const router = express.Router()

// Signup Route
router.post("/signup",async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Create new user using the static method
    const newUser = await User.createUser(email, password)

    // Generate tokens
    const accessToken = createToken(newUser._id)
    const refreshToken = createRefreshToken(newUser._id)

    // Set refresh token as HTTP-only cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use secure in production
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Respond with access token
    res.status(201).json({
      accessToken,
      user: {
        id: newUser._id,
        email: newUser.email,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Server error during signup" })
  }
})

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password using the method from the User model
    const isMatch = await user.isValidPassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate tokens
    const accessToken = createToken(user._id)
    const refreshToken = createRefreshToken(user._id)

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error during login" })
  }
})

router.post("/logout", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token && req.user) {
      const user = await User.findById(req.user.id)
      if (user) {
        await user.revokeToken(token)
      }
    }

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    res.status(500).json({ error: "Server error during logout" })
  }
})

router.post("/refresh", async (req, res) => {
  try {

    const refreshToken = req.cookies.refresh_token

    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token" })
    }

    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret_key"
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    if (user.isTokenRevoked(refreshToken)) {
      return res.status(401).json({ error: "Refresh token has been revoked" })
    }
    const newAccessToken = createToken(user._id)

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    // Handle different types of JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" })
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }

    console.error("Refresh token error:", error)
    res.status(500).json({ error: "Server error during token refresh" })
  }
})

module.exports = router