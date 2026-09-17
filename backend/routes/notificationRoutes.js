
import express from "express";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
} from "../controllers/notificationController.js";

import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL NOTIFICATIONS
|--------------------------------------------------------------------------
| GET /api/notifications
*/

router.get(
  "/",
  protect,
  getNotifications
);

/*
|--------------------------------------------------------------------------
| MARK ONE NOTIFICATION AS READ
|--------------------------------------------------------------------------
| PUT /api/notifications/:id/read
*/

router.put(
  "/:id/read",
  protect,
  markNotificationAsRead
);

/*
|--------------------------------------------------------------------------
| MARK ALL NOTIFICATIONS AS READ
|--------------------------------------------------------------------------
| PUT /api/notifications/read-all
|
| IMPORTANT:
| This route must be ABOVE /:id/read.
|--------------------------------------------------------------------------
*/

router.put(
  "/read-all",
  protect,
  markAllNotificationsAsRead
);

/*
|--------------------------------------------------------------------------
| CLEAR ALL NOTIFICATIONS
|--------------------------------------------------------------------------
| DELETE /api/notifications/clear-all
|
| IMPORTANT:
| This route must be ABOVE /:id/read.
|--------------------------------------------------------------------------
*/

router.delete(
  "/clear-all",
  protect,
  clearAllNotifications
);

export default router;

