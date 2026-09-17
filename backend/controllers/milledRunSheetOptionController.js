import MilledRunSheetOption from "../models/MilledRunSheetOption.js";

// ============================================
// DEFAULT OPTIONS
// ============================================

const DEFAULT_OPTIONS = {
  type: [
    "Kraft",
    "Test Liner",
    "Fluting",
    "White Top",
    "Duplex",
  ],

  "paper-combination": [
    "2-Ply",
    "3-Ply",
    "5-Ply",
    "7-Ply",
  ],
};

// ============================================
// ESCAPE REGEX
// ============================================

const escapeRegex = (value) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

// ============================================
// SEED DEFAULT OPTIONS
// ============================================

const seedDefaultOptions = async () => {
  for (const category of Object.keys(DEFAULT_OPTIONS)) {
    const options = DEFAULT_OPTIONS[category];

    for (const name of options) {
      await MilledRunSheetOption.updateOne(
        {
          category,
          name,
        },
        {
          $setOnInsert: {
            category,
            name,
            isActive: true,
          },
        },
        {
          upsert: true,
        }
      );
    }
  }
};

// ============================================
// GET OPTIONS
// GET /api/milled-run-sheet-options
// ============================================

export const getMilledRunSheetOptions = async (req, res) => {
  try {
    await seedDefaultOptions();

    const options = await MilledRunSheetOption.find({
      isActive: true,
    }).sort({
      category: 1,
      name: 1,
    });

    const types = options
      .filter((option) => option.category === "type")
      .map((option) => ({
        _id: option._id,
        name: option.name,
      }));

    const paperCombinations = options
      .filter(
        (option) =>
          option.category === "paper-combination"
      )
      .map((option) => ({
        _id: option._id,
        name: option.name,
      }));

    return res.status(200).json({
      success: true,
      types,
      paperCombinations,
    });
  } catch (error) {
    console.error(
      "GET MILLED RUN SHEET OPTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load milled run sheet options.",
    });
  }
};

// ============================================
// CREATE OPTION
// POST /api/milled-run-sheet-options
// ============================================

export const createMilledRunSheetOption = async (req, res) => {
  try {
    const { category, name } = req.body;

    // Validate category
    if (
      !category ||
      !["type", "paper-combination"].includes(category)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid category and name are required.",
      });
    }

    // Validate name
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Option name is required.",
      });
    }

    // Check duplicate, case-insensitive
    const escapedName = escapeRegex(cleanName);

    const existing =
      await MilledRunSheetOption.findOne({
        category,
        name: {
          $regex: `^${escapedName}$`,
          $options: "i",
        },
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This option already exists.",
      });
    }

    // Create option
    const option =
      await MilledRunSheetOption.create({
        category,
        name: cleanName,
        isActive: true,
      });

    return res.status(201).json({
      success: true,
      message: "Option added successfully.",
      option,
    });
  } catch (error) {
    console.error(
      "CREATE MILLED RUN SHEET OPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add option.",
    });
  }
};

// ============================================
// UPDATE OPTION
// PUT /api/milled-run-sheet-options/:id
// ============================================

export const updateMilledRunSheetOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate name
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Option name is required.",
      });
    }

    // Find option
    const option =
      await MilledRunSheetOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Option not found.",
      });
    }

    // Check duplicate within same category
    const escapedName = escapeRegex(cleanName);

    const duplicate =
      await MilledRunSheetOption.findOne({
        _id: {
          $ne: id,
        },

        category: option.category,

        name: {
          $regex: `^${escapedName}$`,
          $options: "i",
        },

        isActive: true,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "This option already exists.",
      });
    }

    // Update
    option.name = cleanName;

    await option.save();

    return res.status(200).json({
      success: true,
      message: "Option updated successfully.",
      option,
    });
  } catch (error) {
    console.error(
      "UPDATE MILLED RUN SHEET OPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update option.",
    });
  }
};

// ============================================
// DELETE OPTION
// DELETE /api/milled-run-sheet-options/:id
// ============================================

export const deleteMilledRunSheetOption = async (req, res) => {
  try {
    const { id } = req.params;

    // Find option
    const option =
      await MilledRunSheetOption.findById(id);

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Option not found.",
      });
    }

    // Count active options in category
    const count =
      await MilledRunSheetOption.countDocuments({
        category: option.category,
        isActive: true,
      });

    // Do not allow deleting the last option
    if (count <= 1) {
      return res.status(400).json({
        success: false,
        message:
          "At least one option must remain.",
      });
    }

    // Soft delete
    option.isActive = false;

    await option.save();

    return res.status(200).json({
      success: true,
      message: "Option deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE MILLED RUN SHEET OPTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete option.",
    });
  }
};