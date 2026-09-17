
import mongoose from "mongoose";

const factoryCardHistorySchema = new mongoose.Schema(
  {
    factoryCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FactoryCard",
      required: true,
    },

    action: {
      type: String,
      enum: ["Created", "Updated", "Deleted"],
      required: true,
    },

    changedFields: [
      {
        field: {
          type: String,
          required: true,
        },

        oldValue: {
          type: mongoose.Schema.Types.Mixed,
        },

        newValue: {
          type: mongoose.Schema.Types.Mixed,
        },
      },
    ],

    // Note is stored ONLY in FactoryCardHistory
    note: {
      type: String,
      default: "",
      trim: true,
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const FactoryCardHistory = mongoose.model(
  "FactoryCardHistory",
  factoryCardHistorySchema
);

export default FactoryCardHistory;

