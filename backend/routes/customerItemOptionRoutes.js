import express from "express";

import {
  getCustomerItemOptions,
  createCustomerItemOption,
  updateCustomerItemOption,
  deleteCustomerItemOption,
} from "../controllers/customerItemOptionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================
// ADMIN ONLY
// ============================================================

const adminOnly = (req, res, next) => {
  const userRole = String(
    req.user?.role || ""
  ).toLowerCase();

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

// ============================================================
// GET OPTIONS
//
// Logged-in users can read options.
//
// Example:
// GET /api/customer-item-options?category=product_type
// ============================================================

router.get(
  "/",
  protect,
  getCustomerItemOptions
);

// ============================================================
// ADD OPTION
//
// ADMIN ONLY
// ============================================================

router.post(
  "/",
  protect,
  adminOnly,
  createCustomerItemOption
);

// ============================================================
// UPDATE OPTION
//
// ADMIN ONLY
// ============================================================

router.put(
  "/:id",
  protect,
  adminOnly,
  updateCustomerItemOption
);

// ============================================================
// DELETE OPTION
//
// ADMIN ONLY
// ============================================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCustomerItemOption
);

export default router;