
import mongoose from "mongoose";

import MilledRunSheet from "../models/MilledRunSheet.js";
import MilledRunSheetStockMovement from "../models/MilledRunSheetStockMovement.js";

/*
|--------------------------------------------------------------------------
| GET ALL MILLED RUN SHEETS
|--------------------------------------------------------------------------
*/

export const getMilledRunSheets = async (req, res) => {
  try {
    const runSheets = await MilledRunSheet.find()
      .populate(
        "createdBy",
        "name email position role"
      )
      .populate(
        "updatedBy",
        "name email position role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: runSheets.length,
      runSheets,
    });
  } catch (error) {
    console.error(
      "GET MILLED RUN SHEETS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch milled run sheets.",
      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE MILLED RUN SHEET
|--------------------------------------------------------------------------
*/

export const getMilledRunSheet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milled run sheet ID.",
      });
    }

    const runSheet = await MilledRunSheet.findById(id)
      .populate(
        "createdBy",
        "name email position role"
      )
      .populate(
        "updatedBy",
        "name email position role"
      );

    if (!runSheet) {
      return res.status(404).json({
        success: false,
        message: "Milled run sheet not found.",
      });
    }

    return res.status(200).json({
      success: true,
      runSheet,
    });
  } catch (error) {
    console.error(
      "GET MILLED RUN SHEET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch milled run sheet.",
      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE MILLED RUN SHEET
|--------------------------------------------------------------------------
|
| NEW RECORD:
|
| Quantity = 100
| Stock    = 100
|
| Stock is automatically initialized from Quantity.
|
| A "created" history record is also created.
|
|--------------------------------------------------------------------------
*/

export const createMilledRunSheet = async (req, res) => {
  try {
    const {
      itemCode,
      supplier,
      customer,
      type,
      paperCombination,
      specification,
      quantity,
      pendingQty,
      price,
      remarks,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE REQUIRED TEXT FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      !itemCode?.trim() ||
      !supplier?.trim() ||
      !type?.trim() ||
      !paperCombination?.trim() ||
      !specification?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CONVERT NUMERIC VALUES
    |--------------------------------------------------------------------------
    */

    const numericQuantity = Number(quantity);
    const numericPendingQty = Number(pendingQty);
    const numericPrice = Number(price);

    /*
    |--------------------------------------------------------------------------
    | VALIDATE QUANTITY
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a valid number greater than or equal to 0.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PENDING QTY
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(numericPendingQty) ||
      numericPendingQty < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pending QTY must be a valid number greater than or equal to 0.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PRICE
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid number greater than or equal to 0.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE RUN SHEET
    |--------------------------------------------------------------------------
    */

    const runSheet = await MilledRunSheet.create({
      itemCode: itemCode.trim(),

      supplier: supplier.trim(),

      customer: customer?.trim() || "",

      type: type.trim(),

      paperCombination:
        paperCombination.trim(),

      specification:
        specification.trim(),

      quantity: numericQuantity,

      pendingQty: numericPendingQty,

      /*
      |--------------------------------------------------------------------------
      | INITIAL STOCK = QUANTITY
      |--------------------------------------------------------------------------
      */

      stock: numericQuantity,

      price: numericPrice,

      remarks: remarks?.trim() || "",

      createdBy: req.user?._id || null,

      updatedBy: null,
    });

    /*
    |--------------------------------------------------------------------------
    | CREATE INITIAL HISTORY RECORD
    |--------------------------------------------------------------------------
    |
    | This is the first history record for the run sheet.
    |
    | Example:
    |
    | Action       = created
    | Quantity     = 100
    | Balance After = 100
    |
    |--------------------------------------------------------------------------
    */

    const creationMovement =
      await MilledRunSheetStockMovement.create({
        milledRunSheet: runSheet._id,

        action: "created",

        quantity: numericQuantity,

        balanceAfter: numericQuantity,

        oldStock: null,

        newStock: numericQuantity,

        remarks:
          remarks?.trim() ||
          "Milled Run Sheet created.",

        performedBy:
          req.user?._id || null,
      });

    /*
    |--------------------------------------------------------------------------
    | POPULATE RUN SHEET
    |--------------------------------------------------------------------------
    */

    const populatedRunSheet =
      await MilledRunSheet.findById(
        runSheet._id
      )
        .populate(
          "createdBy",
          "name email position role"
        )
        .populate(
          "updatedBy",
          "name email position role"
        );

    /*
    |--------------------------------------------------------------------------
    | POPULATE CREATION HISTORY
    |--------------------------------------------------------------------------
    */

    const populatedCreationMovement =
      await MilledRunSheetStockMovement.findById(
        creationMovement._id
      ).populate(
        "performedBy",
        "name email position role"
      );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(201).json({
      success: true,

      message:
        "Milled run sheet created successfully.",

      runSheet: populatedRunSheet,

      history: populatedCreationMovement,
    });
  } catch (error) {
    console.error(
      "CREATE MILLED RUN SHEET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create milled run sheet.",
      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MILLED RUN SHEET
|--------------------------------------------------------------------------
|
| IMPORTANT STOCK RULE:
|
| Quantity is the original quantity.
|
| Editing the run sheet changes Stock only.
|
| Example:
|
| Before:
| Quantity = 100
| Stock    = 100
|
| Edit Stock to 80:
|
| Quantity = 100
| Stock    = 80
|
| A Stock Adjustment history record is created.
|
|--------------------------------------------------------------------------
*/

export const updateMilledRunSheet = async (req, res) => {
  try {
    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE ID
    |--------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milled run sheet ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GET REQUEST DATA
    |--------------------------------------------------------------------------
    */

    const {
      itemCode,
      supplier,
      customer,
      type,
      paperCombination,
      specification,
      stock,
      pendingQty,
      price,
      remarks,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE REQUIRED TEXT FIELDS
    |--------------------------------------------------------------------------
    */

    if (
      !itemCode?.trim() ||
      !supplier?.trim() ||
      !type?.trim() ||
      !paperCombination?.trim() ||
      !specification?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CONVERT NUMERIC VALUES
    |--------------------------------------------------------------------------
    */

    const numericStock = Number(stock);
    const numericPendingQty = Number(pendingQty);
    const numericPrice = Number(price);

    /*
    |--------------------------------------------------------------------------
    | VALIDATE STOCK
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock must be a valid number greater than or equal to 0.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PENDING QTY
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(numericPendingQty) ||
      numericPendingQty < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pending QTY must be a valid number greater than or equal to 0.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE PRICE
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Price must be a valid number greater than or equal to 0.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND RUN SHEET
    |--------------------------------------------------------------------------
    */

    const runSheet =
      await MilledRunSheet.findById(id);

    if (!runSheet) {
      return res.status(404).json({
        success: false,
        message: "Milled run sheet not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | SAVE OLD STOCK
    |--------------------------------------------------------------------------
    */

    const oldStock = Number(
      runSheet.stock || 0
    );

    const newStock = numericStock;

    /*
    |--------------------------------------------------------------------------
    | CALCULATE STOCK ADJUSTMENT
    |--------------------------------------------------------------------------
    */

    const stockAdjustment =
      newStock - oldStock;

    /*
    |--------------------------------------------------------------------------
    | UPDATE BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    runSheet.itemCode =
      itemCode.trim();

    runSheet.supplier =
      supplier.trim();

    runSheet.customer =
      customer?.trim() || "";

    runSheet.type =
      type.trim();

    runSheet.paperCombination =
      paperCombination.trim();

    runSheet.specification =
      specification.trim();

    /*
    |--------------------------------------------------------------------------
    | UPDATE STOCK
    |--------------------------------------------------------------------------
    |
    | Quantity is intentionally NOT changed.
    |
    |--------------------------------------------------------------------------
    */

    runSheet.stock = newStock;

    /*
    |--------------------------------------------------------------------------
    | UPDATE OTHER INFORMATION
    |--------------------------------------------------------------------------
    */

    runSheet.pendingQty =
      numericPendingQty;

    runSheet.price =
      numericPrice;

    runSheet.remarks =
      remarks?.trim() || "";

    /*
    |--------------------------------------------------------------------------
    | RECORD WHO UPDATED THE RUN SHEET
    |--------------------------------------------------------------------------
    */

    runSheet.updatedBy =
      req.user?._id || null;

    /*
    |--------------------------------------------------------------------------
    | SAVE RUN SHEET
    |--------------------------------------------------------------------------
    */

    await runSheet.save();

    /*
    |--------------------------------------------------------------------------
    | CREATE STOCK ADJUSTMENT HISTORY
    |--------------------------------------------------------------------------
    |
    | Only create a history record when Stock actually changes.
    |
    |--------------------------------------------------------------------------
    */

    let adjustmentMovement = null;

    if (stockAdjustment !== 0) {
      adjustmentMovement =
        await MilledRunSheetStockMovement.create({
          milledRunSheet: runSheet._id,

          action: "adjustment",

          quantity: 0,

          balanceAfter: newStock,

          oldStock,

          newStock,

          remarks:
            remarks?.trim() ||
            "Stock manually adjusted.",

          performedBy:
            req.user?._id || null,
        });
    }

    /*
    |--------------------------------------------------------------------------
    | POPULATE UPDATED RUN SHEET
    |--------------------------------------------------------------------------
    */

    const populatedRunSheet =
      await MilledRunSheet.findById(
        runSheet._id
      )
        .populate(
          "createdBy",
          "name email position role"
        )
        .populate(
          "updatedBy",
          "name email position role"
        );

    /*
    |--------------------------------------------------------------------------
    | POPULATE MOVEMENT
    |--------------------------------------------------------------------------
    */

    let populatedMovement = null;

    if (adjustmentMovement) {
      populatedMovement =
        await MilledRunSheetStockMovement.findById(
          adjustmentMovement._id
        ).populate(
          "performedBy",
          "name email position role"
        );
    }

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    return res.status(200).json({
      success: true,

      message:
        "Milled run sheet updated successfully.",

      runSheet: populatedRunSheet,

      stockAdjustment:
        populatedMovement,
    });
  } catch (error) {
    console.error(
      "UPDATE MILLED RUN SHEET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update milled run sheet.",
      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE MILLED RUN SHEET
|--------------------------------------------------------------------------
*/

export const deleteMilledRunSheet = async (req, res) => {
  try {
    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE ID
    |--------------------------------------------------------------------------
    */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milled run sheet ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | FIND RUN SHEET
    |--------------------------------------------------------------------------
    */

    const runSheet =
      await MilledRunSheet.findById(id);

    if (!runSheet) {
      return res.status(404).json({
        success: false,
        message: "Milled run sheet not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | DELETE HISTORY
    |--------------------------------------------------------------------------
    |
    | Remove stock history belonging to this run sheet.
    |
    |--------------------------------------------------------------------------
    */

    await MilledRunSheetStockMovement.deleteMany({
      milledRunSheet: id,
    });

    /*
    |--------------------------------------------------------------------------
    | DELETE RUN SHEET
    |--------------------------------------------------------------------------
    */

    await MilledRunSheet.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Milled run sheet deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE MILLED RUN SHEET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete milled run sheet.",
      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

