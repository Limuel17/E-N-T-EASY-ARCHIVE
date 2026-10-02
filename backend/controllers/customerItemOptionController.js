import CustomerItemOption from "../models/CustomerItemOption.js";

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
// GET ALL OPTIONS
//
// GET /api/customer-item-options?category=product_type
// ============================================================

export const getCustomerItemOptions = async (req, res) => {
  try {
    const category = String(
      req.query.category || ""
    )
      .trim()
      .toLowerCase();

    // ----------------------------------------------------------
    // CATEGORY REQUIRED
    // ----------------------------------------------------------

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Option category is required.",
      });
    }

    // ----------------------------------------------------------
    // VALID CATEGORY
    // ----------------------------------------------------------

    const validCategories = [
      "product_type",
      "uom",
      "printing_type",
      "joint_type",
      "material_type",
      "paper_combination",
      "printing_plate",
      "ink_color",
      "dc_blade",
      "process_flow",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid option category.",
      });
    }

    // ----------------------------------------------------------
    // GET OPTIONS
    // ----------------------------------------------------------

    const options = await CustomerItemOption.find({
      category,
    }).sort({
      name: 1,
    });

    return res.status(200).json({
      success: true,
      options,
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER ITEM OPTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer item options.",
    });
  }
};

// ============================================================
// ADD OPTION
//
// POST /api/customer-item-options
//
// Body:
// {
//   category: "product_type",
//   name: "RSC"
// }
// ============================================================

export const createCustomerItemOption = async (
  req,
  res
) => {
  try {
    const category = String(
      req.body.category || ""
    )
      .trim()
      .toLowerCase();

    const name = String(
      req.body.name || ""
    ).trim();

    // ----------------------------------------------------------
    // REQUIRED NAME
    // ----------------------------------------------------------

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Option name is required.",
      });
    }

    // ----------------------------------------------------------
    // VALID CATEGORY
    // ----------------------------------------------------------

    const validCategories = [
      "product_type",
      "uom",
      "printing_type",
      "joint_type",
      "material_type",
      "paper_combination",
      "printing_plate",
      "ink_color",
      "dc_blade",
      "process_flow",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid option category.",
      });
    }

    // ----------------------------------------------------------
    // CHECK DUPLICATE
    // Case-insensitive
    // ----------------------------------------------------------

    const existingOption =
      await CustomerItemOption.findOne({
        category,
        name: {
          $regex: `^${escapeRegex(name)}$`,
          $options: "i",
        },
      });

    if (existingOption) {
      return res.status(409).json({
        success: false,
        message: `"${name}" already exists.`,
      });
    }

    // ----------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------

    const option =
      await CustomerItemOption.create({
        category,
        name,
      });

    return res.status(201).json({
      success: true,
      message: "Customer item option added successfully.",
      option,
    });
  } catch (error) {
    console.error(
      "CREATE CUSTOMER ITEM OPTION ERROR:",
      error
    );

    // ----------------------------------------------------------
    // DUPLICATE KEY
    // ----------------------------------------------------------

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This option already exists.",
      });
    }

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

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
      message: "Failed to add customer item option.",
    });
  }
};

// ============================================================
// UPDATE OPTION
//
// PUT /api/customer-item-options/:id
//
// Body:
// {
//   name: "RSC BOX"
// }
// ============================================================

export const updateCustomerItemOption = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const name = String(
      req.body.name || ""
    ).trim();

    // ----------------------------------------------------------
    // REQUIRED NAME
    // ----------------------------------------------------------

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Option name is required.",
      });
    }

    // ----------------------------------------------------------
    // FIND OPTION
    // ----------------------------------------------------------

    const option =
      await CustomerItemOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Customer item option not found.",
      });
    }

    // ----------------------------------------------------------
    // CHECK DUPLICATE
    // ----------------------------------------------------------

    const duplicate =
      await CustomerItemOption.findOne({
        _id: {
          $ne: id,
        },

        category: option.category,

        name: {
          $regex: `^${escapeRegex(name)}$`,
          $options: "i",
        },
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `"${name}" already exists.`,
      });
    }

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    option.name = name;

    await option.save();

    return res.status(200).json({
      success: true,
      message:
        "Customer item option updated successfully.",
      option,
    });
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER ITEM OPTION ERROR:",
      error
    );

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This option already exists.",
      });
    }

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
        "Failed to update customer item option.",
    });
  }
};

// ============================================================
// DELETE OPTION
//
// DELETE /api/customer-item-options/:id
// ============================================================

export const deleteCustomerItemOption = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    // ----------------------------------------------------------
    // FIND OPTION
    // ----------------------------------------------------------

    const option =
      await CustomerItemOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message:
          "Customer item option not found.",
      });
    }

    // ----------------------------------------------------------
    // DELETE
    // ----------------------------------------------------------

    await CustomerItemOption.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Customer item option deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CUSTOMER ITEM OPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete customer item option.",
    });
  }
};