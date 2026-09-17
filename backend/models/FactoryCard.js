
import mongoose from "mongoose";

const factoryCardSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    partNumber: {
      type: String,
      required: true,
      trim: true,
    },

    jobOrder: {
      type: String,
      required: true,
      trim: true,
    },

    // Type is now stored as a normal string.
    // Available types come from FactoryCardOption.
    type: {
      type: String,
      required: true,
      trim: true,
    },

    prf: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["In", "Out", "Missing"],
      default: "In",
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const FactoryCard =
  mongoose.models.FactoryCard ||
  mongoose.model("FactoryCard", factoryCardSchema);

export default FactoryCard;

