
import mongoose from "mongoose";
import MachineOperationLog from "../models/MachineOperationLog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const isAdmin = (user) => {
  return String(user?.role || "").toLowerCase() === "admin";
};

const validateRequiredFields = (body) => {
  const requiredFields = [
    "requestedBy",
    "customer",
    "itemDescription",
    "dimension",
    "flute",
    "joint",
    "boxType",
    "code",
  ];

  return requiredFields.filter((field) => {
    return !String(body?.[field] || "").trim();
  });
};

/*
|--------------------------------------------------------------------------
| GET ALL MACHINE OPERATION LOGS
|--------------------------------------------------------------------------
*/

export const getMachineOperationLogs = async (req, res) => {
  try {
    const logs = await MachineOperationLog.find().sort({
      date: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error(
      "GET MACHINE OPERATION LOGS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch machine operation logs.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE MACHINE OPERATION LOG
|--------------------------------------------------------------------------
*/

export const getMachineOperationLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid machine operation log ID.",
      });
    }

    const log = await MachineOperationLog.findById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Machine operation log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      log,
    });
  } catch (error) {
    console.error(
      "GET MACHINE OPERATION LOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch machine operation log.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE MACHINE OPERATION LOG
|--------------------------------------------------------------------------
*/

export const createMachineOperationLog = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY
    |--------------------------------------------------------------------------
    */

    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators can create machine operation logs.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE REQUIRED FIELDS
    |--------------------------------------------------------------------------
    */

    const missingFields = validateRequiredFields(req.body);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
        missingFields,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CLEAN INPUT
    |--------------------------------------------------------------------------
    */

    const requestedBy = String(
      req.body.requestedBy || ""
    ).trim();

    const customer = String(
      req.body.customer || ""
    ).trim();

    const itemDescription = String(
      req.body.itemDescription || ""
    ).trim();

    const dimension = String(
      req.body.dimension || ""
    ).trim();

    const flute = String(
      req.body.flute || ""
    ).trim();

    const joint = String(
      req.body.joint || ""
    ).trim();

    const boxType = String(
      req.body.boxType || ""
    ).trim();

    const code = String(
      req.body.code || ""
    ).trim();

    const remarks = String(
      req.body.remarks || ""
    ).trim();

    /*
    |--------------------------------------------------------------------------
    | CREATE LOG
    |--------------------------------------------------------------------------
    */

    const log = await MachineOperationLog.create({
      requestedBy,
      customer,
      itemDescription,
      dimension,
      flute,
      joint,
      boxType,
      code,
      remarks,
      date: new Date(),
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE NOTIFICATIONS
    |--------------------------------------------------------------------------
    |
    | Send notification to:
    |
    | 1. All employees
    | 2. Other admins
    |
    | The admin who created the log does NOT receive
    | their own notification.
    |
    */

    try {
      const users = await User.find({
        _id: {
          $ne: req.user._id,
        },
        role: {
          $in: ["admin", "employee"],
        },
      }).select("_id role");

      const notifications = users.map((user) => ({
        recipient: user._id,

        title: "Machine Operation Log Added",

        message: `${requestedBy} added a new machine operation log for ${customer}.`,

        type: "machine-operation-log",

        relatedId: log._id,

        isRead: false,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(
          notifications
        );

        console.log(
          `Created ${notifications.length} machine operation log notification(s).`
        );
      } else {
        console.log(
          "No users found to receive machine operation log notification."
        );
      }
    } catch (notificationError) {
      /*
      |--------------------------------------------------------------------------
      | Notification failure should NOT cancel log creation
      |--------------------------------------------------------------------------
      */

      console.error(
        "CREATE MACHINE OPERATION LOG NOTIFICATION ERROR:",
        notificationError
      );
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,
      message:
        "Machine operation log created successfully.",
      log,
    });
  } catch (error) {
    console.error(
      "CREATE MACHINE OPERATION LOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create machine operation log.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MACHINE OPERATION LOG
|--------------------------------------------------------------------------
*/

export const updateMachineOperationLog = async (
  req,
  res
) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators can update machine operation logs.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid machine operation log ID.",
      });
    }

    const missingFields = validateRequiredFields(
      req.body
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
        missingFields,
      });
    }

    const updateData = {
      requestedBy: String(
        req.body.requestedBy || ""
      ).trim(),

      customer: String(
        req.body.customer || ""
      ).trim(),

      itemDescription: String(
        req.body.itemDescription || ""
      ).trim(),

      dimension: String(
        req.body.dimension || ""
      ).trim(),

      flute: String(
        req.body.flute || ""
      ).trim(),

      joint: String(
        req.body.joint || ""
      ).trim(),

      boxType: String(
        req.body.boxType || ""
      ).trim(),

      code: String(
        req.body.code || ""
      ).trim(),

      remarks: String(
        req.body.remarks || ""
      ).trim(),
    };

    const log =
      await MachineOperationLog.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Machine operation log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Machine operation log updated successfully.",
      log,
    });
  } catch (error) {
    console.error(
      "UPDATE MACHINE OPERATION LOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update machine operation log.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE MACHINE OPERATION LOG
|--------------------------------------------------------------------------
*/

export const deleteMachineOperationLog = async (
  req,
  res
) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators can delete machine operation logs.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid machine operation log ID.",
      });
    }

    const log =
      await MachineOperationLog.findByIdAndDelete(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Machine operation log not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Machine operation log deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE MACHINE OPERATION LOG ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete machine operation log.",
    });
  }
};

