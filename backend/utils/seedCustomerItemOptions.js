import CustomerItemOption from "../models/CustomerItemOption.js";

const DEFAULT_OPTIONS = {
  product_type: [
    "RSC",
    "PAD",
    "PARTITION",
    "DIECUT",
    "OTHER",
  ],

  uom: [
    "PC",
    "SET",
    "ROLL",
  ],

  printing_type: [
    "Flexo Printed",
    "Offset Printed",
    "Plain",
  ],

  joint_type: [
    "Glued",
    "Self Lock",
    "Stitched",
    "Tape",
    "None",
  ],

  material_type: [
    "KRAFT",
    "TEST LINER",
    "WHITE TOP",
    "FLUTING",
  ],

  paper_combination: [
    "3 PLY",
    "5 PLY",
    "7 PLY",
  ],

  printing_plate: [
    "Printing Plate 1",
    "Printing Plate 2",
  ],

  ink_color: [
    "Black",
    "Blue",
    "Red",
    "Yellow",
    "Green",
  ],

  dc_blade: [
    "DC Blade 1",
    "DC Blade 2",
  ],

  process_flow: [
    "Printing",
    "Die Cutting",
    "Slotting",
    "Folding",
    "Gluing",
    "Stitching",
    "Bundling",
    "Packing",
  ],
};

export const seedCustomerItemOptions = async () => {
  try {
    for (const [category, options] of Object.entries(
      DEFAULT_OPTIONS
    )) {
      for (const name of options) {
        await CustomerItemOption.updateOne(
          {
            category,
            name,
          },
          {
            $setOnInsert: {
              category,
              name,
            },
          },
          {
            upsert: true,
          }
        );
      }
    }

    console.log(
      "Customer Item options seed completed."
    );
  } catch (error) {
    console.error(
      "Customer Item options seed error:",
      error
    );
  }
};