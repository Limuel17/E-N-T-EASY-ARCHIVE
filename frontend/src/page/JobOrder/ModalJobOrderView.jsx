
import {
  useMemo,
} from "react";

import {
  MdAssignment,
  MdCalendarToday,
  MdClose,
  MdInventory2,
  MdPerson,
  MdStraighten,
} from "react-icons/md";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (
  value,
  includeTime = false
) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  if (includeTime) {
    return date.toLocaleString(
      "en-PH",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  return date.toLocaleDateString(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }
  );
};

const formatValue = (
  value
) => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return "—";
  }

  return String(value);
};

const formatQuantity = (
  value
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString(
    "en-PH",
    {
      maximumFractionDigits: 2,
    }
  );
};

const formatDimension = (
  value
) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return "—";
  }

  return number.toFixed(2);
};

const mmToInches = (
  value
) => {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return "—";
  }

  return (number / 25.4).toFixed(2);
};

// ============================================================
// STATUS
// ============================================================

const getStatusClass = (
  status
) => {
  switch (status) {
    case "Pending":
      return "bg-amber-50 text-amber-700 ring-amber-200";

    case "Confirmed":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "In Production":
      return "bg-violet-50 text-violet-700 ring-violet-200";

    case "Completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";

    case "Cancelled":
      return "bg-red-50 text-red-700 ring-red-200";

    default:
      return "bg-gray-50 text-gray-600 ring-gray-200";
  }
};

// ============================================================
// PRIORITY
// ============================================================

const getPriorityClass = (
  priority
) => {
  switch (priority) {
    case "Urgent":
      return "bg-red-50 text-red-700 ring-red-200";

    case "High":
      return "bg-orange-50 text-orange-700 ring-orange-200";

    case "Medium":
      return "bg-blue-50 text-blue-700 ring-blue-200";

    case "Low":
      return "bg-gray-50 text-gray-600 ring-gray-200";

    default:
      return "bg-gray-50 text-gray-600 ring-gray-200";
  }
};

// ============================================================
// COMPONENT
// ============================================================

const ModalJobOrderView = ({
  isOpen,
  onClose,
  jobOrder,
}) => {
  const customerSnapshot =
    jobOrder?.customerSnapshot ||
    {};

  const itemSnapshot =
    jobOrder?.customerItemSnapshot ||
    {};

  const customer =
    jobOrder?.customer ||
    {};

  const customerItem =
    jobOrder?.customerItem ||
    {};

  const materialSpecification =
    itemSnapshot.materialSpecification ||
    {};

  const productionTools =
    itemSnapshot.productionTools ||
    {};

  const operations =
    Array.isArray(
      itemSnapshot.operations
    )
      ? itemSnapshot.operations
      : [];

  const dimensions =
    useMemo(
      () => ({
        width:
          itemSnapshot.widthMM ||
          customerItem.widthMM ||
          0,

        length:
          itemSnapshot.lengthMM ||
          customerItem.lengthMM ||
          0,

        height:
          itemSnapshot.heightMM ||
          customerItem.heightMM ||
          0,
      }),
      [
        itemSnapshot.widthMM,
        itemSnapshot.lengthMM,
        itemSnapshot.heightMM,
        customerItem.widthMM,
        customerItem.lengthMM,
        customerItem.heightMM,
      ]
    );

  const customerName =
    customer.name ||
    customerSnapshot.name;

  const customerCode =
    customer.code ||
    customerSnapshot.code;

  const itemCode =
    customerItem.code ||
    itemSnapshot.code;

  const itemName =
    customerItem.name ||
    itemSnapshot.name;

  const productType =
    customerItem.productType ||
    itemSnapshot.productType;

  const printingType =
    customerItem.printingType ||
    itemSnapshot.printingType;

  const isPlainPrinting =
    String(
      printingType || ""
    ).toLowerCase() ===
    "plain";

  if (
    !isOpen ||
    !jobOrder
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-5">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <MdAssignment className="text-xl" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold sm:text-lg">
                Job Order Details
              </h2>

              <p className="mt-0.5 truncate text-[11px] text-indigo-100 sm:text-xs">
                {formatValue(
                  jobOrder.jobOrderNumber
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* ==================================================
            BODY
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-6 p-5 sm:p-6">
            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <section className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                  label="Job Order"
                  value={
                    jobOrder.jobOrderNumber
                  }
                />

                <SummaryCard
                  label="Quantity"
                  value={`${formatQuantity(
                    jobOrder.quantity
                  )} ${
                    jobOrder.uom ||
                    ""
                  }`}
                />

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Priority
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${getPriorityClass(
                        jobOrder.priority
                      )}`}
                    >
                      {formatValue(
                        jobOrder.priority
                      )}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Status
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${getStatusClass(
                        jobOrder.status
                      )}`}
                    >
                      {formatValue(
                        jobOrder.status
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                CUSTOMER
            ================================================= */}

            <Section
              icon={
                <MdPerson />
              }
              title="Customer Information"
              description="Customer information associated with this Job Order"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Customer Code"
                  value={
                    customerCode
                  }
                />

                <DetailItem
                  label="Customer Name"
                  value={
                    customerName
                  }
                />

                <DetailItem
                  label="Contact Person"
                  value={
                    customer.contactPerson ||
                    customerSnapshot.contactPerson
                  }
                />

                <DetailItem
                  label="Order Type"
                  value={
                    customer.orderTypes ||
                    customerSnapshot.orderTypes
                  }
                />

                <DetailItem
                  label="VAT Type"
                  value={
                    customer.vatType ||
                    customerSnapshot.vatType
                  }
                />

                <DetailItem
                  label="Payment Terms"
                  value={
                    customer.paymentTerms ||
                    customerSnapshot.paymentTerms
                  }
                />

                <DetailItem
                  label="Payment Method"
                  value={
                    customer.paymentMethod ||
                    customerSnapshot.paymentMethod
                  }
                />

                <DetailItem
                  label="Limits"
                  value={
                    customer.limits ||
                    customerSnapshot.limits
                  }
                />

                <div className="sm:col-span-2 lg:col-span-4">
                  <DetailItem
                    label="Address"
                    value={
                      customer.address ||
                      customerSnapshot.address
                    }
                  />
                </div>
              </div>
            </Section>

            {/* =================================================
                CUSTOMER ITEM
            ================================================= */}

            <Section
              icon={
                <MdInventory2 />
              }
              title="Customer Item"
              description="Product information captured when the Job Order was created"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Item Code"
                  value={
                    itemCode
                  }
                />

                <DetailItem
                  label="Product Type"
                  value={
                    productType
                  }
                />

                <DetailItem
                  label="Item Name"
                  value={
                    itemName
                  }
                />

                <DetailItem
                  label="UOM"
                  value={
                    itemSnapshot.uom ||
                    customerItem.uom ||
                    jobOrder.uom
                  }
                />

                <DetailItem
                  label="Printing Type"
                  value={
                    printingType
                  }
                />

                <DetailItem
                  label="Joint Type"
                  value={
                    customerItem.jointType ||
                    itemSnapshot.jointType
                  }
                />

                <div className="sm:col-span-2 lg:col-span-4">
                  <DetailItem
                    label="Description"
                    value={
                      customerItem.description ||
                      itemSnapshot.description
                    }
                  />
                </div>
              </div>
            </Section>

            {/* =================================================
                DIMENSIONS
            ================================================= */}

            <Section
              icon={
                <MdStraighten />
              }
              title="Dimensions"
              description="Dimensions stored in millimeters and displayed in inches"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <DimensionCard
                  label="Width"
                  value={
                    dimensions.width
                  }
                />

                <DimensionCard
                  label="Length"
                  value={
                    dimensions.length
                  }
                />

                <DimensionCard
                  label="Height"
                  value={
                    dimensions.height
                  }
                />
              </div>
            </Section>

            {/* =================================================
                MATERIAL
            ================================================= */}

            <Section
              icon={
                <MdInventory2 />
              }
              title="Material Specification"
              description="Material information captured from the Customer Item"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Type"
                  value={
                    materialSpecification.type
                  }
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

            {/* =================================================
                PRODUCTION TOOLS
            ================================================= */}

            <Section
              title="Production Tools"
              description="Production tool information captured from the Customer Item"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {!isPlainPrinting && (
                  <>
                    <DetailItem
                      label="Printing Plate / Location"
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

                <DetailItem
                  label="DC Blade / Location"
                  value={
                    productionTools.dcBlade
                  }
                />
              </div>
            </Section>

            {/* =================================================
                OPERATIONS
            ================================================= */}

            <Section
              title="Operations / Process Flow"
              description="Production process captured from the Customer Item"
            >
              {operations.length ===
              0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
                  <p className="text-xs text-gray-400">
                    No process flow recorded.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full min-w-150">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-20 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Step
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Process Flow
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">
                          Remarks
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {operations.map(
                        (
                          operation,
                          index
                        ) => (
                          <tr
                            key={`${operation.step}-${index}`}
                            className="border-t border-gray-100"
                          >
                            <td className="px-4 py-3 text-xs font-bold text-gray-700">
                              {operation.step ||
                                index +
                                  1}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-700">
                              {formatValue(
                                operation.processFlow
                              )}
                            </td>

                            <td className="px-4 py-3 text-xs text-gray-500">
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

            {/* =================================================
                ORDER DATES
            ================================================= */}

            <Section
              icon={
                <MdCalendarToday />
              }
              title="Order Schedule"
              description="Job Order schedule information"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Order Date"
                  value={formatDate(
                    jobOrder.orderDate
                  )}
                />

                <DetailItem
                  label="Due Date"
                  value={formatDate(
                    jobOrder.dueDate
                  )}
                />

                <DetailItem
                  label="Created"
                  value={formatDate(
                    jobOrder.createdAt,
                    true
                  )}
                />

                <DetailItem
                  label="Last Updated"
                  value={formatDate(
                    jobOrder.updatedAt,
                    true
                  )}
                />
              </div>
            </Section>

            {/* =================================================
                REMARKS
            ================================================= */}

            <Section
              title="Remarks"
              description="Additional Job Order notes"
            >
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {formatValue(
                    jobOrder.remarks
                  )}
                </p>
              </div>
            </Section>

            {/* =================================================
                RECORD INFORMATION
            ================================================= */}

            <Section
              title="Record Information"
              description="Job Order record information"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DetailItem
                  label="Created By"
                  value={
                    jobOrder.createdBy
                      ?.name
                  }
                />

                <DetailItem
                  label="Created By Email"
                  value={
                    jobOrder.createdBy
                      ?.email
                  }
                />

                <DetailItem
                  label="Updated By"
                  value={
                    jobOrder.updatedBy
                      ?.name
                  }
                />

                <DetailItem
                  label="Updated By Email"
                  value={
                    jobOrder.updatedBy
                      ?.email
                  }
                />
              </div>
            </Section>
          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Job Order Record
            </p>

            <p className="mt-0.5 text-[11px] text-gray-400">
              {formatValue(
                jobOrder.jobOrderNumber
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-10 items-center justify-center rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SECTION
// ============================================================

const Section = ({
  icon,
  title,
  description,
  children,
}) => (
  <section>
    <div className="mb-4 flex items-start gap-2">
      {icon && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>

        {description && (
          <p className="mt-0.5 text-[11px] text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>

    {children}
  </section>
);

// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
  label,
  value,
}) => (
  <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/70 p-3">
    <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-1 wrap-break-word text-sm font-semibold text-gray-700">
      {formatValue(value)}
    </p>
  </div>
);

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-1 wrap-break-words text-sm font-bold text-gray-800">
      {formatValue(value)}
    </p>
  </div>
);

// ============================================================
// DIMENSION CARD
// ============================================================

const DimensionCard = ({
  label,
  value,
}) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <div className="mt-2 flex flex-wrap items-baseline gap-2">
      <span className="text-base font-bold text-gray-800">
        {formatDimension(value)} mm
      </span>

      <span className="text-xs text-gray-400">
        ({mmToInches(value)} in)
      </span>
    </div>
  </div>
);

export default ModalJobOrderView;

