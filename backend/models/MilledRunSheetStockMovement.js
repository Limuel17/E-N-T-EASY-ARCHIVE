
import mongoose from "mongoose";

const milledRunSheetStockMovementSchema = new mongoose.Schema(
  {
    milledRunSheet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MilledRunSheet",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "created",
        "add",
        "remove",
        "adjustment",
        "edit",
      ],
      required: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },

    balanceAfter: {
      type: Number,
      default: 0,
    },

    oldStock: {
      type: Number,
      default: null,
    },

    newStock: {
      type: Number,
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const MilledRunSheetStockMovement =
  mongoose.models.MilledRunSheetStockMovement ||
  mongoose.model(
    "MilledRunSheetStockMovement",
    milledRunSheetStockMovementSchema
  );

export default MilledRunSheetStockMovement;

