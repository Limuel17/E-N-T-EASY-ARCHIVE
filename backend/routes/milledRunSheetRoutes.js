import express from "express";

import {
  getMilledRunSheets,
  getMilledRunSheet,
  createMilledRunSheet,
  updateMilledRunSheet,
  deleteMilledRunSheet,
} from "../controllers/milledRunSheetController.js";

import {
  addMilledRunSheetStock,
  removeMilledRunSheetStock,
  getMilledRunSheetStockHistory,
} from "../controllers/milledRunSheetStockController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * ADMIN ROLE CHECK
 */

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

/*
 * ============================================
 * MILLED RUN SHEETS
 * ============================================
 */

/*
 * GET ALL
 *
 * Admin + Employee
 */

router.get(
  "/",
  protect,
  getMilledRunSheets
);

/*
 * GET ONE
 *
 * Admin + Employee
 */

router.get(
  "/:id",
  protect,
  getMilledRunSheet
);

/*
 * CREATE
 *
 * Admin only
 */

router.post(
  "/",
  protect,
  adminOnly,
  createMilledRunSheet
);

/*
 * UPDATE
 *
 * Admin only
 */

router.put(
  "/:id",
  protect,
  adminOnly,
  updateMilledRunSheet
);

/*
 * DELETE
 *
 * Admin only
 */

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteMilledRunSheet
);

/*
 * ============================================
 * STOCK MANAGEMENT
 * ============================================
 */

/*
 * ADD STOCK
 *
 * Admin only
 *
 * POST
 * /api/milled-run-sheets/:id/stock/add
 */

router.post(
  "/:id/stock/add",
  protect,
  adminOnly,
  addMilledRunSheetStock
);

/*
 * REMOVE STOCK
 *
 * Admin only
 *
 * POST
 * /api/milled-run-sheets/:id/stock/remove
 */

router.post(
  "/:id/stock/remove",
  protect,
  adminOnly,
  removeMilledRunSheetStock
);

/*
 * STOCK HISTORY
 *
 * Admin + Employee
 *
 * GET
 * /api/milled-run-sheets/:id/stock-history
 */

router.get(
  "/:id/stock-history",
  protect,
  getMilledRunSheetStockHistory
);

export default router;