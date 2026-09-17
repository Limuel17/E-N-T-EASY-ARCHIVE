
import mongoose from "mongoose";

const factoryCardOptionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["type"],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate option names inside the same category
factoryCardOptionSchema.index(
  {
    category: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

const FactoryCardOption =
  mongoose.models.FactoryCardOption ||
  mongoose.model(
    "FactoryCardOption",
    factoryCardOptionSchema
  );

export default FactoryCardOption;

