
import mongoose from "mongoose";

import JobOrder from "../models/JobOrder.js";
import Customer from "../models/Customer.js";
import CustomerItem from "../models/CustomerItem.js";

// ============================================================
// HELPERS
// ============================================================

const getUserId = (user) =>
  user?._id || user?.id || null;

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const cleanText = (value) =>
  String(value ?? "").trim();

const cleanUpper = (value) =>
  cleanText(value).toUpperCase();

const normalizeQuantity = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return number;
};

const isValidDate = (value) => {
  if (!value) {
    return true;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
};

// ============================================================
// ALLOWED VALUES
// ============================================================

const ALLOWED_PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "In Production",
  "Completed",
  "Cancelled",
];

// ============================================================
// JOB ORDER NUMBER
// ============================================================

const generateJobOrderNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `JO-${year}-`;

  const latest = await JobOrder.findOne({
    jobOrderNumber: {
      $regex: `^${prefix}\\d+$`,
      $options: "i",
    },
  })
    .sort({
      jobOrderNumber: -1,
    })
    .select("jobOrderNumber")
    .lean();

  let nextNumber = 1;

  if (latest?.jobOrderNumber) {
    const match =
      latest.jobOrderNumber.match(/(\d+)$/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};

// ============================================================
// SNAPSHOT CUSTOMER
// ============================================================

const createCustomerSnapshot = (customer) => ({
  code: cleanUpper(customer?.code),

  name: cleanUpper(customer?.name),

  address: cleanText(customer?.address),

  contactPerson: cleanText(
    customer?.contactPerson
  ),

  orderTypes: cleanText(
    customer?.orderTypes
  ),

  limits: cleanText(
    customer?.limits
  ),

  receipts: cleanText(
    customer?.receipts
  ),

  vatType: cleanText(
    customer?.vatType
  ),

  paymentTerms: cleanText(
    customer?.paymentTerms
  ),

  paymentMethod: cleanText(
    customer?.paymentMethod
  ),
});

// ============================================================
// SNAPSHOT CUSTOMER ITEM
// ============================================================

const createCustomerItemSnapshot = (item) => ({
  code: cleanUpper(item?.code),

  productType: cleanText(
    item?.productType
  ),

  name: cleanText(
    item?.name
  ),

  description: cleanText(
    item?.description
  ),

  uom:
    cleanUpper(item?.uom) || "PC",

  widthMM:
    Number(item?.widthMM) || 0,

  lengthMM:
    Number(item?.lengthMM) || 0,

  heightMM:
    Number(item?.heightMM) || 0,

  printingType: cleanText(
    item?.printingType
  ),

  jointType: cleanText(
    item?.jointType
  ),

  materialSpecification: {
    type: cleanText(
      item?.materialSpecification?.type
    ),

    paperCombination: cleanText(
      item?.materialSpecification?.paperCombination
    ),

    fluteTest: cleanText(
      item?.materialSpecification?.fluteTest
    ),

    boardSize: cleanText(
      item?.materialSpecification?.boardSize
    ),
  },

  productionTools: {
    printingPlate: cleanText(
      item?.productionTools?.printingPlate
    ),

    inksColor: cleanText(
      item?.productionTools?.inksColor
    ),

    dcBlade: cleanText(
      item?.productionTools?.dcBlade
    ),
  },

  operations: Array.isArray(item?.operations)
    ? item.operations.map(
        (operation, index) => ({
          step:
            Number(operation?.step) ||
            index + 1,

          processFlow: cleanText(
            operation?.processFlow
          ),

          remarks: cleanText(
            operation?.remarks
          ),
        })
      )
    : [],
});

// ============================================================
// VERIFY CUSTOMER + CUSTOMER ITEM
// ============================================================

const getCustomerAndItem = async (
  customerId,
  customerItemId
) => {
  const [
    customer,
    customerItem,
  ] = await Promise.all([
    Customer.findById(customerId),

    CustomerItem.findById(
      customerItemId
    ),
  ]);

  if (!customer) {
    return {
      error: "Customer not found.",
    };
  }

  if (!customerItem) {
    return {
      error: "Customer Item not found.",
    };
  }

  if (
    String(customerItem.customer) !==
    String(customer._id)
  ) {
    return {
      error:
        "The selected Customer Item does not belong to the selected Customer.",
    };
  }

  return {
    customer,
    customerItem,
  };
};

// ============================================================
// GET ALL JOB ORDERS
// ============================================================

export const getJobOrders = async (
  req,
  res
) => {
  try {
    const jobOrders =
      await JobOrder.find()
        .populate(
          "customer",
          "code name address contactPerson"
        )
        .populate(
          "customerItem",
          "code productType name uom printingType"
        )
        .populate(
          "createdBy",
          "name email role position"
        )
        .populate(
          "updatedBy",
          "name email role position"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      jobOrders,
    });
  } catch (error) {
    console.error(
      "getJobOrders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load Job Orders.",
      error: error.message,
    });
  }
};

// ============================================================
// GET SINGLE JOB ORDER
// ============================================================

export const getJobOrderById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Job Order ID.",
      });
    }

    const jobOrder =
      await JobOrder.findById(id)
        .populate(
          "customer",
          "code name address contactPerson orderTypes limits receipts vatType paymentTerms paymentMethod"
        )
        .populate("customerItem")
        .populate(
          "createdBy",
          "name email role position"
        )
        .populate(
          "updatedBy",
          "name email role position"
        )
        .lean();

    if (!jobOrder) {
      return res.status(404).json({
        success: false,
        message:
          "Job Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      jobOrder,
    });
  } catch (error) {
    console.error(
      "getJobOrderById error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load Job Order.",
      error: error.message,
    });
  }
};

// ============================================================
// CREATE JOB ORDER
// ============================================================

export const createJobOrder = async (
  req,
  res
) => {
  try {
    // ========================================================
    // AUTHENTICATED USER
    // ========================================================

    const userId = getUserId(
      req.user
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user not found.",
      });
    }

    // ========================================================
    // REQUEST DATA
    // ========================================================

    const {
      poNumber,
      customerId,
      customerItemId,
      quantity,
      orderDate,
      dueDate,
      priority,
      status,
      remarks,
    } = req.body;

    // ========================================================
    // VALIDATE PO NUMBER
    // ========================================================

    const cleanPoNumber =
      cleanUpper(poNumber);

    if (!cleanPoNumber) {
      return res.status(400).json({
        success: false,
        message:
          "PO Number is required.",
      });
    }

    // ========================================================
    // VALIDATE CUSTOMER ID
    // ========================================================

    const cleanCustomerId =
      cleanText(customerId);

    if (
      !cleanCustomerId ||
      !isValidObjectId(
        cleanCustomerId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid Customer is required.",
      });
    }

    // ========================================================
    // VALIDATE CUSTOMER ITEM ID
    // ========================================================

    const cleanCustomerItemId =
      cleanText(customerItemId);

    if (
      !cleanCustomerItemId ||
      !isValidObjectId(
        cleanCustomerItemId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid Customer Item is required.",
      });
    }

    // ========================================================
    // VALIDATE QUANTITY
    // ========================================================

    const normalizedQuantity =
      normalizeQuantity(quantity);

    if (
      normalizedQuantity === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0.",
      });
    }

    // ========================================================
    // VALIDATE ORDER DATE
    // ========================================================

    if (!isValidDate(orderDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Order Date.",
      });
    }

    // ========================================================
    // VALIDATE DUE DATE
    // ========================================================

    if (!isValidDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Due Date.",
      });
    }

    // ========================================================
    // LOAD CUSTOMER + CUSTOMER ITEM
    // ========================================================

    const result =
      await getCustomerAndItem(
        cleanCustomerId,
        cleanCustomerItemId
      );

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error,
      });
    }

    const {
      customer,
      customerItem,
    } = result;

    // ========================================================
    // GENERATE JOB ORDER NUMBER
    // ========================================================

    const jobOrderNumber =
      await generateJobOrderNumber();

    // ========================================================
    // NORMALIZE PRIORITY
    // ========================================================

    const normalizedPriority =
      ALLOWED_PRIORITIES.includes(
        priority
      )
        ? priority
        : "Medium";

    // ========================================================
    // NORMALIZE STATUS
    // ========================================================

    const normalizedStatus =
      ALLOWED_STATUSES.includes(
        status
      )
        ? status
        : "Pending";

    // ========================================================
    // CREATE JOB ORDER
    // ========================================================

    const jobOrder =
      await JobOrder.create({
        jobOrderNumber,

        poNumber: cleanPoNumber,

        customer: customer._id,

        customerItem:
          customerItem._id,

        quantity:
          normalizedQuantity,

        // UOM automatically comes
        // from Customer Item.
        uom:
          cleanUpper(
            customerItem.uom
          ) || "PC",

        orderDate:
          orderDate
            ? new Date(orderDate)
            : new Date(),

        dueDate:
          dueDate
            ? new Date(dueDate)
            : null,

        priority:
          normalizedPriority,

        status:
          normalizedStatus,

        remarks:
          cleanText(remarks),

        customerSnapshot:
          createCustomerSnapshot(
            customer
          ),

        customerItemSnapshot:
          createCustomerItemSnapshot(
            customerItem
          ),

        createdBy:
          userId,
      });

    // ========================================================
    // POPULATE CREATED JOB ORDER
    // ========================================================

    await jobOrder.populate([
      {
        path: "customer",
        select:
          "code name address contactPerson",
      },

      {
        path: "customerItem",
        select:
          "code productType name uom printingType",
      },

      {
        path: "createdBy",
        select:
          "name email role position",
      },
    ]);

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,

      message:
        "Job Order created successfully.",

      jobOrder,
    });
  } catch (error) {
    console.error(
      "createJobOrder error:",
      error
    );

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A duplicate Job Order value was detected. Please try again.",
      });
    }

    // ========================================================
    // MONGOOSE VALIDATION ERROR
    // ========================================================

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid Job Order data.",

        errors: Object.values(
          error.errors
        ).map(
          (item) => item.message
        ),
      });
    }

    // ========================================================
    // SERVER ERROR
    // ========================================================

    return res.status(500).json({
      success: false,

      message:
        "Failed to create Job Order.",

      error: error.message,
    });
  }
};

// ============================================================
// UPDATE JOB ORDER
// ============================================================

export const updateJobOrder = async (
  req,
  res
) => {
  try {
    // ========================================================
    // AUTHENTICATED USER
    // ========================================================

    const userId = getUserId(
      req.user
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user not found.",
      });
    }

    // ========================================================
    // JOB ORDER ID
    // ========================================================

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Job Order ID.",
      });
    }

    // ========================================================
    // FIND JOB ORDER
    // ========================================================

    const jobOrder =
      await JobOrder.findById(id);

    if (!jobOrder) {
      return res.status(404).json({
        success: false,
        message:
          "Job Order not found.",
      });
    }

    // ========================================================
    // REQUEST DATA
    // ========================================================

    const {
      poNumber,
      customerId,
      customerItemId,
      quantity,
      orderDate,
      dueDate,
      priority,
      status,
      remarks,
    } = req.body;

    // ========================================================
    // PO NUMBER
    // ========================================================

    if (poNumber !== undefined) {
      const cleanPoNumber =
        cleanUpper(poNumber);

      if (!cleanPoNumber) {
        return res.status(400).json({
          success: false,
          message:
            "PO Number is required.",
        });
      }

      jobOrder.poNumber =
        cleanPoNumber;
    }

    // ========================================================
    // CUSTOMER / CUSTOMER ITEM
    // ========================================================

    if (
      customerId !== undefined ||
      customerItemId !== undefined
    ) {
      const nextCustomerId =
        customerId !== undefined
          ? cleanText(customerId)
          : String(
              jobOrder.customer
            );

      const nextCustomerItemId =
        customerItemId !== undefined
          ? cleanText(customerItemId)
          : String(
              jobOrder.customerItem
            );

      if (
        !isValidObjectId(
          nextCustomerId
        ) ||
        !isValidObjectId(
          nextCustomerItemId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Customer or Customer Item.",
        });
      }

      const result =
        await getCustomerAndItem(
          nextCustomerId,
          nextCustomerItemId
        );

      if (result.error) {
        return res.status(400).json({
          success: false,
          message: result.error,
        });
      }

      jobOrder.customer =
        result.customer._id;

      jobOrder.customerItem =
        result.customerItem._id;

      // UOM always follows
      // the selected Customer Item.
      jobOrder.uom =
        cleanUpper(
          result.customerItem.uom
        ) || "PC";

      // Refresh historical snapshots
      // when Customer or Customer Item
      // is changed.
      jobOrder.customerSnapshot =
        createCustomerSnapshot(
          result.customer
        );

      jobOrder.customerItemSnapshot =
        createCustomerItemSnapshot(
          result.customerItem
        );
    }

    // ========================================================
    // QUANTITY
    // ========================================================

    if (quantity !== undefined) {
      const normalizedQuantity =
        normalizeQuantity(
          quantity
        );

      if (
        normalizedQuantity === null
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be greater than 0.",
        });
      }

      jobOrder.quantity =
        normalizedQuantity;
    }

    // ========================================================
    // ORDER DATE
    // ========================================================

    if (orderDate !== undefined) {
      if (!isValidDate(orderDate)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Order Date.",
        });
      }

      if (orderDate) {
        jobOrder.orderDate =
          new Date(orderDate);
      }
    }

    // ========================================================
    // DUE DATE
    // ========================================================

    if (dueDate !== undefined) {
      if (!isValidDate(dueDate)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Due Date.",
        });
      }

      jobOrder.dueDate =
        dueDate
          ? new Date(dueDate)
          : null;
    }

    // ========================================================
    // PRIORITY
    // ========================================================

    if (priority !== undefined) {
      if (
        !ALLOWED_PRIORITIES.includes(
          priority
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid priority.",
        });
      }

      jobOrder.priority =
        priority;
    }

    // ========================================================
    // STATUS
    // ========================================================

    if (status !== undefined) {
      if (
        !ALLOWED_STATUSES.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status.",
        });
      }

      jobOrder.status =
        status;
    }

    // ========================================================
    // REMARKS
    // ========================================================

    if (remarks !== undefined) {
      jobOrder.remarks =
        cleanText(remarks);
    }

    // ========================================================
    // UPDATED BY
    // ========================================================

    jobOrder.updatedBy =
      userId;

    // ========================================================
    // SAVE
    // ========================================================

    await jobOrder.save();

    // ========================================================
    // POPULATE RESPONSE
    // ========================================================

    await jobOrder.populate([
      {
        path: "customer",
        select:
          "code name address contactPerson",
      },

      {
        path: "customerItem",
        select:
          "code productType name uom printingType",
      },

      {
        path: "createdBy",
        select:
          "name email role position",
      },

      {
        path: "updatedBy",
        select:
          "name email role position",
      },
    ]);

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Job Order updated successfully.",

      jobOrder,
    });
  } catch (error) {
    console.error(
      "updateJobOrder error:",
      error
    );

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A duplicate Job Order value was detected.",
      });
    }

    // ========================================================
    // MONGOOSE VALIDATION ERROR
    // ========================================================

    if (
      error?.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid Job Order data.",

        errors: Object.values(
          error.errors
        ).map(
          (item) => item.message
        ),
      });
    }

    // ========================================================
    // SERVER ERROR
    // ========================================================

    return res.status(500).json({
      success: false,

      message:
        "Failed to update Job Order.",

      error: error.message,
    });
  }
};

// ============================================================
// DELETE JOB ORDER
// ============================================================

export const deleteJobOrder = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Job Order ID.",
      });
    }

    // ========================================================
    // FIND JOB ORDER
    // ========================================================

    const jobOrder =
      await JobOrder.findById(id);

    if (!jobOrder) {
      return res.status(404).json({
        success: false,
        message:
          "Job Order not found.",
      });
    }

    // ========================================================
    // DELETE
    // ========================================================

    await JobOrder.findByIdAndDelete(id);

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,

      message:
        "Job Order deleted successfully.",
    });
  } catch (error) {
    console.error(
      "deleteJobOrder error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete Job Order.",

      error: error.message,
    });
  }
};

