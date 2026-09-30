
import Customer from "../models/Customer.js";

/* =========================================================
   HELPERS
========================================================= */

const isAdmin = (user) =>
  String(user?.role || "").toLowerCase() === "admin";

const hasCustomerPermission = (user, action) => {
  if (isAdmin(user)) {
    return true;
  }

  return user?.permissions?.customer?.[action] === true;
};

const cleanText = (value) =>
  String(value ?? "").trim();

const cleanUpper = (value) =>
  cleanText(value).toUpperCase();

/* =========================================================
   GET ALL CUSTOMERS
========================================================= */

export const getCustomers = async (req, res) => {
  try {
    if (!hasCustomerPermission(req.user, "view")) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view customers.",
      });
    }

    const customers = await Customer.find()
      .populate(
        "createdBy",
        "name email role position"
      )
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      customers,
    });
  } catch (error) {
    console.error("Get Customers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load customers.",
    });
  }
};

/* =========================================================
   GET CUSTOMER BY ID
========================================================= */

export const getCustomerById = async (req, res) => {
  try {
    if (!hasCustomerPermission(req.user, "view")) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view customers.",
      });
    }

    const customer = await Customer.findById(
      req.params.id
    ).populate(
      "createdBy",
      "name email role position"
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error(
      "Get Customer By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load customer.",
    });
  }
};

/* =========================================================
   CREATE CUSTOMER
========================================================= */

export const createCustomer = async (req, res) => {
  try {
    if (!hasCustomerPermission(req.user, "add")) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to add customers.",
      });
    }

    const {
      code,
      name,
      address,
      contactPerson,
      orderTypes,
      limits,
      receipts,
      vatType,
      paymentTerms,
      paymentMethod,
    } = req.body;

    const cleanedCode = cleanUpper(code);
    const cleanedName = cleanUpper(name);

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    if (!cleanedCode) {
      return res.status(400).json({
        success: false,
        message: "Customer Code is required.",
      });
    }

    if (!cleanedName) {
      return res.status(400).json({
        success: false,
        message: "Customer Name is required.",
      });
    }

    /* =====================================================
       DUPLICATE CUSTOMER NAME
    ===================================================== */

    const existingCustomer =
      await Customer.findOne({
        name: cleanedName,
      });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          "This Customer Name already exists.",
      });
    }

    /* =====================================================
       CREATE CUSTOMER
    ===================================================== */

    const customer = await Customer.create({
      code: cleanedCode,
      name: cleanedName,
      address: cleanText(address),
      contactPerson: cleanText(contactPerson),

      orderTypes:
        cleanText(orderTypes) || "Exact",

      limits: cleanText(limits),

      receipts:
        cleanText(receipts) ||
        "SALES INVOICE/DELIVERY RECEIPT",

      vatType:
        cleanText(vatType) ||
        "VAT INCLUSIVE",

      paymentTerms:
        cleanText(paymentTerms) ||
        "30 DAYS",

      paymentMethod:
        cleanText(paymentMethod) ||
        "Cash",

      createdBy: req.user._id,
    });

    /* =====================================================
       POPULATE CREATED BY
    ===================================================== */

    const populatedCustomer =
      await Customer.findById(
        customer._id
      ).populate(
        "createdBy",
        "name email role position"
      );

    return res.status(201).json({
      success: true,
      message:
        "Customer created successfully.",
      customer: populatedCustomer,
    });
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error
    );

    /* =====================================================
       DUPLICATE KEY
    ===================================================== */

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This Customer Name already exists.",
      });
    }

    /* =====================================================
       MONGOOSE VALIDATION
    ===================================================== */

    if (error?.name === "ValidationError") {
      const message = Object.values(
        error.errors
      )
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create customer.",
    });
  }
};

/* =========================================================
   UPDATE CUSTOMER
========================================================= */

export const updateCustomer = async (req, res) => {
  try {
    if (!hasCustomerPermission(req.user, "edit")) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to edit customers.",
      });
    }

    const {
      code,
      name,
      address,
      contactPerson,
      orderTypes,
      limits,
      receipts,
      vatType,
      paymentTerms,
      paymentMethod,
    } = req.body;

    const cleanedCode = cleanUpper(code);
    const cleanedName = cleanUpper(name);

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    if (!cleanedCode) {
      return res.status(400).json({
        success: false,
        message: "Customer Code is required.",
      });
    }

    if (!cleanedName) {
      return res.status(400).json({
        success: false,
        message: "Customer Name is required.",
      });
    }

    /* =====================================================
       DUPLICATE CUSTOMER NAME
    ===================================================== */

    const existingCustomer =
      await Customer.findOne({
        name: cleanedName,
        _id: {
          $ne: req.params.id,
        },
      });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message:
          "This Customer Name already exists.",
      });
    }

    /* =====================================================
       UPDATE CUSTOMER
    ===================================================== */

    const customer =
      await Customer.findByIdAndUpdate(
        req.params.id,
        {
          code: cleanedCode,
          name: cleanedName,
          address: cleanText(address),

          contactPerson:
            cleanText(contactPerson),

          orderTypes:
            cleanText(orderTypes) || "Exact",

          limits: cleanText(limits),

          receipts:
            cleanText(receipts) ||
            "SALES INVOICE/DELIVERY RECEIPT",

          vatType:
            cleanText(vatType) ||
            "VAT INCLUSIVE",

          paymentTerms:
            cleanText(paymentTerms) ||
            "30 DAYS",

          paymentMethod:
            cleanText(paymentMethod) ||
            "Cash",
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "createdBy",
        "name email role position"
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Customer updated successfully.",
      customer,
    });
  } catch (error) {
    console.error(
      "Update Customer Error:",
      error
    );

    /* =====================================================
       DUPLICATE KEY
    ===================================================== */

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This Customer Name already exists.",
      });
    }

    /* =====================================================
       MONGOOSE VALIDATION
    ===================================================== */

    if (error?.name === "ValidationError") {
      const message = Object.values(
        error.errors
      )
        .map((item) => item.message)
        .join(" ");

      return res.status(400).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update customer.",
    });
  }
};

/* =========================================================
   DELETE CUSTOMER
========================================================= */

export const deleteCustomer = async (req, res) => {
  try {
    if (!hasCustomerPermission(req.user, "delete")) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete customers.",
      });
    }

    const customer =
      await Customer.findByIdAndDelete(
        req.params.id
      );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Customer deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Customer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete customer.",
    });
  }
};

