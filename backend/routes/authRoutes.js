
import express from "express";

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Register with profile image
router.post(
  "/register",
  upload.single("profileImage"),
  registerUser
);

// Login
router.post("/login", loginUser);

export default router;

