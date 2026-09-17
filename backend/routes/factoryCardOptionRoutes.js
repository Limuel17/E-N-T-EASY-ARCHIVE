import express from "express";

import {
  getFactoryCardOptions,
  createFactoryCardOption,
  updateFactoryCardOption,
  deleteFactoryCardOption,
} from "../controllers/factoryCardOptionController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

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
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  protect,
  getFactoryCardOptions
);

/*
|--------------------------------------------------------------------------
| ADMIN
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  protect,
  adminOnly,
  createFactoryCardOption
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateFactoryCardOption
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteFactoryCardOption
);

export default router;