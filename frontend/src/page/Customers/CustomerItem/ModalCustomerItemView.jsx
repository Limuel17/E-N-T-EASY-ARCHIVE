import { useMemo } from "react";

import { FiX } from "react-icons/fi";

import {
  MdAccountTree,
  MdBuild,
  MdCalendarToday,
  MdInventory2,
  MdPerson,
  MdPrint,
  MdStraighten,
} from "react-icons/md";

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleString();
};

// ============================================================
// FORMAT VALUE
// ============================================================

const formatValue = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  return String(value);
};

// ============================================================
// FORMAT DIMENSION VALUE
// ============================================================

const formatDimensionValue = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "—";
  }

  return number.toFixed(2);
};

// ============================================================
// CONVERT MM TO INCHES
// ============================================================

const mmToInches = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "—";
  }

  return (number / 25.4).toFixed(2);
};

// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
  label,
  value,
  className = "",
}) => (
  <div className={`min-w-0 ${className}`}>
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
      {label}
    </p>

    <p className="wrap-break-word text-sm font-semibold text-gray-800">
      {formatValue(value)}
    </p>
  </div>
);

// ============================================================
// SECTION
// ============================================================

const Section = ({
  icon,
  title,
  children,
}) => (
  <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-4 py-3.5 sm:px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <span className="text-lg">
          {icon}
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-800">
        {title}
      </h3>
    </div>

    <div className="p-4 sm:p-5">
      {children}
    </div>
  </section>
);

// ============================================================
// DIMENSION CARD
// ============================================================

const DimensionCard = ({
  title,
  value,
  unit,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-linear-to-br from-gray-50 to-white p-4">
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {title}
      </p>

      <MdStraighten className="text-lg text-indigo-400" />
    </div>

    <p className="text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
      {value}{" "}
      <span className="text-sm font-semibold text-gray-500">
        {unit}
      </span>
    </p>
  </div>
);

// ============================================================
// MODAL CUSTOMER ITEM VIEW
// ============================================================

const ModalCustomerItemView = ({
  isOpen,
  onClose,
  item,
}) => {
  // ==========================================================
  // DIMENSIONS
  // ==========================================================

  const dimension = useMemo(() => {
    const widthMM = Number(item?.widthMM);
    const lengthMM = Number(item?.lengthMM);
    const heightMM = Number(item?.heightMM);

    return {
      widthMM,
      lengthMM,
      heightMM,

      widthInches: mmToInches(widthMM),
      lengthInches: mmToInches(lengthMM),
      heightInches: mmToInches(heightMM),
    };
  }, [item]);

  // ==========================================================
  // MODAL VISIBILITY
  // ==========================================================

  if (!isOpen || !item) {
    return null;
  }

  // ==========================================================
  // CUSTOMER INFORMATION
  // ==========================================================

  const customerName =
    item?.customer?.name ||
    item?.customer?.code ||
    "—";

  const customerCode =
    item?.customer?.code || "—";

  // ==========================================================
  // SAFE DATA
  // ==========================================================

  const materialSpecification =
    item?.materialSpecification || {};

  const productionTools =
    item?.productionTools || {};

  const operations = Array.isArray(
    item?.operations
  )
    ? item.operations
    : [];

  const isPlainPrinting =
    String(item?.printingType || "")
      .trim()
      .toLowerCase() === "plain";

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-item-view-title"
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-gray-50 shadow-2xl"
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-linear-to-r from-indigo-700 via-indigo-600 to-violet-600 px-4 py-4 text-white sm:px-6">
          <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/10" />

          <div className="absolute -bottom-16 right-28 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15">
              <MdInventory2 className="text-2xl" />
            </div>

            <div className="min-w-0">
              <h2
                id="customer-item-view-title"
                className="truncate text-base font-bold sm:text-lg"
              >
                Customer Item Details
              </h2>

              <p className="mt-0.5 truncate text-xs text-indigo-100">
                Item Code:{" "}
                {item?.code ||
                  "Not available"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="space-y-4">
            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <Section
              icon={<MdInventory2 />}
              title="Basic Information"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Customer"
                  value={customerName}
                />

                <DetailItem
                  label="Customer Code"
                  value={customerCode}
                />

                <DetailItem
                  label="Item Code"
                  value={item?.code}
                />

                <DetailItem
                  label="Product Type"
                  value={item?.productType}
                />

                <DetailItem
                  label="Name"
                  value={item?.name}
                  className="sm:col-span-2"
                />

                <DetailItem
                  label="UOM"
                  value={item?.uom}
                />

                <DetailItem
                  label="Description"
                  value={item?.description}
                  className="sm:col-span-2 lg:col-span-4"
                />
              </div>
            </Section>

            {/* ==================================================
                DIMENSION
            ================================================== */}

            <Section
              icon={<MdStraighten />}
              title="Dimension"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DimensionCard
                  title="Width"
                  value={formatDimensionValue(
                    dimension.widthMM
                  )}
                  unit="mm"
                />

                <DimensionCard
                  title="Length"
                  value={formatDimensionValue(
                    dimension.lengthMM
                  )}
                  unit="mm"
                />

                <DimensionCard
                  title="Height"
                  value={formatDimensionValue(
                    dimension.heightMM
                  )}
                  unit="mm"
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <DimensionCard
                  title="Width"
                  value={dimension.widthInches}
                  unit="in"
                />

                <DimensionCard
                  title="Length"
                  value={dimension.lengthInches}
                  unit="in"
                />

                <DimensionCard
                  title="Height"
                  value={dimension.heightInches}
                  unit="in"
                />
              </div>

              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
                <p className="text-center text-xs font-semibold text-indigo-600">
                  Width × Length × Height
                </p>

                <p className="mt-1 text-center text-xs text-gray-500">
                  Dimensions are displayed in
                  both millimeters and inches.
                </p>
              </div>
            </Section>

            {/* ==================================================
                PRINTING AND JOINT
            ================================================== */}

            <Section
              icon={<MdPrint />}
              title="Printing & Joint"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Printing Type"
                  value={item?.printingType}
                />

                <DetailItem
                  label="Joint Type"
                  value={item?.jointType}
                />
              </div>
            </Section>

            {/* ==================================================
                MATERIAL SPECIFICATION
            ================================================== */}

            <Section
              icon={<MdInventory2 />}
              title="Material Specification"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Type"
                  value={
                    materialSpecification?.type
                  }
                />

                <DetailItem
                  label="Paper Combination"
                  value={
                    materialSpecification?.paperCombination
                  }
                />

                <DetailItem
                  label="Flute / Test"
                  value={
                    materialSpecification?.fluteTest
                  }
                />

                <DetailItem
                  label="Board Size"
                  value={
                    materialSpecification?.boardSize
                  }
                />
              </div>
            </Section>

            {/* ==================================================
                PRODUCTION TOOLS
            ================================================== */}

            <Section
              icon={<MdBuild />}
              title="Production Tools"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                {!isPlainPrinting && (
                  <>
                    <DetailItem
                      label="Printing Plate"
                      value={
                        productionTools?.printingPlate
                      }
                    />

                    <DetailItem
                      label="Paints / Inks Color"
                      value={
                        productionTools?.inksColor
                      }
                    />
                  </>
                )}

                <DetailItem
                  label="DC Blade"
                  value={
                    productionTools?.dcBlade
                  }
                />
              </div>
            </Section>

            {/* ==================================================
                OPERATIONS
            ================================================== */}

            <Section
              icon={<MdAccountTree />}
              title="Operations / Process Flow"
            >
              {operations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
                  <MdAccountTree className="mx-auto mb-2 text-3xl text-gray-300" />

                  <p className="text-sm font-medium text-gray-500">
                    No operations have been
                    added.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Step
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Process Flow
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Remarks
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {operations.map(
                        (operation, index) => {
                          const operationKey =
                            operation?._id ||
                            `${operation?.step || "step"}-${index}`;

                          return (
                            <tr
                              key={operationKey}
                              className="transition hover:bg-indigo-50/40"
                            >
                              {/* STEP */}

                              <td className="whitespace-nowrap px-4 py-3">
                                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-indigo-50 px-2 text-xs font-bold text-indigo-700">
                                  {formatValue(
                                    operation?.step
                                  )}
                                </span>
                              </td>

                              {/* PROCESS FLOW */}

                              <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-700">
                                {formatValue(
                                  operation?.processFlow
                                )}
                              </td>

                              {/* REMARKS */}

                              <td className="min-w-50 wrap-break-word px-4 py-3 text-sm text-gray-600">
                                {formatValue(
                                  operation?.remarks
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </Section>

            {/* ==================================================
                RECORD INFORMATION
            ================================================== */}

            <Section
              icon={<MdPerson />}
              title="Record Information"
            >
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Created By"
                  value={
                    item?.createdBy?.name ||
                    item?.createdBy?.email
                  }
                />

                <DetailItem
                  label="Created Date"
                  value={formatDate(
                    item?.createdAt
                  )}
                />

                <DetailItem
                  label="Last Updated"
                  value={formatDate(
                    item?.updatedAt
                  )}
                />
              </div>
            </Section>
          </div>
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="hidden items-center gap-2 text-xs text-gray-400 sm:flex">
            <MdCalendarToday className="text-sm" />

            <span>
              Customer Item Record
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
          >
            <FiX className="text-base" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCustomerItemView;