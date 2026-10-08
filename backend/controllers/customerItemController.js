import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import CustomerItem from "../models/CustomerItem.js";

// ============================================================
// PERMISSIONS
// ============================================================

const isAdmin = (user) => {
  return (
    String(user?.role || "").toLowerCase() === "admin"
  );
};

const hasCustomerPermission = (user, action) => {
  if (isAdmin(user)) {
    return true;
  }

  return user?.permissions?.customer?.[action] === true;
};

// ============================================================
// HELPERS
// ============================================================

const cleanText = (value) => {
  return String(value ?? "").trim();
};

const cleanUpper = (value) => {
  return cleanText(value).toUpperCase();
};

const isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};

const isDuplicateError = (error) => {
  return error?.code === 11000;
};

// ============================================================
// ESCAPE REGEX
// ============================================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ============================================================
// NORMALIZE NUMBER
// ============================================================

const normalizeDimension = (value) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : NaN;
};

// ============================================================
// GENERATE NEXT ITEM CODE
//
// Example:
//
// NAIX-01
// NAIX-02
// NAIX-03
//
// ============================================================

const generateNextItemCode = async (
  customerId,
  customerCode
) => {
  const prefix = cleanUpper(customerCode);

  const regex = new RegExp(
    `^${escapeRegex(prefix)}-(\\d+)$`,
    "i"
  );

  const existingItems = await CustomerItem.find({
    customer: customerId,
  })
    .select("code")
    .lean();

  let highestNumber = 0;

  for (const item of existingItems) {
    const match = String(
      item?.code || ""
    ).match(regex);

    if (!match) {
      continue;
    }

    const number = Number(match[1]);

    if (
      Number.isFinite(number) &&
      number > highestNumber
    ) {
      highestNumber = number;
    }
  }

  const nextNumber = highestNumber + 1;

  return `${prefix}-${String(nextNumber).padStart(
    2,
    "0"
  )}`;
};

// ============================================================
// NORMALIZE OPERATIONS
// ============================================================

const normalizeOperations = (operations) => {
  if (!Array.isArray(operations)) {
    return [];
  }

  return operations
    .map((operation, index) => {
      const step =
        Number(operation?.step) || index + 1;

      return {
        step,
        processFlow: cleanText(
          operation?.processFlow
        ),
        remarks: cleanText(
          operation?.remarks
        ),
      };
    })
    .filter(
      (operation) =>
        Number.isFinite(operation.step) &&
        operation.step > 0
    );
};

// ============================================================
// NORMALIZE ITEM DATA
// ============================================================

const normalizeItemData = (body = {}) => {
  const printingType = cleanText(
    body.printingType
  );

  const isPlain =
    printingType.toLowerCase() === "plain";

  return {
    // ========================================================
    // ITEM INFORMATION
    // ========================================================

    productType: cleanText(
      body.productType
    ),

    name: cleanText(body.name),

    description: cleanText(
      body.description
    ),

    uom: cleanUpper(
      body.uom || "PC"
    ),

    // ========================================================
    // DIMENSIONS
    //
    // Stored in MM.
    //
    // Example:
    //
    // widthMM  = 150
    // lengthMM = 650
    // heightMM = 200
    //
    // ========================================================

    widthMM: normalizeDimension(
      body.widthMM
    ),

    lengthMM: normalizeDimension(
      body.lengthMM
    ),

    heightMM: normalizeDimension(
      body.heightMM
    ),

    // ========================================================
    // PRINTING / JOINT
    // ========================================================

    printingType,

    jointType: cleanText(
      body.jointType
    ),

    // ========================================================
    // MATERIAL SPECIFICATION
    // ========================================================

    materialSpecification: {
      type: cleanText(
        body.materialSpecification?.type
      ),

      paperCombination: cleanText(
        body.materialSpecification
          ?.paperCombination
      ),

      fluteTest: cleanText(
        body.materialSpecification
          ?.fluteTest
      ),

      boardSize: cleanText(
        body.materialSpecification
          ?.boardSize
      ),
    },

    // ========================================================
    // PRODUCTION TOOLS
    // ========================================================

    productionTools: {
      printingPlate: isPlain
        ? ""
        : cleanText(
            body.productionTools
              ?.printingPlate
          ),

      inksColor: isPlain
        ? ""
        : cleanText(
            body.productionTools
              ?.inksColor
          ),

      dcBlade: cleanText(
        body.productionTools?.dcBlade
      ),
    },

    // ========================================================
    // OPERATIONS
    // ========================================================

    operations: normalizeOperations(
      body.operations
    ),
  };
};

// ============================================================
// VALIDATE ITEM DATA
// ============================================================

const validateItemData = (data) => {
  // ----------------------------------------------------------
  // PRODUCT TYPE
  // ----------------------------------------------------------

  if (!data.productType) {
    return "Product Type is required.";
  }

  // ----------------------------------------------------------
  // NAME
  // ----------------------------------------------------------

  if (!data.name) {
    return "Item Name is required.";
  }

  // ----------------------------------------------------------
  // PRINTING TYPE
  // ----------------------------------------------------------

  if (!data.printingType) {
    return "Printing Type is required.";
  }

  // ----------------------------------------------------------
  // WIDTH
  // ----------------------------------------------------------

  if (
    !Number.isFinite(data.widthMM) ||
    data.widthMM < 0
  ) {
    return "Width must be a valid number in MM.";
  }

  // ----------------------------------------------------------
  // LENGTH
  // ----------------------------------------------------------

  if (
    !Number.isFinite(data.lengthMM) ||
    data.lengthMM < 0
  ) {
    return "Length must be a valid number in MM.";
  }

  // ----------------------------------------------------------
  // HEIGHT
  // ----------------------------------------------------------

  if (
    !Number.isFinite(data.heightMM) ||
    data.heightMM < 0
  ) {
    return "Height must be a valid number in MM.";
  }

  return null;
};

// ============================================================
// GET ALL ITEMS FOR CUSTOMER
//
// GET /api/customer-items/customer/:customerId
//
// ============================================================

export const getCustomerItems = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (
      !hasCustomerPermission(
        req.user,
        "view"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view customer items.",
      });
    }

    // --------------------------------------------------------
    // CUSTOMER ID
    // --------------------------------------------------------

    const { customerId } = req.params;

    if (!isValidId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // --------------------------------------------------------
    // CUSTOMER
    // --------------------------------------------------------

    const customer = await Customer.findById(
      customerId
    )
      .select("_id code name")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // --------------------------------------------------------
    // ITEMS
    // --------------------------------------------------------

    const items = await CustomerItem.find({
      customer: customerId,
    })
      .populate(
        "createdBy",
        "name email role position"
      )
      .sort({
        name: 1,
        code: 1,
      })
      .lean();

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      customer,
      items,
    });
  } catch (error) {
    console.error(
      "Get Customer Items Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load customer items.",
    });
  }
};

// ============================================================
// GET SINGLE ITEM
//
// GET /api/customer-items/:id
//
// ============================================================

export const getCustomerItemById = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (
      !hasCustomerPermission(
        req.user,
        "view"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to view customer items.",
      });
    }

    // --------------------------------------------------------
    // ITEM ID
    // --------------------------------------------------------

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    // --------------------------------------------------------
    // FIND ITEM
    // --------------------------------------------------------

    const item = await CustomerItem.findById(id)
      .populate(
        "customer",
        "_id code name"
      )
      .populate(
        "createdBy",
        "name email role position"
      )
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Customer item not found.",
      });
    }

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error(
      "Get Customer Item Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load customer item.",
    });
  }
};

// ============================================================
// CREATE CUSTOMER ITEM
//
// POST /api/customer-items/customer/:customerId
//
// ============================================================

export const createCustomerItem = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (
      !hasCustomerPermission(
        req.user,
        "add"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to add customer items.",
      });
    }

    // --------------------------------------------------------
    // CUSTOMER ID
    // --------------------------------------------------------

    const { customerId } = req.params;

    if (!isValidId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // --------------------------------------------------------
    // CUSTOMER
    // --------------------------------------------------------

    const customer = await Customer.findById(
      customerId
    )
      .select("_id code name")
      .lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE
    // --------------------------------------------------------

    const itemData = normalizeItemData(
      req.body
    );

    // --------------------------------------------------------
    // VALIDATE
    // --------------------------------------------------------

    const validationError =
      validateItemData(itemData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // --------------------------------------------------------
    // GENERATE CODE
    // --------------------------------------------------------

    const MAX_RETRIES = 5;

    for (
      let attempt = 1;
      attempt <= MAX_RETRIES;
      attempt++
    ) {
      const code =
        await generateNextItemCode(
          customerId,
          customer.code
        );

      try {
        // ----------------------------------------------------
        // CREATE
        // ----------------------------------------------------

        const item =
          await CustomerItem.create({
            customer: customerId,
            code,
            ...itemData,
            createdBy: req.user._id,
          });

        // ----------------------------------------------------
        // POPULATE
        // ----------------------------------------------------

        const populatedItem =
          await CustomerItem.findById(
            item._id
          )
            .populate(
              "customer",
              "_id code name"
            )
            .populate(
              "createdBy",
              "name email role position"
            );

        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        return res.status(201).json({
          success: true,
          message:
            "Customer item created successfully.",
          item: populatedItem,
        });
      } catch (error) {
        if (
          isDuplicateError(error) &&
          attempt < MAX_RETRIES
        ) {
          continue;
        }

        throw error;
      }
    }

    return res.status(409).json({
      success: false,
      message:
        "Unable to generate a unique item code. Please try again.",
    });
  } catch (error) {
    console.error(
      "Create Customer Item Error:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE
    // --------------------------------------------------------

    if (isDuplicateError(error)) {
      return res.status(409).json({
        success: false,
        message:
          "Unable to create item because the generated item code already exists.",
      });
    }

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      const messages = Object.values(
        error.errors
      ).map(
        (validation) =>
          validation.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }

    // --------------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------------

    return res.status(500).json({
      success: false,
      message:
        "Failed to create customer item.",
    });
  }
};

// ============================================================
// UPDATE CUSTOMER ITEM
//
// PUT /api/customer-items/:id
//
// ============================================================

export const updateCustomerItem = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (
      !hasCustomerPermission(
        req.user,
        "edit"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to edit customer items.",
      });
    }

    // --------------------------------------------------------
    // ITEM ID
    // --------------------------------------------------------

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    // --------------------------------------------------------
    // EXISTING ITEM
    // --------------------------------------------------------

    const existingItem =
      await CustomerItem.findById(id);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message:
          "Customer item not found.",
      });
    }

    // --------------------------------------------------------
    // NORMALIZE
    // --------------------------------------------------------

    const itemData = normalizeItemData(
      req.body
    );

    // --------------------------------------------------------
    // VALIDATE
    // --------------------------------------------------------

    const validationError =
      validateItemData(itemData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // --------------------------------------------------------
    // UPDATE ITEM INFORMATION
    // --------------------------------------------------------

    existingItem.productType =
      itemData.productType;

    existingItem.name =
      itemData.name;

    existingItem.description =
      itemData.description;

    existingItem.uom =
      itemData.uom;

    // --------------------------------------------------------
    // UPDATE DIMENSIONS
    // --------------------------------------------------------

    existingItem.widthMM =
      itemData.widthMM;

    existingItem.lengthMM =
      itemData.lengthMM;

    existingItem.heightMM =
      itemData.heightMM;

    // --------------------------------------------------------
    // UPDATE PRINTING / JOINT
    // --------------------------------------------------------

    existingItem.printingType =
      itemData.printingType;

    existingItem.jointType =
      itemData.jointType;

    // --------------------------------------------------------
    // UPDATE MATERIAL
    // --------------------------------------------------------

    existingItem.materialSpecification =
      itemData.materialSpecification;

    // --------------------------------------------------------
    // UPDATE PRODUCTION TOOLS
    // --------------------------------------------------------

    existingItem.productionTools =
      itemData.productionTools;

    // --------------------------------------------------------
    // UPDATE OPERATIONS
    // --------------------------------------------------------

    existingItem.operations =
      itemData.operations;

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    await existingItem.save();

    // --------------------------------------------------------
    // POPULATE UPDATED ITEM
    // --------------------------------------------------------

    const populatedItem =
      await CustomerItem.findById(id)
        .populate(
          "customer",
          "_id code name"
        )
        .populate(
          "createdBy",
          "name email role position"
        );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Customer item updated successfully.",
      item: populatedItem,
    });
  } catch (error) {
    console.error(
      "Update Customer Item Error:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE
    // --------------------------------------------------------

    if (isDuplicateError(error)) {
      return res.status(409).json({
        success: false,
        message:
          "This customer item code already exists.",
      });
    }

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      error instanceof
      mongoose.Error.ValidationError
    ) {
      const messages = Object.values(
        error.errors
      ).map(
        (validation) =>
          validation.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }

    // --------------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------------

    return res.status(500).json({
      success: false,
      message:
        "Failed to update customer item.",
    });
  }
};

// ============================================================
// DELETE CUSTOMER ITEM
//
// DELETE /api/customer-items/:id
//
// ============================================================

export const deleteCustomerItem = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------------
    // PERMISSION
    // --------------------------------------------------------

    if (
      !hasCustomerPermission(
        req.user,
        "delete"
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to delete customer items.",
      });
    }

    // --------------------------------------------------------
    // ITEM ID
    // --------------------------------------------------------

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    // --------------------------------------------------------
    // FIND ITEM
    // --------------------------------------------------------

    const item =
      await CustomerItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message:
          "Customer item not found.",
      });
    }

    // --------------------------------------------------------
    // DELETE
    // --------------------------------------------------------

    await CustomerItem.findByIdAndDelete(id);

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Customer item deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Customer Item Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete customer item.",
    });
  }
};