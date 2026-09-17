import express from "express";

import {
  getMachineOperationLogs,
  getMachineOperationLog,
  createMachineOperationLog,
  updateMachineOperationLog,
  deleteMachineOperationLog,
} from "../controllers/machineOperationLogController.js";

import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

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

router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "Machine Operation Log route is working.",
  });
});

router.get(
  "/",
  protect,
  getMachineOperationLogs
);

router.post(
  "/",
  protect,
  requireAdmin,
  createMachineOperationLog
);

router.get(
  "/:id",
  protect,
  getMachineOperationLog
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  updateMachineOperationLog
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  deleteMachineOperationLog
);

export default router;