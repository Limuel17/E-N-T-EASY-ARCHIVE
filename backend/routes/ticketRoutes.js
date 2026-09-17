
import express from "express";

import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ADMIN CHECK
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
*/
router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Ticket route is working.",
  });
});

/*
|--------------------------------------------------------------------------
| GET TICKETS
|--------------------------------------------------------------------------
*/
router.get(
  "/",
  protect,
  getTickets
);

/*
|--------------------------------------------------------------------------
| CREATE TICKET
|--------------------------------------------------------------------------
*/
router.post(
  "/",
  protect,
  createTicket
);

/*
|--------------------------------------------------------------------------
| GET SINGLE TICKET
|--------------------------------------------------------------------------
*/
router.get(
  "/:id",
  protect,
  getTicket
);

/*
|--------------------------------------------------------------------------
| ADMIN UPDATE STATUS / SOLVE
|--------------------------------------------------------------------------
*/
router.put(
  "/:id",
  protect,
  requireAdmin,
  updateTicket
);

/*
|--------------------------------------------------------------------------
| ADMIN DELETE
|--------------------------------------------------------------------------
*/
router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteTicket
);

export default router;

