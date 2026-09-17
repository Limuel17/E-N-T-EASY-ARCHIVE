import mongoose from "mongoose";

const milledRunSheetOptionSchema =
  new mongoose.Schema(
    {
      category: {
        type: String,
        enum: [
          "type",
          "paper-combination",
        ],
        required: true,
        trim: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

// ============================================
// UNIQUE INDEX
// ============================================

milledRunSheetOptionSchema.index(
  {
    category: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

// ============================================
// MODEL
// ============================================

const MilledRunSheetOption =
  mongoose.model(
    "MilledRunSheetOption",
    milledRunSheetOptionSchema
  );

export default MilledRunSheetOption;