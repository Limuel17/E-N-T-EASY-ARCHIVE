import mongoose from "mongoose";

const operationSchema = new mongoose.Schema(
  {
    step: {
      type: Number,
      required: true,
      min: 1,
    },

    processFlow: {
      type: String,
      default: "",
      trim: true,
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

const customerItemSchema = new mongoose.Schema(
  {
    // =========================================================
    // CUSTOMER
    // =========================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // =========================================================
    // ITEM CODE
    // Example: NAIX-01, NAIX-02, NAIX-03
    // =========================================================

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // =========================================================
    // ITEM INFORMATION
    // =========================================================

    productType: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    uom: {
      type: String,
      default: "PC",
      trim: true,
    },

    // =========================================================
    // DIMENSION
    // Store actual values in MM.
    // Inches will be calculated/displayed by frontend.
    // =========================================================

    widthMM: {
      type: Number,
      default: 0,
      min: 0,
    },

    lengthMM: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =========================================================
    // PRINTING / JOINT
    // =========================================================

    printingType: {
      type: String,
      required: true,
      trim: true,
    },

    jointType: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================================================
    // MATERIAL SPECIFICATION
    // =========================================================

    materialSpecification: {
      type: {
        type: String,
        default: "",
        trim: true,
      },

      paperCombination: {
        type: String,
        default: "",
        trim: true,
      },

      fluteTest: {
        type: String,
        default: "",
        trim: true,
      },

      boardSize: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // =========================================================
    // PRODUCTION TOOLS
    //
    // Flexo Printed / Offset Printed:
    //   printingPlate
    //   inksColor
    //   dcBlade
    //
    // Plain:
    //   dcBlade only
    // =========================================================

    productionTools: {
      printingPlate: {
        type: String,
        default: "",
        trim: true,
      },

      inksColor: {
        type: String,
        default: "",
        trim: true,
      },

      dcBlade: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // =========================================================
    // OPERATIONS / PROCESS FLOW
    // =========================================================

    operations: {
      type: [operationSchema],
      default: [],
    },

    // =========================================================
    // CREATED BY
    // =========================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// =============================================================
// INDEXES
// =============================================================

// An item code must be unique only within its customer.
//
// Example:
//
// NAIX + NAIX-01  ✅
// NAIX + NAIX-02  ✅
//
// ABC + ABC-01     ✅
//
// Another customer can have its own numbering.
customerItemSchema.index(
  {
    customer: 1,
    code: 1,
  },
  {
    unique: true,
  }
);

// Helpful for loading items belonging to a customer.
customerItemSchema.index({
  customer: 1,
  name: 1,
});

// =============================================================
// MODEL
// =============================================================

const CustomerItem = mongoose.model(
  "CustomerItem",
  customerItemSchema
);

export default CustomerItem;