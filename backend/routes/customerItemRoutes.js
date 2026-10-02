import express from "express";

import {
  getCustomerItems,
  getCustomerItemById,
  createCustomerItem,
  updateCustomerItem,
  deleteCustomerItem,
} from "../controllers/customerItemController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================================
// CUSTOMER ITEMS
// ============================================================

// Get all items for a specific customer
// GET /api/customers/:customerId/items
router.get(
  "/customer/:customerId",
  protect,
  getCustomerItems
);

// Create a new item for a specific customer
// POST /api/customers/:customerId/items
router.post(
  "/customer/:customerId",
  protect,
  createCustomerItem
);

// Get a single item
// GET /api/customer-items/:id
router.get(
  "/:id",
  protect,
  getCustomerItemById
);

// Update an item
// PUT /api/customer-items/:id
router.put(
  "/:id",
  protect,
  updateCustomerItem
);

// Delete an item
// DELETE /api/customer-items/:id
router.delete(
  "/:id",
  protect,
  deleteCustomerItem
);

export default router;