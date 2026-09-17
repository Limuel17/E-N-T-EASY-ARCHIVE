import FactoryCardOption from "../models/FactoryCardOption.js";

// ============================================================
// GET ALL OPTIONS
// GET /api/factory-card-options
// ============================================================

export const getFactoryCardOptions = async (req, res) => {
  try {
    const { category = "type" } = req.query;

    const options = await FactoryCardOption.find({
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
      "GET FACTORY CARD OPTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch factory card options.",
    });
  }
};

// ============================================================
// ADD OPTION
// POST /api/factory-card-options
// ============================================================

export const createFactoryCardOption = async (req, res) => {
  try {
    const category = String(
      req.body.category || "type"
    )
      .trim()
      .toLowerCase();

    const name = String(req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Option name is required.",
      });
    }

    if (category !== "type") {
      return res.status(400).json({
        success: false,
        message: "Invalid option category.",
      });
    }

    const existingOption =
      await FactoryCardOption.findOne({
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

    const option = await FactoryCardOption.create({
      category,
      name,
    });

    return res.status(201).json({
      success: true,
      message: "Factory card type added successfully.",
      option,
    });
  } catch (error) {
    console.error(
      "CREATE FACTORY CARD OPTION ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This type already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add factory card type.",
    });
  }
};

// ============================================================
// UPDATE OPTION
// PUT /api/factory-card-options/:id
// ============================================================

export const updateFactoryCardOption = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const name = String(req.body.name || "").trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Option name is required.",
      });
    }

    const option =
      await FactoryCardOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Factory card type not found.",
      });
    }

    const duplicate =
      await FactoryCardOption.findOne({
        _id: { $ne: id },
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

    option.name = name;

    await option.save();

    return res.status(200).json({
      success: true,
      message: "Factory card type updated successfully.",
      option,
    });
  } catch (error) {
    console.error(
      "UPDATE FACTORY CARD OPTION ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This type already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update factory card type.",
    });
  }
};

// ============================================================
// DELETE OPTION
// DELETE /api/factory-card-options/:id
// ============================================================

export const deleteFactoryCardOption = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const option =
      await FactoryCardOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Factory card type not found.",
      });
    }

    await FactoryCardOption.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Factory card type deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE FACTORY CARD OPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete factory card type.",
    });
  }
};

// ============================================================
// ESCAPE REGEX
// ============================================================

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};