
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
  MdStraighten,
} from "react-icons/md";

import {
  FiBox,
  FiLayers,
  FiPrinter,
  FiTool,
  FiGitBranch,
} from "react-icons/fi";

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

const OPTION_LABELS = {
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

// ============================================================
// INITIAL FORM
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

  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  return (number / 25.4).toFixed(2);
};

const sortOptions = (options = []) =>
  [...options].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );

const normalizeOptions = (data) => {
  const grouped = Object.fromEntries(
    Object.entries(DEFAULT_OPTIONS).map(
      ([category, values]) => [
        category,
        [...values],
      ]
    )
  );

  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.options)
      ? data.options
      : null;

  if (items) {
    items.forEach((item) => {
      const category = String(
        item.category || ""
      )
        .trim()
        .toLowerCase();

      if (!category || !item.name) {
        return;
      }

      if (!grouped[category]) {
        grouped[category] = [];
      }

      const exists = grouped[category].some(
        (name) =>
          String(name).toLowerCase() ===
          String(item.name).toLowerCase()
      );

      if (!exists) {
        grouped[category].push(item.name);
      }
    });

    return grouped;
  }

  if (
    data?.options &&
    !Array.isArray(data.options)
  ) {
    return {
      ...grouped,
      ...data.options,
    };
  }

  return grouped;
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

  const isPlainPrinting =
    formData.printingType === "Plain";

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

      setOptions(
        normalizeOptions(response.data)
      );
    } catch (error) {
      console.error(
        "FAILED TO LOAD CUSTOMER ITEM OPTIONS:",
        error.response?.data || error.message
      );

      showAlert(
        "warning",
        "Options",
        "Some item options could not be loaded. Default options will be used."
      );

      setOptions(DEFAULT_OPTIONS);
    } finally {
      setLoadingOptions(false);
    }
  }, [showAlert]);

  // ==========================================================
  // INITIALIZE FORM
  // ==========================================================
  // React 19 ESLint:
  // State updates are scheduled outside the synchronous
  // effect body to avoid react-hooks/set-state-in-effect.
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const timer = setTimeout(() => {
      if (!editItem) {
        setFormData(createInitialForm());
        setManageCategory(null);
        setNewOption("");
        return;
      }

      setFormData({
        productType: editItem.productType || "",
        name: editItem.name || "",
        description: editItem.description || "",
        uom: editItem.uom || "PC",

        widthMM: editItem.widthMM ?? "",
        lengthMM: editItem.lengthMM ?? "",

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
                    operation.remarks || "",
                })
              )
            : [
                createEmptyOperation(1),
              ],
      });

      setManageCategory(null);
      setNewOption("");
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, editItem]);

  // ==========================================================
  // LOAD OPTIONS WHEN MODAL OPENS
  // ==========================================================

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const timer = setTimeout(() => {
      void loadOptions();
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen, loadOptions]);

  // ==========================================================
  // OPTIONS
  // ==========================================================

  const getOptions = (category) =>
    sortOptions(options[category] || []);

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

  const handleSelectChange = (
    field,
    value
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // PRINTING TYPE
  // ==========================================================

  const handlePrintingTypeChange = (
    event
  ) => {
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

  const handleRemoveOperation = (
    index
  ) => {
    setFormData((previous) => {
      if (previous.operations.length <= 1) {
        return previous;
      }

      const operations =
        previous.operations
          .filter(
            (_, operationIndex) =>
              operationIndex !== index
          )
          .map(
            (operation, operationIndex) => ({
              ...operation,
              step: operationIndex + 1,
            })
          );

      return {
        ...previous,
        operations,
      };
    });
  };

  // ==========================================================
  // MANAGE OPTIONS
  // ==========================================================

  const openManageOptions = (
    category
  ) => {
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

    const alreadyExists =
      getOptions(manageCategory).some(
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

      const createdName =
        response.data?.option?.name ||
        value;

      setOptions((previous) => ({
        ...previous,

        [manageCategory]: [
          ...(previous[
            manageCategory
          ] || []),
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
          : Array.isArray(
              response.data
            )
            ? response.data
            : [];

      const matchedOption =
        serverOptions.find(
          (item) =>
            String(
              item.name || ""
            ).toLowerCase() ===
            String(option).toLowerCase()
        );

      if (!matchedOption?._id) {
        throw new Error(
          "Option ID could not be found."
        );
      }

      await axios.delete(
        `${OPTIONS_URL}/${matchedOption._id}`,
        getAuthConfig()
      );

      setOptions((previous) => ({
        ...previous,

        [manageCategory]: (
          previous[
            manageCategory
          ] || []
        ).filter(
          (item) =>
            String(item).toLowerCase() !==
            String(option).toLowerCase()
        ),
      }));

      const fieldsByCategory = {
        product_type:
          "productType",

        uom:
          "uom",

        printing_type:
          "printingType",

        joint_type:
          "jointType",

        material_type:
          "materialType",

        paper_combination:
          "paperCombination",

        printing_plate:
          "printingPlate",

        ink_color:
          "inksColor",

        dc_blade:
          "dcBlade",

        process_flow:
          null,
      };

      const field =
        fieldsByCategory[
          manageCategory
        ];

      if (field) {
        setFormData((previous) =>
          previous[field] === option
            ? {
                ...previous,
                [field]: "",
              }
            : previous
        );
      }

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
          error.message ||
          "Failed to delete option."
      );
    } finally {
      setOptionDeleting("");
    }
  };

  // ==========================================================
  // SAVE ITEM
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {
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

    if (
      !formData.productType.trim()
    ) {
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
      !Number.isFinite(
        Number(formData.widthMM)
      ) ||
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
      !Number.isFinite(
        Number(formData.lengthMM)
      ) ||
      Number(formData.lengthMM) <= 0
    ) {
      showAlert(
        "warning",
        "Invalid Length",
        "Please enter a length greater than 0 MM."
      );
      return;
    }

    if (
      !formData.printingType.trim()
    ) {
      showAlert(
        "warning",
        "Missing Printing Type",
        "Please select a printing type."
      );
      return;
    }

    try {
      setSaving(true);

      const cleanedOperations =
        formData.operations
          .map(
            (operation, index) => ({
              step: index + 1,

              processFlow: String(
                operation.processFlow ||
                  ""
              ).trim(),

              remarks: String(
                operation.remarks || ""
              ).trim(),
            })
          )
          .filter(
            (operation) =>
              operation.processFlow ||
              operation.remarks
          );

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

      const url = isEditMode
        ? `/api/customer-items/${editItem._id}`
        : `/api/customer-items/customer/${customerId}`;

      const response = isEditMode
        ? await axios.put(
            url,
            payload,
            getAuthConfig()
          )
        : await axios.post(
            url,
            payload,
            getAuthConfig()
          );

      const savedItem =
        response.data?.item ||
        response.data?.customerItem ||
        null;

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

      window.dispatchEvent(
        new CustomEvent(
          "customer-item-saved"
        )
      );

      onSaved?.(savedItem);

      setFormData(
        createInitialForm()
      );

      setManageCategory(null);
      setNewOption("");

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

  if (!isOpen) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-3 backdrop-blur-sm sm:p-5">
      <div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="relative shrink-0 overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 px-5 py-5 text-white">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl ring-1 ring-white/20">
                <MdInventory2 />
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-indigo-100">
                    Customer Items
                  </span>

                  <span className="rounded-md bg-white px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-indigo-700">
                    {isEditMode
                      ? "Edit Mode"
                      : "New Item"}
                  </span>
                </div>

                <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                  {isEditMode
                    ? "Edit Customer Item"
                    : "Add Customer Item"}
                </h2>

                <p className="mt-0.5 text-xs text-indigo-100">
                  {isEditMode
                    ? "Update product information and specifications."
                    : "Create a new product for this customer."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleModalClose}
              disabled={saving}
              className="shrink-0 rounded-xl p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Close modal"
            >
              <MdClose className="text-2xl" />
            </button>
          </div>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-gray-50/60 p-4 sm:p-5">

            {/* ==================================================
                PRODUCT INFORMATION
            ================================================== */}

            <FormSection
              icon={<FiBox />}
              title="Product Information"
              description="Basic information and item dimensions."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ManageSelect
                  label="Product Type"
                  value={
                    formData.productType
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "productType",
                      event.target.value
                    )
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
                  disabled={
                    loadingOptions
                  }
                />

                <FormInput
                  label="Name"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter item name"
                  required
                />

                <div className="md:col-span-2">
                  <FormTextarea
                    label="Description"
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter item description"
                  />
                </div>

                <ManageSelect
                  label="UOM"
                  value={
                    formData.uom
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "uom",
                      event.target.value
                    )
                  }
                  options={getOptions(
                    "uom"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "uom"
                    )
                  }
                  disabled={
                    loadingOptions
                  }
                />

                <div className="hidden md:block" />

                <DimensionInput
                  label="Width"
                  value={
                    formData.widthMM
                  }
                  inches={
                    widthInches
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "widthMM",
                      event.target.value
                    )
                  }
                  required
                />

                <DimensionInput
                  label="Length"
                  value={
                    formData.lengthMM
                  }
                  inches={
                    lengthInches
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "lengthMM",
                      event.target.value
                    )
                  }
                  required
                />
              </div>
            </FormSection>

            {/* ==================================================
                PRINTING
            ================================================== */}

            <FormSection
              icon={<FiPrinter />}
              title="Printing & Joint"
              description="Printing method and joint specifications."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ManageSelect
                  label="Printing Type"
                  value={
                    formData.printingType
                  }
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
                  disabled={
                    loadingOptions
                  }
                />

                <ManageSelect
                  label="Joint Type"
                  value={
                    formData.jointType
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "jointType",
                      event.target.value
                    )
                  }
                  options={getOptions(
                    "joint_type"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "joint_type"
                    )
                  }
                  disabled={
                    loadingOptions
                  }
                />
              </div>
            </FormSection>

            {/* ==================================================
                MATERIAL SPECIFICATION
            ================================================== */}

            <FormSection
              icon={<FiLayers />}
              title="Material Specification"
              description="Paper combination and board material details."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ManageSelect
                  label="Material Type"
                  value={
                    formData.materialType
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "materialType",
                      event.target.value
                    )
                  }
                  options={getOptions(
                    "material_type"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "material_type"
                    )
                  }
                  disabled={
                    loadingOptions
                  }
                />

                <ManageSelect
                  label="Paper Combination"
                  value={
                    formData.paperCombination
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "paperCombination",
                      event.target.value
                    )
                  }
                  options={getOptions(
                    "paper_combination"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "paper_combination"
                    )
                  }
                  disabled={
                    loadingOptions
                  }
                />

                <FormInput
                  label="Flute / Test"
                  name="fluteTest"
                  value={
                    formData.fluteTest
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter flute / test specification"
                />

                <FormInput
                  label="Board Size"
                  name="boardSize"
                  value={
                    formData.boardSize
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter board size"
                />
              </div>
            </FormSection>

            {/* ==================================================
                PRODUCTION TOOLS
            ================================================== */}

            <FormSection
              icon={<FiTool />}
              title="Production Tools"
              description="Printing plates, ink colors, and die-cutting tools."
            >
              {isPlainPrinting && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
                  Plain printing is selected.
                  Printing Plate and Ink Color
                  are not required.
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {!isPlainPrinting && (
                  <>
                    <ManageSelect
                      label="Printing Plate / Location"
                      value={
                        formData.printingPlate
                      }
                      onChange={(event) =>
                        handleSelectChange(
                          "printingPlate",
                          event.target.value
                        )
                      }
                      options={getOptions(
                        "printing_plate"
                      )}
                      onManage={() =>
                        openManageOptions(
                          "printing_plate"
                        )
                      }
                      disabled={
                        loadingOptions
                      }
                    />

                    <ManageSelect
                      label="Paints / Inks Color"
                      value={
                        formData.inksColor
                      }
                      onChange={(event) =>
                        handleSelectChange(
                          "inksColor",
                          event.target.value
                        )
                      }
                      options={getOptions(
                        "ink_color"
                      )}
                      onManage={() =>
                        openManageOptions(
                          "ink_color"
                        )
                      }
                      disabled={
                        loadingOptions
                      }
                    />
                  </>
                )}

                <ManageSelect
                  label="DC Blade / Location Test"
                  value={
                    formData.dcBlade
                  }
                  onChange={(event) =>
                    handleSelectChange(
                      "dcBlade",
                      event.target.value
                    )
                  }
                  options={getOptions(
                    "dc_blade"
                  )}
                  onManage={() =>
                    openManageOptions(
                      "dc_blade"
                    )
                  }
                  disabled={
                    loadingOptions
                  }
                />
              </div>
            </FormSection>

            {/* ==================================================
                OPERATIONS
            ================================================== */}

            <FormSection
              icon={<FiGitBranch />}
              title="Operations / Process Flow"
              description="Define the production process sequence."
              action={
                <button
                  type="button"
                  onClick={
                    handleAddOperation
                  }
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
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
                      className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-indigo-100"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
                            {index + 1}
                          </span>

                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              Process Step{" "}
                              {index + 1}
                            </p>

                            <p className="text-[10px] text-gray-400">
                              Production sequence
                            </p>
                          </div>
                        </div>

                        {formData
                          .operations
                          .length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveOperation(
                                index
                              )
                            }
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            aria-label={`Remove process step ${index + 1}`}
                          >
                            <MdDeleteOutline className="text-xl" />
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)]">
                        <FormInput
                          label="Step"
                          type="number"
                          min="1"
                          value={
                            operation.step
                          }
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

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-5">
            <button
              type="button"
              onClick={
                handleModalClose
              }
              disabled={saving}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <MdInventory2 className="text-lg" />
                  {isEditMode
                    ? "Save Changes"
                    : "Save Item"}
                </>
              )}
            </button>
          </div>
        </form>

        {/* ==================================================
            MANAGE OPTIONS MODAL
        ================================================== */}

        {manageCategory && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/50 p-3 backdrop-blur-sm sm:p-5">
            <div className="flex max-h-[90%] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

              {/* HEADER */}

              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-linear-to-r from-indigo-50 via-white to-violet-50 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                    <MdSettings className="text-xl" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-gray-900">
                      Manage Options
                    </h3>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {OPTION_LABELS[
                        manageCategory
                      ] || "Options"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closeManageOptions
                  }
                  disabled={
                    optionSaving ||
                    Boolean(
                      optionDeleting
                    )
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white hover:text-gray-800 disabled:opacity-40"
                  aria-label="Close options"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>

              {/* CONTENT */}

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">

                {/* ADD OPTION */}

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-gray-800">
                      Add New Option
                    </h4>

                    <p className="mt-1 text-[11px] text-gray-500">
                      Enter a new{" "}
                      {OPTION_LABELS[
                        manageCategory
                      ]?.toLowerCase() ||
                        "option"}
                      .
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
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
                          event.key ===
                          "Enter"
                        ) {
                          event.preventDefault();
                          void handleAddOption();
                        }
                      }}
                      placeholder={`Enter ${
                        OPTION_LABELS[
                          manageCategory
                        ] || "option"
                      }`}
                      disabled={
                        optionSaving
                      }
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-100"
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
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {optionSaving ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <MdAdd className="text-lg" />
                      )}

                      Add Option
                    </button>
                  </div>
                </div>

                {/* AVAILABLE OPTIONS */}

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        Available Options
                      </h4>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Manage the values available in the form.
                      </p>
                    </div>

                    <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {
                        getOptions(
                          manageCategory
                        ).length
                      }{" "}
                      Total
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                    {getOptions(
                      manageCategory
                    ).length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <MdInventory2 className="mx-auto mb-2 text-3xl text-gray-300" />

                        <p className="text-sm font-semibold text-gray-500">
                          No options available
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Add a new option using the field above.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {getOptions(
                          manageCategory
                        ).map(
                          (
                            option,
                            index
                          ) => (
                            <div
                              key={option}
                              className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-indigo-50/40"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500">
                                  {index + 1}
                                </span>

                                <span className="min-w-0 flex-1 wrap-break-words text-sm font-medium text-gray-700">
                                  {option}
                                </span>
                              </div>

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
                                aria-label={`Delete ${option}`}
                                title={`Delete ${option}`}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                {optionDeleting ===
                                option ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                                ) : (
                                  <MdDeleteOutline className="text-xl" />
                                )}
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER */}

              <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4">
                <p className="text-[11px] text-gray-400">
                  Changes are saved automatically.
                </p>

                <button
                  type="button"
                  onClick={
                    closeManageOptions
                  }
                  disabled={
                    optionSaving ||
                    Boolean(
                      optionDeleting
                    )
                  }
                  className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
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
  icon,
  title,
  description,
  children,
  action,
}) => (
  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 text-[11px] text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>

    <div className="p-4 sm:p-5">
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
  <label className="block min-w-0">
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
      value={value ?? ""}
      onChange={onChange}
      required={required}
      min={min}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
      value={value ?? ""}
      onChange={onChange}
      rows={3}
      placeholder={placeholder}
      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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
  <div className="min-w-0">
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
        className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-indigo-600 transition hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-40"
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
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
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
  <div className="min-w-0">
    <label className="mb-1.5 block text-xs font-semibold text-gray-600">
      <MdStraighten className="mr-1 inline text-indigo-500" />

      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    <div className="grid grid-cols-2 gap-2">

      {/* MILLIMETERS */}

      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={onChange}
          required={required}
          placeholder="MM"
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        />

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
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

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
          IN
        </span>
      </div>
    </div>

    <p className="mt-1 text-[10px] text-gray-400">
      Enter in millimeters. Inches are calculated automatically.
    </p>
  </div>
);

export default ModalCustomerItem;

