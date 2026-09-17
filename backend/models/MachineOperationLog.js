import mongoose from "mongoose";

const machineOperationLogSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
    },

    itemDescription: {
      type: String,
      required: true,
      trim: true,
    },

    dimension: {
      type: String,
      required: true,
      trim: true,
    },

    flute: {
      type: String,
      required: true,
      trim: true,
    },

    joint: {
      type: String,
      required: true,
      trim: true,
    },

    boxType: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      trim: true,
    },

    requestedBy: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const MachineOperationLog = mongoose.model(
  "MachineOperationLog",
  machineOperationLogSchema
);

export default MachineOperationLog;