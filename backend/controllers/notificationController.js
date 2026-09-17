
import mongoose from "mongoose";
import Notification from "../models/Notification.js";

/*
|--------------------------------------------------------------------------
| GET NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .sort({
        createdAt: -1,
      })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error(
      "GET NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| MARK ONE NOTIFICATION AS READ
|--------------------------------------------------------------------------
*/

export const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification =
      await Notification.findOneAndUpdate(
        {
          _id: id,
          recipient: req.user._id,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        }
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification,
    });
  } catch (error) {
    console.error(
      "MARK NOTIFICATION READ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| MARK ALL NOTIFICATIONS AS READ
|--------------------------------------------------------------------------
*/

export const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    console.error(
      "MARK ALL NOTIFICATIONS READ ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CLEAR ALL NOTIFICATIONS
|--------------------------------------------------------------------------
*/

export const clearAllNotifications = async (
  req,
  res
) => {
  try {
    const result =
      await Notification.deleteMany({
        recipient: req.user._id,
      });

    return res.status(200).json({
      success: true,
      message: "All notifications cleared.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(
      "CLEAR ALL NOTIFICATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to clear notifications.",
    });
  }
};

