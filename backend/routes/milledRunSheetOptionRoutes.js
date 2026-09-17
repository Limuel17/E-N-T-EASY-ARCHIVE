import express from "express";

import {
  getMilledRunSheetOptions,
  createMilledRunSheetOption,
  updateMilledRunSheetOption,
  deleteMilledRunSheetOption,
} from "../controllers/milledRunSheetOptionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * ============================================
 * ADMIN ROLE CHECK
 * ============================================
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
 * GET ALL OPTIONS
 * ============================================
 *
 * ADMIN + EMPLOYEE
 *
 * GET
 * /api/milled-run-sheet-options
 */

router.get(
  "/",
  protect,
  getMilledRunSheetOptions
);

/*
 * ============================================
 * CREATE OPTION
 * ============================================
 *
 * ADMIN ONLY
 *
 * POST
 * /api/milled-run-sheet-options
 */

router.post(
  "/",
  protect,
  adminOnly,
  createMilledRunSheetOption
);

/*
 * ============================================
 * UPDATE OPTION
 * ============================================
 *
 * ADMIN ONLY
 *
 * PUT
 * /api/milled-run-sheet-options/:id
 */

router.put(
  "/:id",
  protect,
  adminOnly,
  updateMilledRunSheetOption
);

/*
 * ============================================
 * DELETE OPTION
 * ============================================
 *
 * ADMIN ONLY
 *
 * DELETE
 * /api/milled-run-sheet-options/:id
 */

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteMilledRunSheetOption
);

export default router;