
import express from "express";

import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  resetUserPassword,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ========================================
// TEST
// ========================================

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "User route is working",
  });
});

// ========================================
// GET ALL USERS
// ========================================

router.get(
  "/",
  protect,
  getUsers
);

// ========================================
// CHANGE PASSWORD
// IMPORTANT: BEFORE /:id
// ========================================

router.put(
  "/change-password",
  protect,
  changePassword
);

// ========================================
// ADMIN CHECK
// ========================================

const requireAdmin = (req, res, next) => {
  const role = String(
    req.user?.role || ""
  ).toLowerCase();

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message:
        "Only administrators can perform this action.",
    });
  }

  next();
};

// ========================================
// ADMIN RESET PASSWORD
// IMPORTANT: BEFORE /:id
// ========================================

router.post(
  "/:id/reset-password",
  protect,
  requireAdmin,
  resetUserPassword
);

// ========================================
// GET ONE USER
// ========================================

router.get(
  "/:id",
  protect,
  getUser
);

// ========================================
// UPDATE USER
// ========================================

router.put(
  "/:id",
  protect,
  upload.single("profilePicture"),
  updateUser
);

// ========================================
// DELETE USER
// ========================================

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteUser
);

// ========================================
// ERROR HANDLER
// ========================================

router.use(
  (error, req, res, next) => {
    console.error(
      "================================"
    );

    console.error(
      "USER ROUTE ERROR:"
    );

    console.error(
      "MESSAGE:",
      error.message
    );

    console.error(
      "NAME:",
      error.name
    );

    console.error(
      "CODE:",
      error.code
    );

    console.error(
      "FULL ERROR:",
      error
    );

    console.error(
      "================================"
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error.",
    });
  }
);

export default router;

