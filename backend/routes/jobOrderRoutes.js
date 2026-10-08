
import express from "express";

import {
  getJobOrders,
  getJobOrderById,
  createJobOrder,
  updateJobOrder,
  deleteJobOrder,
} from "../controllers/jobOrderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// ============================================================
// ALL JOB ORDER ROUTES REQUIRE AUTHENTICATION
// ============================================================

router.use(protect);


// ============================================================
// JOB ORDERS
// ============================================================

// GET ALL JOB ORDERS
router.get(
  "/",
  getJobOrders
);

// CREATE JOB ORDER
router.post(
  "/",
  createJobOrder
);

// GET SINGLE JOB ORDER
router.get(
  "/:id",
  getJobOrderById
);

// UPDATE JOB ORDER
router.put(
  "/:id",
  updateJobOrder
);

// DELETE JOB ORDER
router.delete(
  "/:id",
  deleteJobOrder
);


export default router;

