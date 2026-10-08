import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import CustomerItem from "../models/CustomerItem.js";

// ============================================================
// HELPERS
// ============================================================

const getUserId = (user) => {
  return user?._id || user?.id || null;
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// CODE HELPERS
// ============================================================

const getCodeNumber = (code) => {
  const match = String(code || "").match(/-(\d+)$/);

  if (!match) {
    return 0;
  }

  const number = Number(match[1]);

  return Number.isFinite(number) ? number : 0;
};

const createItemCode = (customerCode, sequence) => {
  const prefix = String(customerCode || "")
    .trim()
    .toUpperCase();

  return `${prefix}-${String(sequence).padStart(2, "0")}`;
};

const sortItemsByCode = (items = []) => {
  return [...items].sort((a, b) => {
    const numberA = getCodeNumber(a?.code);
    const numberB = getCodeNumber(b?.code);

    if (numberA !== numberB) {
      return numberA - numberB;
    }

    return String(a?._id || "").localeCompare(
      String(b?._id || "")
    );
  });
};

// ============================================================
// NORMALIZATION
// ============================================================

const normalizeString = (value) => {
  return String(value ?? "").trim();
};

const normalizeNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
};

const normalizeOperations = (operations) => {
  if (!Array.isArray(operations)) {
    return [];
  }

  return operations
    .map((operation, index) => ({
      step: Number(operation?.step) || index + 1,
      processFlow: normalizeString(
        operation?.processFlow
      ),
      remarks: normalizeString(
        operation?.remarks
      ),
    }))
    .filter((operation) => operation.step > 0);
};

const normalizeItemData = (body = {}) => {
  return {
    productType: normalizeString(body.productType),

    name: normalizeString(body.name),

    description: normalizeString(body.description),

    uom: normalizeString(body.uom) || "PC",

    widthMM: normalizeNumber(body.widthMM),

    lengthMM: normalizeNumber(body.lengthMM),

    heightMM: normalizeNumber(body.heightMM),

    printingType: normalizeString(
      body.printingType
    ),

    jointType: normalizeString(
      body.jointType
    ),

    materialSpecification: {
      type: normalizeString(
        body.materialSpecification?.type
      ),

      paperCombination: normalizeString(
        body.materialSpecification?.paperCombination
      ),

      fluteTest: normalizeString(
        body.materialSpecification?.fluteTest
      ),

      boardSize: normalizeString(
        body.materialSpecification?.boardSize
      ),
    },

    productionTools: {
      printingPlate: normalizeString(
        body.productionTools?.printingPlate
      ),

      inksColor: normalizeString(
        body.productionTools?.inksColor
      ),

      dcBlade: normalizeString(
        body.productionTools?.dcBlade
      ),
    },

    operations: normalizeOperations(
      body.operations
    ),
  };
};

// ============================================================
// VALIDATION
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

  return null;
};

// ============================================================
// RENUMBER CUSTOMER ITEMS
// ============================================================

const renumberCustomerItems = async (
  customerId,
  customerCode,
  items
) => {
  const sortedItems = sortItemsByCode(items);

  // ----------------------------------------------------------
  // STEP 1
  // Give every item a temporary unique code.
  //
  // This prevents duplicate-key errors when changing:
  //
  // NAIX-02 -> NAIX-01
  // NAIX-03 -> NAIX-02
  // ----------------------------------------------------------

  const temporaryOperations = sortedItems.map(
    (item) => ({
      updateOne: {
        filter: {
          _id: item._id,
          customer: customerId,
        },

        update: {
          $set: {
            code: `__RENUMBER__${item._id}`,
          },
        },
      },
    })
  );

  if (temporaryOperations.length > 0) {
    await CustomerItem.bulkWrite(
      temporaryOperations,
      {
        ordered: true,
      }
    );
  }

  // ----------------------------------------------------------
  // STEP 2
  // Assign final sequential codes.
  // ----------------------------------------------------------

  const finalOperations = sortedItems.map(
    (item, index) => ({
      updateOne: {
        filter: {
          _id: item._id,
          customer: customerId,
        },

        update: {
          $set: {
            code: createItemCode(
              customerCode,
              index + 1
            ),
          },
        },
      },
    })
  );

  if (finalOperations.length > 0) {
    await CustomerItem.bulkWrite(
      finalOperations,
      {
        ordered: true,
      }
    );
  }
};

// ============================================================
// GET CUSTOMER ITEMS
// GET /api/customers/:customerId/items
// ============================================================

export const getCustomerItems = async (
  req,
  res
) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required.",
      });
    }

    if (!isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const customer = await Customer.findById(
      customerId
    ).lean();

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
        "name email position"
      )
      .lean();

    const sortedItems = sortItemsByCode(items);

    return res.status(200).json({
      success: true,
      customer,
      items: sortedItems,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER ITEMS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load customer items.",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE CUSTOMER ITEM
// GET /api/customer-items/:id
// ============================================================

export const getCustomerItemById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    const item = await CustomerItem.findById(id)
      .populate(
        "customer",
        "code name address contactPerson"
      )
      .populate(
        "createdBy",
        "name email position"
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
      "GET CUSTOMER ITEM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load customer item.",
      error: error.message,
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
    const { customerId } = req.params;

    // --------------------------------------------------------
    // Validate customer ID
    // --------------------------------------------------------

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required.",
      });
    }

    if (!isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // --------------------------------------------------------
    // Find customer
    // --------------------------------------------------------

    const customer = await Customer.findById(
      customerId
    ).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // --------------------------------------------------------
    // Validate authenticated user
    // --------------------------------------------------------

    const userId = getUserId(req.user);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    // --------------------------------------------------------
    // Normalize request data
    // --------------------------------------------------------

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
    // Load existing items.
    //
    // Created order determines the item's position.
    // --------------------------------------------------------

    let existingItems =
      await CustomerItem.find({
        customer: customerId,
      })
        .sort({
          createdAt: 1,
          _id: 1,
        })
        .lean();

    // --------------------------------------------------------
    // Check if existing codes are sequential.
    // --------------------------------------------------------

    if (existingItems.length > 0) {
      const expectedCodes = existingItems.map(
        (_, index) =>
          createItemCode(
            customer.code,
            index + 1
          )
      );

      const needsRenumber =
        existingItems.some(
          (item, index) =>
            item.code !== expectedCodes[index]
        );

      if (needsRenumber) {
        await renumberCustomerItems(
          customerId,
          customer.code,
          existingItems
        );

        existingItems =
          await CustomerItem.find({
            customer: customerId,
          })
            .sort({
              createdAt: 1,
              _id: 1,
            })
            .lean();
      }
    }

    // --------------------------------------------------------
    // Generate next sequential code.
    //
    // Example:
    //
    // NAIX-01
    // NAIX-02
    // NAIX-03
    //
    // Next:
    //
    // NAIX-04
    // --------------------------------------------------------

    const nextSequence =
      existingItems.length + 1;

    const code = createItemCode(
      customer.code,
      nextSequence
    );

    // --------------------------------------------------------
    // Create item
    // --------------------------------------------------------

    const item = await CustomerItem.create({
      customer: customerId,
      code,
      ...itemData,
      createdBy: userId,
    });

    // --------------------------------------------------------
    // Populate created item
    // --------------------------------------------------------

    const populatedItem =
      await CustomerItem.findById(item._id)
        .populate(
          "customer",
          "code name address contactPerson"
        )
        .populate(
          "createdBy",
          "name email position"
        )
        .lean();

    return res.status(201).json({
      success: true,
      message:
        "Customer item created successfully.",
      item: populatedItem,
    });
  } catch (error) {
    console.error(
      "CREATE CUSTOMER ITEM ERROR:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A customer item with this code already exists. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create customer item.",
      error: error.message,
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
    const { id } = req.params;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    // --------------------------------------------------------
    // Find existing item
    // --------------------------------------------------------

    const existingItem =
      await CustomerItem.findById(id);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Customer item not found.",
      });
    }

    // --------------------------------------------------------
    // Normalize data
    // --------------------------------------------------------

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
    // Customer and code are NOT editable.
    //
    // They are controlled by the sequence system.
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

    existingItem.heightMM =
      itemData.heightMM;

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

    // --------------------------------------------------------
    // Get updated item
    // --------------------------------------------------------

    const updatedItem =
      await CustomerItem.findById(id)
        .populate(
          "customer",
          "code name address contactPerson"
        )
        .populate(
          "createdBy",
          "name email position"
        )
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Customer item updated successfully.",
      item: updatedItem,
    });
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER ITEM ERROR:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A customer item with this code already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update customer item.",
      error: error.message,
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
    const { id } = req.params;

    // --------------------------------------------------------
    // Validate ID
    // --------------------------------------------------------

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID.",
      });
    }

    // --------------------------------------------------------
    // Find item
    // --------------------------------------------------------

    const item =
      await CustomerItem.findById(id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Customer item not found.",
      });
    }

    const customerId = item.customer;

    // --------------------------------------------------------
    // Delete item
    // --------------------------------------------------------

    await CustomerItem.deleteOne({
      _id: id,
    });

    // --------------------------------------------------------
    // Find remaining items
    // --------------------------------------------------------

    const remainingItems =
      await CustomerItem.find({
        customer: customerId,
      })
        .sort({
          createdAt: 1,
          _id: 1,
        })
        .lean();

    // --------------------------------------------------------
    // Find customer
    // --------------------------------------------------------

    const customer =
      await Customer.findById(
        customerId
      ).lean();

    if (!customer) {
      return res.status(200).json({
        success: true,
        message:
          "Customer item deleted successfully.",
      });
    }

    // --------------------------------------------------------
    // Renumber remaining items
    // --------------------------------------------------------

    if (remainingItems.length > 0) {
      await renumberCustomerItems(
        customerId,
        customer.code,
        remainingItems
      );
    }

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Customer item deleted and item codes were renumbered successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CUSTOMER ITEM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete customer item.",
      error: error.message,
    });
  }
};