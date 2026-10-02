import mongoose from "mongoose";

const customerItemOptionSchema = new mongoose.Schema(
  {
    // =========================================================
    // OPTION CATEGORY
    // =========================================================

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,

      enum: [
        "product_type",
        "uom",
        "printing_type",
        "joint_type",
        "material_type",
        "paper_combination",
        "printing_plate",
        "ink_color",
        "dc_blade",
        "process_flow",
      ],
    },

    // =========================================================
    // OPTION NAME
    // =========================================================

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

// =============================================================
// PREVENT DUPLICATE OPTION NAMES
// INSIDE THE SAME CATEGORY
// =============================================================

customerItemOptionSchema.index(
  {
    category: 1,
    name: 1,
  },
  {
    unique: true,
  }
);

// =============================================================
// MODEL
// =============================================================

const CustomerItemOption =
  mongoose.models.CustomerItemOption ||
  mongoose.model(
    "CustomerItemOption",
    customerItemOptionSchema
  );

export default CustomerItemOption;