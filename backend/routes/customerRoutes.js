
import express from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================================================================
   ALL CUSTOMER ROUTES REQUIRE LOGIN
================================================================ */

router.use(protect);

/* ================================================================
   CUSTOMERS
================================================================ */

// GET ALL
router.get(
  "/",
  getCustomers
);

// GET ONE
router.get(
  "/:id",
  getCustomerById
);

// CREATE
router.post(
  "/",
  createCustomer
);

// UPDATE
router.put(
  "/:id",
  updateCustomer
);

// DELETE
router.delete(
  "/:id",
  deleteCustomer
);

export default router;

