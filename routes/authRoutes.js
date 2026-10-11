import e from "express";
import { jwtVerify } from "jose";
const router = e.Router();

import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { JWT_SECRET } from "../utils/getJwtSecret.js";

// @route         POST api/auth/register
// @description   Register a new user
// @access        Public
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("All fields are required!");
    }

    const exisitingUser = await User.findOne({ email });

    if (exisitingUser) {
      res.status(400);
      throw new Error("The user already exists.");
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    // Create tokens
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Set refreshToken in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route         POST api/auth/login
// @description   Authenticate a registered user
// @access        Public
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required!");
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(401);
      throw new Error("Invalid Credentials");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid Credentials");
    }

    // Create tokens
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Set refreshToken in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// @route         POST api/auth/logout
// @description   Logout a registered user
// @access        Private
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  res.status(200).json({ message: "Logged out sucessfully" });
});

// @route         POST api/auth/refresh
// @description   Generate a new access token from refresh token
// @access        Public (Needs valid refresh token in cookie)
router.post("/refresh", async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    console.log("Refreshing token...");

    if (!token) {
      res.status(401);
      throw new Error("No valid refresh token");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await User.findById(payload.userId);

    if (!user) {
      res.status(401);
      throw new Error("No valid user");
    }

    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      "1m",
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401);
    console.error(err);
    next(err);
  }
});

export default router;
