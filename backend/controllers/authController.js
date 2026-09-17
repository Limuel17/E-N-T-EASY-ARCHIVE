
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ==============================
// REGISTER USER
// ==============================
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      position,
      role,
    } = req.body;

    if (!name || !email || !password || !position) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and position are required.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address: address || "",
      position,
      role: role || "employee",
      profileImage: req.file
        ? `/uploads/profiles/${req.file.filename}`
        : "",
    });

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: userResponse,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register user.",
    });
  }
};

// ==============================
// LOGIN USER
// ==============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const userResponse = user.toObject();

    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

