import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import CustomerItem from "../models/CustomerItem.js";

// ============================================================
// PERMISSIONS
// ============================================================

const isAdmin = (user) => {
  return String(user?.role || "").toLowerCase() === "admin";
};

const hasCustomerPermission = (user, action) => {
  if (isAdmin(user)) return true;

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

// Escape special regex characters
const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ============================================================
// GENERATE NEXT ITEM CODE
// Example:
// NAIX-01
// NAIX-02
// NAIX-03
// ============================================================

const generateNextItemCode = async (customerId, customerCode) => {
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
    const match = String(item.code || "").match(regex);

    if (!match) continue;

    const number = Number(match[1]);

    if (Number.isFinite(number) && number > highestNumber) {
      highestNumber = number;
    }
  }

  const nextNumber = highestNumber + 1;

  return `${prefix}-${String(nextNumber).padStart(2, "0")}`;
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
      const stepValue =
        Number(operation?.step) || index + 1;

      return {
        step: stepValue,
        processFlow: cleanText(
          operation?.processFlow
        ),
        remarks: cleanText(
          operation?.remarks
        ),
      };
    })
    .filter((operation) => operation.step > 0);
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
    productType: cleanText(body.productType),

    name: cleanText(body.name),

    description: cleanText(body.description),

    uom: cleanUpper(body.uom || "PC"),

    widthMM:
      body.widthMM === "" ||
      body.widthMM === null ||
      body.widthMM === undefined
        ? 0
        : Number(body.widthMM),

    lengthMM:
      body.lengthMM === "" ||
      body.lengthMM === null ||
      body.lengthMM === undefined
        ? 0
        : Number(body.lengthMM),

    printingType,

    jointType: cleanText(body.jointType),

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

    productionTools: {
      // Plain products do not need printing plate
      printingPlate: isPlain
        ? ""
        : cleanText(
            body.productionTools?.printingPlate
          ),

      // Plain products do not need ink color
      inksColor: isPlain
        ? ""
        : cleanText(
            body.productionTools?.inksColor
          ),

      dcBlade: cleanText(
        body.productionTools?.dcBlade
      ),
    },

    operations: normalizeOperations(
      body.operations
    ),
  };
};

// ============================================================
// VALIDATE ITEM DATA
// ============================================================

const validateItemData = (data) => {
  if (!data.productType) {
    return "Product Type is required.";
  }

  if (!data.name) {
    return "Item Name is required.";
  }

  if (!data.printingType) {
    return "Printing Type is required.";
  }

  if (
    !Number.isFinite(data.widthMM) ||
    data.widthMM < 0
  ) {
    return "Width must be a valid number in MM.";
  }

  if (
    !Number.isFinite(data.lengthMM) ||
    data.lengthMM < 0
  ) {
    return "Length must be a valid number in MM.";
  }

  return null;
};

// ============================================================
// GET ALL ITEMS FOR CUSTOMER
// GET /api/customers/:customerId/items
// ============================================================

export const getCustomerItems = async (
  req,
  res
) => {
  try {
    if (
      !hasCustomerPermission(
        req.user,
        "view"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view customer items.",
      });
    }

    const { customerId } = req.params;

    if (!isValidId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

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
      message: "Failed to load customer items.",
    });
  }
};

// ============================================================
// GET SINGLE ITEM
// GET /api/customer-items/:id
// ============================================================

export const getCustomerItemById = async (
  req,
  res
) => {
  try {
    if (
      !hasCustomerPermission(
        req.user,
        "view"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view customer items.",
      });
    }

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

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
        message: "Customer item not found.",
      });
    }

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
      message: "Failed to load customer item.",
    });
  }
};

// ============================================================
// CREATE CUSTOMER ITEM
// POST /api/customers/:customerId/items
// ============================================================

export const createCustomerItem = async (
  req,
  res
) => {
  try {
    if (
      !hasCustomerPermission(
        req.user,
        "add"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to add customer items.",
      });
    }

    const { customerId } = req.params;

    if (!isValidId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

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

    const itemData = normalizeItemData(
      req.body
    );

    const validationError =
      validateItemData(itemData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // --------------------------------------------------------
    // Generate item code.
    //
    // Retry if another user creates the same number
    // at exactly the same time.
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
        const item =
          await CustomerItem.create({
            customer: customerId,

            code,

            ...itemData,

            createdBy: req.user._id,
          });

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

        return res.status(201).json({
          success: true,
          message: "Customer item created successfully.",
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

    if (isDuplicateError(error)) {
      return res.status(409).json({
        success: false,
        message:
          "Unable to create item because the generated item code already exists.",
      });
    }

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      const messages = Object.values(
        error.errors
      ).map(
        (validation) => validation.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create customer item.",
    });
  }
};

// ============================================================
// UPDATE CUSTOMER ITEM
// PUT /api/customer-items/:id
// ============================================================

export const updateCustomerItem = async (
  req,
  res
) => {
  try {
    if (
      !hasCustomerPermission(
        req.user,
        "edit"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit customer items.",
      });
    }

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const existingItem =
      await CustomerItem.findById(id);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Customer item not found.",
      });
    }

    const itemData = normalizeItemData(
      req.body
    );

    const validationError =
      validateItemData(itemData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // --------------------------------------------------------
    // Code and customer are NOT changed during edit.
    // --------------------------------------------------------

    existingItem.productType =
      itemData.productType;

    existingItem.name =
      itemData.name;

    existingItem.description =
      itemData.description;

    existingItem.uom =
      itemData.uom;

    existingItem.widthMM =
      itemData.widthMM;

    existingItem.lengthMM =
      itemData.lengthMM;

    existingItem.printingType =
      itemData.printingType;

    existingItem.jointType =
      itemData.jointType;

    existingItem.materialSpecification =
      itemData.materialSpecification;

    existingItem.productionTools =
      itemData.productionTools;

    existingItem.operations =
      itemData.operations;

    await existingItem.save();

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

    return res.status(200).json({
      success: true,
      message: "Customer item updated successfully.",
      item: populatedItem,
    });
  } catch (error) {
    console.error(
      "Update Customer Item Error:",
      error
    );

    if (isDuplicateError(error)) {
      return res.status(409).json({
        success: false,
        message:
          "This customer item code already exists.",
      });
    }

    if (
      error instanceof mongoose.Error.ValidationError
    ) {
      const messages = Object.values(
        error.errors
      ).map(
        (validation) => validation.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update customer item.",
    });
  }
};

// ============================================================
// DELETE CUSTOMER ITEM
// DELETE /api/customer-items/:id
// ============================================================

export const deleteCustomerItem = async (
  req,
  res
) => {
  try {
    if (
      !hasCustomerPermission(
        req.user,
        "delete"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete customer items.",
      });
    }

    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const item =
      await CustomerItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Customer item not found.",
      });
    }

    await CustomerItem.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Customer item deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Customer Item Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete customer item.",
    });
  }
};