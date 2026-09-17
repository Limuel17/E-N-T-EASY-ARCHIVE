import express from "express";

import {
  getFactoryCards,
  getFactoryCard,
  createFactoryCard,
  updateFactoryCard,
  deleteFactoryCard,
  getFactoryCardHistory,
} from "../controllers/factoryCardController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getFactoryCards);

router.get("/:id", protect, getFactoryCard);

router.post("/", protect, createFactoryCard);

router.put("/:id", protect, updateFactoryCard);

router.delete("/:id", protect, deleteFactoryCard);

router.get("/:id/history", protect, getFactoryCardHistory);

export default router;