import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  MdAdd,
  MdClose,
  MdDeleteOutline,
  MdInventory2,
  MdSettings,
} from "react-icons/md";

import useAlert from "../../../context/useAlert.jsx";

const OPTIONS_URL = "/api/customer-item-options";

// ============================================================
// DEFAULT OPTIONS
// ============================================================

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

// ============================================================
// INITIAL DATA
// ============================================================

const createEmptyOperation = (step = 1) => ({
  step,
  processFlow: "",
  remarks: "",
});

const createInitialForm = () => ({
  productType: "",
  name: "",
  description: "",
  uom: "PC",

  widthMM: "",
  lengthMM: "",

  printingType: "",
  jointType: "",

  materialType: "",
  paperCombination: "",
  fluteTest: "",
  boardSize: "",

  printingPlate: "",
  inksColor: "",
  dcBlade: "",

  operations: [
    createEmptyOperation(1),
  ],
});

// ============================================================
// AUTH
// ============================================================

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============================================================
// HELPERS
// ============================================================

const mmToInches = (value) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return "";
  }

  return (number / 25.4).toFixed(2);
};

const sortOptions = (options = []) => {
  return [...options].sort((a, b) =>
    String(a).localeCompare(
      String(b),
      undefined,
      {
        numeric: true,
        sensitivity: "base",
      }
    )
  );
};

// ============================================================
// MODAL CUSTOMER ITEM
// ============================================================

const ModalCustomerItem = ({
  isOpen,
  onClose,
  customerId,
  onSaved,
  editItem = null,
}) => {
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState(
    createInitialForm()
  );

  const [options, setOptions] = useState(
    DEFAULT_OPTIONS
  );

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [manageCategory, setManageCategory] =
    useState(null);

  const [newOption, setNewOption] =
    useState("");

  const [optionSaving, setOptionSaving] =
    useState(false);

  const [optionDeleting, setOptionDeleting] =
    useState("");

  const isEditMode = Boolean(editItem);

  // ==========================================================
  // LOAD OPTIONS
  // ==========================================================

  const loadOptions = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setLoadingOptions(true);

      const response = await axios.get(
        OPTIONS_URL,
        getAuthConfig()
      );

      const data = response.data;

      // ------------------------------------------------------
      // GROUPED API RESPONSE
      // ------------------------------------------------------

      if (data?.options) {
        setOptions((previous) => ({
          ...previous,
          ...data.options,
        }));

        return;
      }

      // ------------------------------------------------------
      // ARRAY API RESPONSE
      // ------------------------------------------------------

      if (Array.isArray(data)) {
        const grouped = {
          ...DEFAULT_OPTIONS,
        };

        data.forEach((item) => {
          const category = String(
            item.category || ""
          )
            .trim()
            .toLowerCase();

          if (!grouped[category]) {
            grouped[category] = [];
          }

          grouped[category].push(item.name);
        });

        setOptions(grouped);
      }
    } catch (error) {
      console.error(
        "FAILED TO LOAD CUSTOMER ITEM OPTIONS:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "warning",
        "Options",
        "Some item options could not be loaded. Default options will be used."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, [showAlert]);

  // ==========================================================
  // INITIALIZE MODAL
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const initializeModal = async () => {
      await loadOptions();

      if (editItem) {
        setFormData({
          productType:
            editItem.productType || "",

          name:
            editItem.name || "",

          description:
            editItem.description || "",

          uom:
            editItem.uom || "PC",

          widthMM:
            editItem.widthMM ?? "",

          lengthMM:
            editItem.lengthMM ?? "",

          printingType:
            editItem.printingType || "",

          jointType:
            editItem.jointType || "",

          materialType:
            editItem.materialSpecification?.type ||
            "",

          paperCombination:
            editItem.materialSpecification
              ?.paperCombination || "",

          fluteTest:
            editItem.materialSpecification
              ?.fluteTest || "",

          boardSize:
            editItem.materialSpecification
              ?.boardSize || "",

          printingPlate:
            editItem.productionTools
              ?.printingPlate || "",

          inksColor:
            editItem.productionTools
              ?.inksColor || "",

          dcBlade:
            editItem.productionTools
              ?.dcBlade || "",

          operations:
            Array.isArray(editItem.operations) &&
            editItem.operations.length > 0
              ? editItem.operations.map(
                  (operation, index) => ({
                    step:
                      operation.step ||
                      index + 1,

                    processFlow:
                      operation.processFlow ||
                      "",

                    remarks:
                      operation.remarks ||
                      "",
                  })
                )
              : [
                  createEmptyOperation(1),
                ],
        });

        return;
      }

      setFormData(createInitialForm());
    };

    void initializeModal();
  }, [
    isOpen,
    editItem,
    loadOptions,
  ]);

  // ==========================================================
  // OPTIONS
  // ==========================================================

  const getOptions = (category) => {
    return sortOptions(
      options[category] || []
    );
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // PRINTING TYPE
  // ==========================================================

  const handlePrintingTypeChange = (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,

      printingType: value,

      printingPlate:
        value === "Plain"
          ? ""
          : previous.printingPlate,

      inksColor:
        value === "Plain"
          ? ""
          : previous.inksColor,
    }));
  };

  const isPlainPrinting =
    formData.printingType === "Plain";

  // ==========================================================
  // DIMENSIONS
  // ==========================================================

  const widthInches = useMemo(
    () => mmToInches(formData.widthMM),
    [formData.widthMM]
  );

  const lengthInches = useMemo(
    () => mmToInches(formData.lengthMM),
    [formData.lengthMM]
  );

  // ==========================================================
  // OPERATIONS
  // ==========================================================

  const handleOperationChange = (
    index,
    field,
    value
  ) => {
    setFormData((previous) => {
      const operations = [
        ...previous.operations,
      ];

      operations[index] = {
        ...operations[index],
        [field]:
          field === "step"
            ? Number(value)
            : value,
      };

      return {
        ...previous,
        operations,
      };
    });
  };

  const handleAddOperation = () => {
    setFormData((previous) => ({
      ...previous,

      operations: [
        ...previous.operations,

        createEmptyOperation(
          previous.operations.length + 1
        ),
      ],
    }));
  };

  const handleRemoveOperation = (index) => {
    setFormData((previous) => {
      if (previous.operations.length <= 1) {
        return previous;
      }

      const operations =
        previous.operations.filter(
          (_, operationIndex) =>
            operationIndex !== index
        );

      return {
        ...previous,

        operations: operations.map(
          (
            operation,
            operationIndex
          ) => ({
            ...operation,
            step: operationIndex + 1,
          })
        ),
      };
    });
  };

  // ==========================================================
  // MANAGE OPTIONS
  // ==========================================================

  const openManageOptions = (category) => {
    setManageCategory(category);
    setNewOption("");
  };

  const closeManageOptions = () => {
    if (
      optionSaving ||
      optionDeleting
    ) {
      return;
    }

    setManageCategory(null);
    setNewOption("");
  };

  // ==========================================================
  // ADD OPTION
  // ==========================================================

  const handleAddOption = async () => {
    const value = newOption.trim();

    if (!value) {
      showAlert(
        "warning",
        "Missing Option",
        "Please enter an option name."
      );

      return;
    }

    if (!manageCategory) {
      return;
    }

    const existingOptions =
      getOptions(manageCategory);

    const alreadyExists =
      existingOptions.some(
        (option) =>
          String(option).toLowerCase() ===
          value.toLowerCase()
      );

    if (alreadyExists) {
      showAlert(
        "warning",
        "Duplicate Option",
        "This option already exists."
      );

      return;
    }

    try {
      setOptionSaving(true);

      const response =
        await axios.post(
          OPTIONS_URL,
          {
            category: manageCategory,
            name: value,
          },
          getAuthConfig()
        );

      const createdOption =
        response.data?.option;

      const createdName =
        createdOption?.name || value;

      setOptions((previous) => ({
        ...previous,

        [manageCategory]: [
          ...(previous[manageCategory] || []),
          createdName,
        ],
      }));

      setNewOption("");

      showAlert(
        "success",
        "Option Added",
        `"${createdName}" has been added successfully.`
      );
    } catch (error) {
      console.error(
        "FAILED TO ADD OPTION:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",
        "Add Option Failed",
        error.response?.data?.message ||
          "Failed to add option."
      );
    } finally {
      setOptionSaving(false);
    }
  };

  // ==========================================================
  // DELETE OPTION
  // ==========================================================

  const handleDeleteOption = async (
    option
  ) => {
    if (!manageCategory) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${option}" from this option list?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setOptionDeleting(option);

      // ------------------------------------------------------
      // GET SERVER OPTIONS
      // ------------------------------------------------------

      const response =
        await axios.get(
          `${OPTIONS_URL}?category=${encodeURIComponent(
            manageCategory
          )}`,
          getAuthConfig()
        );

      const serverOptions =
        Array.isArray(
          response.data?.options
        )
          ? response.data.options
          : Array.isArray(response.data)
          ? response.data
          : [];

      const matchedOption =
        serverOptions.find(
          (item) =>
            String(item.name || "")
              .toLowerCase() ===
            String(option).toLowerCase()
        );

      if (!matchedOption?._id) {
        throw new Error(
          "Option ID could not be found."
        );
      }

      // ------------------------------------------------------
      // DELETE OPTION
      // ------------------------------------------------------

      await axios.delete(
        `${OPTIONS_URL}/${matchedOption._id}`,
        getAuthConfig()
      );

      // ------------------------------------------------------
      // UPDATE LOCAL OPTIONS
      // ------------------------------------------------------

      setOptions((previous) => ({
        ...previous,

        [manageCategory]: (
          previous[manageCategory] || []
        ).filter(
          (item) =>
            String(item).toLowerCase() !==
            String(option).toLowerCase()
        ),
      }));

      // ------------------------------------------------------
      // CLEAR SELECTED FORM VALUE
      // ------------------------------------------------------

      setFormData((previous) => {
        const fieldsByCategory = {
          product_type: "productType",
          uom: "uom",
          printing_type: "printingType",
          joint_type: "jointType",
          material_type: "materialType",
          paper_combination:
            "paperCombination",
          printing_plate:
            "printingPlate",
          ink_color: "inksColor",
          dc_blade: "dcBlade",
        };

        const field =
          fieldsByCategory[manageCategory];

        if (
          field &&
          previous[field] === option
        ) {
          return {
            ...previous,
            [field]: "",
          };
        }

        return previous;
      });

      showAlert(
        "success",
        "Option Deleted",
        `"${option}" has been deleted successfully.`
      );
    } catch (error) {
      console.error(
        "FAILED TO DELETE OPTION:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",
        "Delete Option Failed",
        error.response?.data?.message ||
          "Failed to delete option."
      );
    } finally {
      setOptionDeleting("");
    }
  };

  // ==========================================================
  // SAVE ITEM
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );

      return;
    }

    if (!customerId) {
      showAlert(
        "error",
        "Customer Missing",
        "Customer information could not be identified."
      );

      return;
    }

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!formData.productType.trim()) {
      showAlert(
        "warning",
        "Missing Product Type",
        "Please select a product type."
      );

      return;
    }

    if (!formData.name.trim()) {
      showAlert(
        "warning",
        "Missing Item Name",
        "Please enter the item name."
      );

      return;
    }

    if (
      formData.widthMM === "" ||
      Number(formData.widthMM) <= 0
    ) {
      showAlert(
        "warning",
        "Invalid Width",
        "Please enter a width greater than 0 MM."
      );

      return;
    }

    if (
      formData.lengthMM === "" ||
      Number(formData.lengthMM) <= 0
    ) {
      showAlert(
        "warning",
        "Invalid Length",
        "Please enter a length greater than 0 MM."
      );

      return;
    }

    if (!formData.printingType.trim()) {
      showAlert(
        "warning",
        "Missing Printing Type",
        "Please select a printing type."
      );

      return;
    }

    try {
      setSaving(true);

      // ------------------------------------------------------
      // CLEAN OPERATIONS
      // ------------------------------------------------------

      const cleanedOperations =
        formData.operations
          .map(
            (operation, index) => ({
              step: index + 1,

              processFlow:
                String(
                  operation.processFlow || ""
                ).trim(),

              remarks:
                String(
                  operation.remarks || ""
                ).trim(),
            })
          )
          .filter(
            (operation) =>
              operation.processFlow ||
              operation.remarks
          );

      // ------------------------------------------------------
      // PAYLOAD
      // ------------------------------------------------------

      const payload = {
        productType:
          formData.productType.trim(),

        name:
          formData.name.trim(),

        description:
          formData.description.trim(),

        uom:
          formData.uom.trim(),

        widthMM:
          Number(formData.widthMM),

        lengthMM:
          Number(formData.lengthMM),

        printingType:
          formData.printingType.trim(),

        jointType:
          formData.jointType.trim(),

        materialSpecification: {
          type:
            formData.materialType.trim(),

          paperCombination:
            formData.paperCombination.trim(),

          fluteTest:
            formData.fluteTest.trim(),

          boardSize:
            formData.boardSize.trim(),
        },

        productionTools: {
          printingPlate:
            isPlainPrinting
              ? ""
              : formData.printingPlate.trim(),

          inksColor:
            isPlainPrinting
              ? ""
              : formData.inksColor.trim(),

          dcBlade:
            formData.dcBlade.trim(),
        },

        operations:
          cleanedOperations,
      };

      // ------------------------------------------------------
      // URL + METHOD
      // ------------------------------------------------------

      const url = isEditMode
        ? `/api/customer-items/${editItem._id}`
        : `/api/customer-items/customer/${customerId}`;

      const method = isEditMode
        ? "put"
        : "post";

      // ------------------------------------------------------
      // SAVE
      // ------------------------------------------------------

      const response =
        await axios[method](
          url,
          payload,
          getAuthConfig()
        );

      const savedItem =
        response.data?.item ||
        response.data?.customerItem ||
        null;

      // ------------------------------------------------------
      // SUCCESS ALERT
      // ------------------------------------------------------

      showAlert(
        "success",

        isEditMode
          ? "Item Updated"
          : "Item Created",

        isEditMode
          ? "Customer item has been updated successfully."
          : savedItem?.code
          ? `Customer item ${savedItem.code} has been created successfully.`
          : "Customer item has been created successfully."
      );

      // ------------------------------------------------------
      // REFRESH TABLES
      // ------------------------------------------------------

      window.dispatchEvent(
        new CustomEvent(
          "customer-item-saved"
        )
      );

      // ------------------------------------------------------
      // CALLBACK
      // ------------------------------------------------------

      onSaved?.(savedItem);

      // ------------------------------------------------------
      // RESET
      // ------------------------------------------------------

      setFormData(
        createInitialForm()
      );

      setManageCategory(null);

      onClose?.();
    } catch (error) {
      console.error(
        "FAILED TO SAVE CUSTOMER ITEM:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",

        isEditMode
          ? "Update Item Failed"
          : "Create Item Failed",

        error.response?.data?.message ||
          "Failed to save customer item."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const handleModalClose = () => {
    if (saving) {
      return;
    }

    if (manageCategory) {
      closeManageOptions();
      return;
    }

    onClose?.();
  };

  // ==========================================================
  // OPTION LABELS
  // ==========================================================

  const optionLabels = {
    product_type: "Product Type",
    uom: "UOM",
    printing_type: "Printing Type",
    joint_type: "Joint Type",
    material_type: "Material Type",
    paper_combination: "Paper Combination",
    printing_plate: "Printing Plate",
    ink_color: "Ink Color",
    dc_blade: "DC Blade",
    process_flow: "Process Flow",
  };

  // ==========================================================
  // MODAL VISIBILITY
  // ==========================================================

  if (!isOpen) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <MdInventory2 className="text-xl" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900">
                {isEditMode
                  ? "Edit Customer Item"
                  : "Add Customer Item"}
              </h2>

              <p className="truncate text-xs text-gray-500">
                {isEditMode
                  ? "Update item information"
                  : "Create a new item for this customer"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            disabled={saving}
            className="shrink-0 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-6 p-5">
            {/* ==================================================
                PRODUCT INFORMATION
            ================================================== */}

            <FormSection
              title="Product Information"
              description="Basic information about the customer item"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <ManageSelect
                  label="Product Type"
                  value={formData.productType}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      productType:
                        event.target.value,
                    }))
                  }
                  options={getOptions(
                    "product_type"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "product_type"
                    )
                  }
                  required
                  disabled={loadingOptions}
                />

                <FormInput
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  required
                />

                <div className="md:col-span-2">
                  <FormTextarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter item description"
                  />
                </div>

                <ManageSelect
                  label="UOM"
                  value={formData.uom}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      uom:
                        event.target.value,
                    }))
                  }
                  options={getOptions("uom")}
                  onManage={() =>
                    openManageOptions("uom")
                  }
                  disabled={loadingOptions}
                />

                <div />

                <DimensionInput
                  label="Width"
                  value={formData.widthMM}
                  inches={widthInches}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      widthMM:
                        event.target.value,
                    }))
                  }
                  required
                />

                <DimensionInput
                  label="Length"
                  value={formData.lengthMM}
                  inches={lengthInches}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      lengthMM:
                        event.target.value,
                    }))
                  }
                  required
                />
              </div>
            </FormSection>

            {/* ==================================================
                PRINTING
            ================================================== */}

            <FormSection
              title="Printing"
              description="Printing and joint specifications"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <ManageSelect
                  label="Printing Type"
                  value={formData.printingType}
                  onChange={
                    handlePrintingTypeChange
                  }
                  options={getOptions(
                    "printing_type"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "printing_type"
                    )
                  }
                  required
                  disabled={loadingOptions}
                />

                <ManageSelect
                  label="Joint Type"
                  value={formData.jointType}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      jointType:
                        event.target.value,
                    }))
                  }
                  options={getOptions(
                    "joint_type"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "joint_type"
                    )
                  }
                  disabled={loadingOptions}
                />
              </div>
            </FormSection>

            {/* ==================================================
                MATERIAL SPECIFICATION
            ================================================== */}

            <FormSection
              title="Material Specification"
              description="Paper and board material details"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <ManageSelect
                  label="Type"
                  value={formData.materialType}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      materialType:
                        event.target.value,
                    }))
                  }
                  options={getOptions(
                    "material_type"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "material_type"
                    )
                  }
                  disabled={loadingOptions}
                />

                <ManageSelect
                  label="Paper Combination"
                  value={
                    formData.paperCombination
                  }
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      paperCombination:
                        event.target.value,
                    }))
                  }
                  options={getOptions(
                    "paper_combination"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "paper_combination"
                    )
                  }
                  disabled={loadingOptions}
                />

                <FormInput
                  label="Flute / Test"
                  name="fluteTest"
                  value={formData.fluteTest}
                  onChange={handleChange}
                  placeholder="Enter flute / test specification"
                />

                <FormInput
                  label="Board Size"
                  name="boardSize"
                  value={formData.boardSize}
                  onChange={handleChange}
                  placeholder="Enter board size"
                />
              </div>
            </FormSection>

            {/* ==================================================
                PRODUCTION TOOLS
            ================================================== */}

            <FormSection
              title="Production Tools"
              description="Printing and production tool information"
            >
              <div className="grid gap-5 md:grid-cols-2">
                {!isPlainPrinting && (
                  <>
                    <ManageSelect
                      label="Printing Plate / Location"
                      value={
                        formData.printingPlate
                      }
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          printingPlate:
                            event.target.value,
                        }))
                      }
                      options={getOptions(
                        "printing_plate"
                      )}
                      onManage={() =>
                        openManageOptions(
                          "printing_plate"
                        )
                      }
                      disabled={loadingOptions}
                    />

                    <ManageSelect
                      label="Paints / Inks Color"
                      value={
                        formData.inksColor
                      }
                      onChange={(event) =>
                        setFormData((previous) => ({
                          ...previous,
                          inksColor:
                            event.target.value,
                        }))
                      }
                      options={getOptions(
                        "ink_color"
                      )}
                      onManage={() =>
                        openManageOptions(
                          "ink_color"
                        )
                      }
                      disabled={loadingOptions}
                    />
                  </>
                )}

                <ManageSelect
                  label="DC Blade / Location Test"
                  value={formData.dcBlade}
                  onChange={(event) =>
                    setFormData((previous) => ({
                      ...previous,
                      dcBlade:
                        event.target.value,
                    }))
                  }
                  options={getOptions(
                    "dc_blade"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "dc_blade"
                    )
                  }
                  disabled={loadingOptions}
                />
              </div>

              {isPlainPrinting && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                  Plain printing selected.
                  Printing Plate and Paints /
                  Inks Color are not required.
                </div>
              )}
            </FormSection>

            {/* ==================================================
                OPERATIONS
            ================================================== */}

            <FormSection
              title="Operations / Process Flow"
              description="Define the production process sequence"
              action={
                <button
                  type="button"
                  onClick={handleAddOperation}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <MdAdd className="text-base" />
                  Add Step
                </button>
              }
            >
              <div className="space-y-3">
                {formData.operations.map(
                  (operation, index) => (
                    <div
                      key={`operation-${index}`}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                            {index + 1}
                          </span>

                          <span className="text-sm font-semibold text-gray-700">
                            Process Step{" "}
                            {index + 1}
                          </span>
                        </div>

                        {formData.operations
                          .length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveOperation(
                                index
                              )
                            }
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            aria-label={`Remove process step ${
                              index + 1
                            }`}
                          >
                            <MdDeleteOutline className="text-lg" />
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
                        <FormInput
                          label="Step"
                          type="number"
                          min="1"
                          value={operation.step}
                          onChange={(event) =>
                            handleOperationChange(
                              index,
                              "step",
                              event.target.value
                            )
                          }
                        />

                        <ManageSelect
                          label="Process Flow"
                          value={
                            operation.processFlow
                          }
                          onChange={(event) =>
                            handleOperationChange(
                              index,
                              "processFlow",
                              event.target.value
                            )
                          }
                          options={getOptions(
                            "process_flow"
                          )}
                          onManage={() =>
                            openManageOptions(
                              "process_flow"
                            )
                          }
                          disabled={
                            loadingOptions
                          }
                        />

                        <FormInput
                          label="Remarks"
                          value={
                            operation.remarks
                          }
                          onChange={(event) =>
                            handleOperationChange(
                              index,
                              "remarks",
                              event.target.value
                            )
                          }
                          placeholder="Enter remarks"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </FormSection>
          </div>

          {/* ====================================================
              FOOTER
          ==================================================== */}

          <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Save Item"}
            </button>
          </div>
        </form>

        {/* ======================================================
            MANAGE OPTIONS MODAL
        ====================================================== */}

        {manageCategory && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* ==================================================
                  MANAGE HEADER
              ================================================== */}

              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <MdSettings className="text-lg" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Manage{" "}
                      {
                        optionLabels[
                          manageCategory
                        ]
                      }
                    </h3>

                    <p className="text-xs text-gray-500">
                      Add or delete available options
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeManageOptions}
                  disabled={
                    optionSaving ||
                    Boolean(optionDeleting)
                  }
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
                  aria-label="Close"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>

              {/* ==================================================
                  MANAGE CONTENT
              ================================================== */}

              <div className="space-y-4 p-5">
                {/* ==================================================
                    ADD OPTION
                ================================================== */}

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                    Add New Option
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(event) =>
                        setNewOption(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          event.preventDefault();
                          void handleAddOption();
                        }
                      }}
                      placeholder={`Enter ${
                        optionLabels[
                          manageCategory
                        ]
                      }`}
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        void handleAddOption()
                      }
                      disabled={
                        optionSaving ||
                        !newOption.trim()
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdAdd className="text-lg" />
                      Add
                    </button>
                  </div>
                </div>

                {/* ==================================================
                    OPTION LIST
                ================================================== */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Available Options
                    </span>

                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-500">
                      {
                        getOptions(
                          manageCategory
                        ).length
                      }
                    </span>
                  </div>

                  <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200">
                    {getOptions(
                      manageCategory
                    ).length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-gray-400">
                        No options available.
                      </div>
                    ) : (
                      getOptions(
                        manageCategory
                      ).map((option) => (
                        <div
                          key={option}
                          className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-2.5 last:border-b-0 hover:bg-gray-50"
                        >
                          <span className="min-w-0 flex-1 wrap-break-words text-sm text-gray-700">
                            {option}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDeleteOption(
                                option
                              )
                            }
                            disabled={Boolean(
                              optionDeleting
                            )}
                            className="shrink-0 rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Delete ${option}`}
                          >
                            {optionDeleting ===
                            option ? (
                              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                            ) : (
                              <MdDeleteOutline className="text-lg" />
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* ==================================================
                  MANAGE FOOTER
              ================================================== */}

              <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-5 py-4">
                <button
                  type="button"
                  onClick={closeManageOptions}
                  disabled={
                    optionSaving ||
                    Boolean(optionDeleting)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// FORM SECTION
// ============================================================

const FormSection = ({
  title,
  description,
  children,
  action,
}) => (
  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>

        {description && (
          <p className="mt-0.5 text-xs text-gray-500">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>

    <div className="p-5">
      {children}
    </div>
  </section>
);

// ============================================================
// FORM INPUT
// ============================================================

const FormInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
  type = "text",
  min,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </span>

    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
    />
  </label>
);

// ============================================================
// FORM TEXTAREA
// ============================================================

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label}
    </span>

    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
    />
  </label>
);

// ============================================================
// MANAGE SELECT
// ============================================================

const ManageSelect = ({
  label,
  value,
  onChange,
  options,
  onManage,
  required = false,
  disabled = false,
}) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="text-xs font-semibold text-gray-600">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <button
        type="button"
        onClick={onManage}
        disabled={disabled}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 transition hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <MdSettings className="text-sm" />
        Manage Types
      </button>
    </div>

    <select
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
    >
      <option value="">
        Select {label}
      </option>

      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  </div>
);

// ============================================================
// DIMENSION INPUT
// ============================================================

const DimensionInput = ({
  label,
  value,
  inches,
  onChange,
  required = false,
}) => (
  <div>
    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="grid grid-cols-2 gap-2">
      {/* MM */}

      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={onChange}
          required={required}
          placeholder="MM"
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
          MM
        </span>
      </div>

      {/* INCHES */}

      <div className="relative">
        <input
          type="text"
          value={inches || ""}
          readOnly
          placeholder="Inches"
          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-2.5 pr-10 text-sm font-semibold text-gray-600 outline-none"
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
          IN
        </span>
      </div>
    </div>

    <p className="mt-1 text-[10px] text-gray-400">
      Enter measurement in millimeters.
      Inches are calculated automatically.
    </p>
  </div>
);

export default ModalCustomerItem;