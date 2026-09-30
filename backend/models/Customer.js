import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    contactPerson: {
      type: String,
      default: "",
      trim: true,
    },

    orderTypes: {
      type: String,
      enum: [
        "Overrun",
        "Underrun",
        "Exact",
        "OVERRUN/UNDERRUN",
      ],
      default: "Exact",
    },

    limits: { type: String, default: "", trim: true, },

    receipts: {
      type: String,
      enum: [
        "SALES INVOICE/DELIVERY RECEIPT",
        "ACKNOWLEDGMENT RECEIPT",
        "ACKNOWLEDGMENT RECEIPT Miscellaneous",
      ],
      default: "SALES INVOICE/DELIVERY RECEIPT",
    },

    vatType: {
      type: String,
      enum: [
        "VAT ZERO RATED",
        "VAT INCLUSIVE",
        "VAT EXCLUSIVE",
      ],
      default: "VAT INCLUSIVE",
    },

    paymentTerms: {
  type: String,
  enum: [
    "ADVANCE",
    "15 DAYS",
    "30 DAYS",
    "45 DAYS",
    "60 DAYS",
    "90 DAYS",
    "50% DP",
    "50% DP - 50% COD",
    "NOT APPLICABLE",
  ],
  default: "30 DAYS",
},


paymentMethod: {
  type: String,
  enum: [
    "Cash",
    "Credit Card",
    "Debit Card",
    "Digital Wallets",
    "Bank Transfers",
    "Cheque",
    "COD",
  ],
  default: "Cash",
},

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

// Customer name must be unique.
customerSchema.index(
  { name: 1 },
  { unique: true }
);

const Customer = mongoose.model(
  "Customer",
  customerSchema
);

export default Customer;