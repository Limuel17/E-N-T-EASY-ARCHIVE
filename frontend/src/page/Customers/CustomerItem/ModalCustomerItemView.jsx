import { useMemo } from "react";

import { FiX } from "react-icons/fi";

import {
  MdInventory2,
  MdStraighten,
  MdPrint,
  MdBuild,
  MdAccountTree,
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

  return value;
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
    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="wrap-break-word text-sm font-medium text-gray-800">
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
  <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
      <span className="text-lg text-gray-600">
        {icon}
      </span>

      <h3 className="text-sm font-bold text-gray-800">
        {title}
      </h3>
    </div>

    <div className="p-4">
      {children}
    </div>
  </section>
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
    const widthMM = Number(item?.widthMM || 0);
    const lengthMM = Number(item?.lengthMM || 0);

    return {
      widthMM,
      lengthMM,
      widthInches: widthMM / 25.4,
      lengthInches: lengthMM / 25.4,
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
    item.customer?.name ||
    item.customer?.code ||
    "—";

  const customerCode =
    item.customer?.code ||
    "—";

  // ==========================================================
  // SAFE DATA
  // ==========================================================

  const materialSpecification =
    item.materialSpecification || {};

  const productionTools =
    item.productionTools || {};

  const operations = Array.isArray(item.operations)
    ? item.operations
    : [];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-gray-100 shadow-2xl">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
              <MdInventory2 className="text-xl" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                Customer Item Details
              </h2>

              <p className="truncate text-xs text-gray-500">
                {item.code || "Item information"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="space-y-4">

            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <Section
              icon={<MdInventory2 />}
              title="Basic Information"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

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
                  value={item.code}
                />

                <DetailItem
                  label="Product Type"
                  value={item.productType}
                />

                <DetailItem
                  label="Name"
                  value={item.name}
                  className="sm:col-span-2"
                />

                <DetailItem
                  label="UOM"
                  value={item.uom}
                />

                <DetailItem
                  label="Description"
                  value={item.description}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* MILLIMETERS */}

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Millimeters
                  </p>

                  <p className="text-lg font-bold text-gray-900">
                    {dimension.widthMM.toFixed(2)}
                    {" × "}
                    {dimension.lengthMM.toFixed(2)}
                    {" mm"}
                  </p>
                </div>

                {/* INCHES */}

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Inches
                  </p>

                  <p className="text-lg font-bold text-gray-900">
                    {dimension.widthInches.toFixed(2)}
                    {" × "}
                    {dimension.lengthInches.toFixed(2)}
                    {" in"}
                  </p>
                </div>

              </div>
            </Section>

            {/* ==================================================
                PRINTING & JOINT
            ================================================== */}

            <Section
              icon={<MdPrint />}
              title="Printing & Joint"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <DetailItem
                  label="Printing Type"
                  value={item.printingType}
                />

                <DetailItem
                  label="Joint Type"
                  value={item.jointType}
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <DetailItem
                  label="Type"
                  value={materialSpecification.type}
                />

                <DetailItem
                  label="Paper Combination"
                  value={
                    materialSpecification.paperCombination
                  }
                />

                <DetailItem
                  label="Flute / Test"
                  value={
                    materialSpecification.fluteTest
                  }
                />

                <DetailItem
                  label="Board Size"
                  value={
                    materialSpecification.boardSize
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* PRINTING PLATE + INKS */}

                {item.printingType !== "Plain" && (
                  <>
                    <DetailItem
                      label="Printing Plate"
                      value={
                        productionTools.printingPlate
                      }
                    />

                    <DetailItem
                      label="Paints / Inks Color"
                      value={
                        productionTools.inksColor
                      }
                    />
                  </>
                )}

                {/* DC BLADE */}

                <DetailItem
                  label="DC Blade"
                  value={productionTools.dcBlade}
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
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <p className="text-sm text-gray-400">
                    No operations have been added.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">

                  <table className="min-w-full divide-y divide-gray-200">

                    {/* TABLE HEADER */}

                    <thead className="bg-gray-50">
                      <tr>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                          Step
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                          Process Flow
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                          Remarks
                        </th>

                      </tr>
                    </thead>

                    {/* TABLE BODY */}

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {operations.map(
                        (operation, index) => (
                          <tr
                            key={
                              operation._id ||
                              `${operation.step}-${index}`
                            }
                            className="hover:bg-gray-50"
                          >

                            <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-gray-800">
                              {formatValue(
                                operation.step
                              )}
                            </td>

                            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700">
                              {formatValue(
                                operation.processFlow
                              )}
                            </td>

                            <td className="min-w-50 wrap-break-word px-4 py-3 text-sm text-gray-600">
                              {formatValue(
                                operation.remarks
                              )}
                            </td>

                          </tr>
                        )
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
              icon={<MdInventory2 />}
              title="Record Information"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <DetailItem
                  label="Created By"
                  value={
                    item.createdBy?.name ||
                    item.createdBy?.email
                  }
                />

                <DetailItem
                  label="Created Date"
                  value={formatDate(item.createdAt)}
                />

                <DetailItem
                  label="Last Updated"
                  value={formatDate(item.updatedAt)}
                />

              </div>
            </Section>

          </div>
        </div>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default ModalCustomerItemView;