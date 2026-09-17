import FactoryCardOption from "../models/FactoryCardOption.js";

const defaultTypes = [
  "RSC",
  "Pad",
  "Other",
];

export const seedFactoryCardOptions = async () => {
  try {
    for (const name of defaultTypes) {
      const exists =
        await FactoryCardOption.findOne({
          category: "type",
          name: {
            $regex: `^${escapeRegex(name)}$`,
            $options: "i",
          },
        });

      if (!exists) {
        await FactoryCardOption.create({
          category: "type",
          name,
        });

        console.log(
          `Factory Card type created: ${name}`
        );
      }
    }

    console.log(
      "Factory Card type seed completed."
    );
  } catch (error) {
    console.error(
      "FACTORY CARD OPTION SEED ERROR:",
      error
    );
  }
};

const escapeRegex = (value) => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};