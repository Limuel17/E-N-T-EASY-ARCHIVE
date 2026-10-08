import mongoose from "mongoose";

// ============================================================
// OPERATION SCHEMA
// ============================================================

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

// ============================================================
// CUSTOMER ITEM SCHEMA
// ============================================================

const customerItemSchema = new mongoose.Schema(
  {
    // ==========================================================
    // CUSTOMER
    // ==========================================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // ==========================================================
    // ITEM CODE
    // Example:
    // NAIX-01
    // NAIX-02
    // NAIX-03
    // ==========================================================

    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    // ==========================================================
    // ITEM INFORMATION
    // ==========================================================

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

    // ==========================================================
    // DIMENSIONS
    //
    // All dimensions are stored in millimeters.
    //
    // Frontend converts MM → INCHES for display.
    //
    // Example:
    //
    // widthMM  = 150
    // lengthMM = 650
    // heightMM = 200
    //
    // Display:
    //
    // 150 × 650 × 200 mm
    // 5.91 × 25.59 × 7.87 in
    //
    // ==========================================================

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

    heightMM: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================================
    // PRINTING / JOINT
    // ==========================================================

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

    // ==========================================================
    // MATERIAL SPECIFICATION
    // ==========================================================

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

    // ==========================================================
    // PRODUCTION TOOLS
    // ==========================================================

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

    // ==========================================================
    // OPERATIONS / PROCESS FLOW
    // ==========================================================

    operations: {
      type: [operationSchema],
      default: [],
    },

    // ==========================================================
    // CREATED BY
    // ==========================================================

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

// ============================================================
// UNIQUE ITEM CODE PER CUSTOMER
// ============================================================
//
// Same customer:
//   NAIX-01  ✅
//   NAIX-02  ✅
//   NAIX-03  ✅
//
// Different customer:
//   NAIX-01  ✅
//   ABC-01   ✅
//
// ============================================================

customerItemSchema.index(
  {
    customer: 1,
    code: 1,
  },
  {
    unique: true,
  }
);

// ============================================================
// CUSTOMER + NAME INDEX
// ============================================================

customerItemSchema.index({
  customer: 1,
  name: 1,
});

// ============================================================
// MODEL
// ============================================================

const CustomerItem = mongoose.model(
  "CustomerItem",
  customerItemSchema
);

export default CustomerItem;