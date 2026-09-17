import mongoose from "mongoose";

import FactoryCard from "../models/FactoryCard.js";
import FactoryCardHistory from "../models/FactoryCardHistory.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// =========================================================
// GET ALL FACTORY CARDS
// =========================================================

export const getFactoryCards = async (req, res) => {
  try {
    const factoryCards = await FactoryCard.find()
      .populate("createdBy", "name role position email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      factoryCards,
    });
  } catch (error) {
    console.error("GET FACTORY CARDS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// =========================================================
// GET ONE FACTORY CARD
// =========================================================

export const getFactoryCard = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid factory card ID.",
      });
    }

    const factoryCard = await FactoryCard.findById(id).populate(
      "createdBy",
      "name role position email"
    );

    if (!factoryCard) {
      return res.status(404).json({
        success: false,
        message: "Factory card not found.",
      });
    }

    return res.status(200).json({
      success: true,
      factoryCard,
    });
  } catch (error) {
    console.error("GET FACTORY CARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// =========================================================
// CREATE FACTORY CARD
// =========================================================

export const createFactoryCard = async (req, res) => {
  try {
    console.log("CREATE FACTORY CARD");
    console.log("REQ.USER:", req.user);

    const {
      customer,
      partNumber,
      jobOrder,
      type,
      prf,
      status,
      note,
    } = req.body;

    const changedBy = req.user?._id || req.user?.id;

    console.log("CHANGED BY:", changedBy);

    if (!changedBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    // =====================================================
    // CREATE FACTORY CARD
    // =====================================================

    const factoryCard = await FactoryCard.create({
      customer: String(customer || "").trim(),
      partNumber: String(partNumber || "").trim(),
      jobOrder: String(jobOrder || "").trim(),
      type,
      prf: Boolean(prf),
      status: status || "In",
      createdBy: changedBy,
    });

    // =====================================================
    // CREATE HISTORY
    // =====================================================

    const history = await FactoryCardHistory.create({
      factoryCard: factoryCard._id,
      action: "Created",
      changedFields: [],
      changedBy,
      note:
        typeof note === "string"
          ? note.trim()
          : "",
    });

    // =====================================================
    // CREATE NOTIFICATIONS
    // =====================================================

    const users = await User.find({})
      .select("_id")
      .lean();

    if (users.length > 0) {
      const notifications = users.map((user) => ({
        recipient: user._id,
        title: "Factory Card Created",
        message: `A new Factory Card was created for ${
          factoryCard.customer || "Unknown Customer"
        }.`,
        type: "factory-card",
        relatedId: factoryCard._id,
        isRead: false,
      }));

      await Notification.insertMany(notifications);
    }

    // =====================================================
    // RESPONSE
    // =====================================================

    const populatedFactoryCard =
      await FactoryCard.findById(factoryCard._id).populate(
        "createdBy",
        "name role position email"
      );

    return res.status(201).json({
      success: true,
      message: "Factory card created successfully.",
      factoryCard: populatedFactoryCard,
      history,
    });
  } catch (error) {
    console.error("================================");
    console.error("CREATE FACTORY CARD ERROR:");
    console.error("MESSAGE:", error.message);
    console.error("NAME:", error.name);
    console.error("CODE:", error.code);
    console.error("STACK:", error.stack);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// =========================================================
// UPDATE FACTORY CARD
// =========================================================

export const updateFactoryCard = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("================================");
    console.log("UPDATE FACTORY CARD");
    console.log("ID:", id);
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);
    console.log("================================");

    // =====================================================
    // VALIDATE ID
    // =====================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid factory card ID.",
      });
    }

    // =====================================================
    // GET CURRENT FACTORY CARD
    // =====================================================

    const oldFactoryCard =
      await FactoryCard.findById(id);

    if (!oldFactoryCard) {
      return res.status(404).json({
        success: false,
        message: "Factory card not found.",
      });
    }

    // =====================================================
    // CURRENT USER
    // =====================================================

    const changedBy =
      req.user?._id ||
      req.user?.id ||
      null;

    if (!changedBy) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    // =====================================================
    // GET NOTE SEPARATELY
    // =====================================================

    const {
      note,
      customer,
      partNumber,
      jobOrder,
      type,
      prf,
      status,
    } = req.body;

    // =====================================================
    // BUILD UPDATE DATA
    // =====================================================

    const newData = {};

    if (customer !== undefined) {
      newData.customer = String(customer).trim();
    }

    if (partNumber !== undefined) {
      newData.partNumber = String(partNumber).trim();
    }

    if (jobOrder !== undefined) {
      newData.jobOrder = String(jobOrder).trim();
    }

    if (type !== undefined) {
      newData.type = type;
    }

    if (prf !== undefined) {
      if (
        typeof prf === "boolean"
      ) {
        newData.prf = prf;
      } else {
        newData.prf =
          String(prf).toLowerCase() ===
          "true";
      }
    }

    if (status !== undefined) {
      newData.status = status;
    }

    // =====================================================
    // CHECK CHANGED FIELDS
    // =====================================================

    const fieldsToCheck = [
      "customer",
      "partNumber",
      "jobOrder",
      "type",
      "prf",
      "status",
    ];

    const changedFields = [];

    fieldsToCheck.forEach((field) => {
      if (
        newData[field] !== undefined &&
        String(oldFactoryCard[field]) !==
          String(newData[field])
      ) {
        changedFields.push({
          field,
          oldValue:
            oldFactoryCard[field],
          newValue: newData[field],
        });
      }
    });

    // =====================================================
    // CLEAN NOTE
    // =====================================================

    const cleanNote =
      typeof note === "string"
        ? note.trim()
        : "";

    // =====================================================
    // NOTHING CHANGED
    // =====================================================

    if (
      changedFields.length === 0 &&
      !cleanNote
    ) {
      const populatedFactoryCard =
        await FactoryCard.findById(id).populate(
          "createdBy",
          "name role position email"
        );

      return res.status(200).json({
        success: true,
        message: "No changes detected.",
        factoryCard:
          populatedFactoryCard,
      });
    }

    // =====================================================
    // UPDATE FACTORY CARD
    // =====================================================

    const updatedFactoryCard =
      await FactoryCard.findByIdAndUpdate(
        id,
        {
          $set: newData,
        },
        {
          returnDocument: "after",
          runValidators: true,
        }
      );

    if (!updatedFactoryCard) {
      return res.status(404).json({
        success: false,
        message: "Factory card not found.",
      });
    }

    // =====================================================
    // CREATE HISTORY
    // =====================================================

    const history =
      await FactoryCardHistory.create({
        factoryCard:
          updatedFactoryCard._id,
        action: "Updated",
        changedFields,
        note: cleanNote,
        changedBy,
      });

    // =====================================================
    // CREATE NOTIFICATIONS
    // =====================================================

    if (changedFields.length > 0) {
      const customerName =
        updatedFactoryCard.customer ||
        "Unknown Customer";

      const changedText =
        changedFields
          .map((change) => {
            const oldValue =
              change.oldValue ?? "-";

            const newValue =
              change.newValue ?? "-";

            return `${change.field}: Previous: ${oldValue} New: ${newValue}`;
          })
          .join("\n");

      const users =
        await User.find({})
          .select("_id")
          .lean();

      if (users.length > 0) {
        const notifications =
          users.map((user) => ({
            recipient: user._id,

            title:
              "Factory Card Updated",

            message:
              `Customer: ${customerName}\n\n${changedText}`,

            type: "factory-card",

            relatedId:
              updatedFactoryCard._id,

            isRead: false,
          }));

        await Notification.insertMany(
          notifications
        );
      }
    }

    // =====================================================
    // POPULATE RESPONSE
    // =====================================================

    const populatedFactoryCard =
      await FactoryCard.findById(id).populate(
        "createdBy",
        "name role position email"
      );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,
      message:
        "Factory card updated successfully.",
      factoryCard:
        populatedFactoryCard,
      history,
    });
  } catch (error) {
    console.error("================================");
    console.error("UPDATE FACTORY CARD ERROR:");
    console.error("MESSAGE:", error.message);
    console.error("NAME:", error.name);
    console.error("CODE:", error.code);
    console.error("STACK:", error.stack);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
};

// =========================================================
// DELETE FACTORY CARD
// =========================================================

export const deleteFactoryCard = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid factory card ID.",
      });
    }

    const factoryCard =
      await FactoryCard.findById(id);

    if (!factoryCard) {
      return res.status(404).json({
        success: false,
        message: "Factory card not found.",
      });
    }

    const changedBy =
      req.user?._id ||
      req.user?.id ||
      null;

    // =====================================================
    // CREATE HISTORY BEFORE DELETE
    // =====================================================

    const history =
      await FactoryCardHistory.create({
        factoryCard: factoryCard._id,
        action: "Deleted",
        changedFields: [],
        changedBy,
        note: "",
      });

    // =====================================================
    // CREATE NOTIFICATIONS
    // =====================================================

    const users =
      await User.find({})
        .select("_id")
        .lean();

    if (users.length > 0) {
      const notifications =
        users.map((user) => ({
          recipient: user._id,

          title:
            "Factory Card Deleted",

          message:
            `Factory Card for ${
              factoryCard.customer ||
              "Unknown Customer"
            } was deleted.`,

          type: "factory-card",

          relatedId:
            factoryCard._id,

          isRead: false,
        }));

      await Notification.insertMany(
        notifications
      );
    }

    // =====================================================
    // DELETE FACTORY CARD
    // =====================================================

    await FactoryCard.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Factory card deleted successfully.",
    });
  } catch (error) {
    console.error("================================");
    console.error("DELETE FACTORY CARD ERROR:");
    console.error("MESSAGE:", error.message);
    console.error("NAME:", error.name);
    console.error("CODE:", error.code);
    console.error("STACK:", error.stack);
    console.error("================================");

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
};

// =========================================================
// GET FACTORY CARD HISTORY
// =========================================================

export const getFactoryCardHistory = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid factory card ID.",
      });
    }

    const history =
      await FactoryCardHistory.find({
        factoryCard: id,
      })
        .populate(
          "changedBy",
          "name role position email"
        )
        .sort({
          changedAt: -1,
        });

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error(
      "GET FACTORY CARD HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error",
    });
  }
};