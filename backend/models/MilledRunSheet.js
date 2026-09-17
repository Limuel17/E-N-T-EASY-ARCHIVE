import mongoose from "mongoose";

const milledRunSheetSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      trim: true,
    },

    supplier: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
    },

    paperCombination: {
      type: String,
      required: true,
      trim: true,
    },

    specification: {
      type: String,
      required: true,
      trim: true,
    },

    // Original quantity.
    // This value is used when creating the run sheet.
    // Editing the run sheet does NOT change this value.
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Pending quantity.
    pendingQty: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    // Current available stock.
    // New run sheet:
    // stock = quantity
    //
    // Edit run sheet:
    // stock can be changed directly.
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const MilledRunSheet = mongoose.model(
  "MilledRunSheet",
  milledRunSheetSchema
);

export default MilledRunSheet;