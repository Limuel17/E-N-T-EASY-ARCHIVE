import mongoose from "mongoose";

import MilledRunSheet from "../models/MilledRunSheet.js";
import MilledRunSheetStockMovement from "../models/MilledRunSheetStockMovement.js";

/*
|--------------------------------------------------------------------------
| ADD STOCK
|--------------------------------------------------------------------------
*/
export const addMilledRunSheetStock = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { quantity, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milled run sheet ID.",
      });
    }

    const numericQuantity = Number(quantity);

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity must be greater than 0.",
      });
    }

    const updatedRunSheet =
      await MilledRunSheet.findOneAndUpdate(
        {
          _id: id,
        },
        {
          $inc: {
            stock: numericQuantity,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedRunSheet) {
      return res.status(404).json({
        success: false,
        message:
          "Milled run sheet not found.",
      });
    }

    const movement =
      await MilledRunSheetStockMovement.create({
        milledRunSheet:
          updatedRunSheet._id,

        action: "add",

        quantity: numericQuantity,

        balanceAfter:
          updatedRunSheet.stock,

        remarks:
          remarks?.trim() || "",

        performedBy:
          req.user._id,
      });

    const populatedMovement =
      await MilledRunSheetStockMovement.findById(
        movement._id
      ).populate(
        "performedBy",
        "name email position role"
      );

    return res.status(200).json({
      success: true,
      message:
        "Stock added successfully.",
      stock: updatedRunSheet.stock,
      movement: populatedMovement,
    });
  } catch (error) {
    console.error(
      "ADD MILLED RUN SHEET STOCK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add stock.",
      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| REMOVE STOCK
|--------------------------------------------------------------------------
|
| Stock can NEVER become negative.
|
|--------------------------------------------------------------------------
*/
export const removeMilledRunSheetStock = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { quantity, remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid milled run sheet ID.",
      });
    }

    const numericQuantity = Number(quantity);

    if (
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Stock quantity must be greater than 0.",
      });
    }

    const updatedRunSheet =
      await MilledRunSheet.findOneAndUpdate(
        {
          _id: id,
          stock: {
            $gte: numericQuantity,
          },
        },
        {
          $inc: {
            stock: -numericQuantity,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedRunSheet) {
      const runSheet =
        await MilledRunSheet.findById(id);

      if (!runSheet) {
        return res.status(404).json({
          success: false,
          message:
            "Milled run sheet not found.",
        });
      }

      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock: ${
          runSheet.stock || 0
        }.`,
      });
    }

    const movement =
      await MilledRunSheetStockMovement.create({
        milledRunSheet:
          updatedRunSheet._id,

        action: "remove",

        quantity: numericQuantity,

        balanceAfter:
          updatedRunSheet.stock,

        remarks:
          remarks?.trim() || "",

        performedBy:
          req.user._id,
      });

    const populatedMovement =
      await MilledRunSheetStockMovement.findById(
        movement._id
      ).populate(
        "performedBy",
        "name email position role"
      );

    return res.status(200).json({
      success: true,
      message:
        "Stock removed successfully.",
      stock: updatedRunSheet.stock,
      movement: populatedMovement,
    });
  } catch (error) {
    console.error(
      "REMOVE MILLED RUN SHEET STOCK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to remove stock.",
      error:
        error?.message ||
        "Unknown server error.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET STOCK HISTORY
|--------------------------------------------------------------------------
*/
export const getMilledRunSheetStockHistory =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid milled run sheet ID.",
        });
      }

      const runSheet =
        await MilledRunSheet.findById(id);

      if (!runSheet) {
        return res.status(404).json({
          success: false,
          message:
            "Milled run sheet not found.",
        });
      }

      const movements =
        await MilledRunSheetStockMovement.find({
          milledRunSheet: id,
        })
          .populate(
            "performedBy",
            "name email position role"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        stock: runSheet.stock || 0,
        count: movements.length,
        movements,
      });
    } catch (error) {
      console.error(
        "GET MILLED RUN SHEET STOCK HISTORY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch stock history.",
        error:
          error?.message ||
          "Unknown server error.",
      });
    }
  };