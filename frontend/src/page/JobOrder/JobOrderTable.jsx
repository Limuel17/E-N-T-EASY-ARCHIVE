import { useMemo } from "react";

import {
MdDeleteOutline,
MdVisibility,
MdWorkOutline,
} from "react-icons/md";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (value) => {
if (!value) {
return "—";
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return "—";
}

return date.toLocaleDateString("en-PH", {
year: "numeric",
month: "short",
day: "2-digit",
});
};

const formatQuantity = (value) => {
const number = Number(value);

if (!Number.isFinite(number)) {
return "—";
}

return number.toLocaleString("en-PH", {
maximumFractionDigits: 2,
});
};

const getRecordId = (record) => {
return String(record?._id || record?.id || "");
};

const getCustomerName = (jobOrder) => {
return (
jobOrder?.customer?.name ||
jobOrder?.customerSnapshot?.name ||
"—"
);
};

const getCustomerCode = (jobOrder) => {
return (
jobOrder?.customer?.code ||
jobOrder?.customerSnapshot?.code ||
"—"
);
};

const getItemCode = (jobOrder) => {
return (
jobOrder?.customerItem?.code ||
jobOrder?.customerItemSnapshot?.code ||
"—"
);
};

const getItemName = (jobOrder) => {
return (
jobOrder?.customerItem?.name ||
jobOrder?.customerItemSnapshot?.name ||
"—"
);
};

const getItemDescription = (jobOrder) => {
return (
jobOrder?.customerItem?.description ||
jobOrder?.customerItemSnapshot?.description ||
"—"
);
};

const getPONumber = (jobOrder) => {
return (
jobOrder?.poNumber ||
jobOrder?.purchaseOrderNumber ||
jobOrder?.customerSnapshot?.poNumber ||
"—"
);
};

// ============================================================
// STATUS STYLE
// ============================================================

const getStatusClass = (status) => {
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
// PRIORITY STYLE
// ============================================================

const getPriorityClass = (priority) => {
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

const JobOrderTable = ({
jobOrders = [],
search = "",
loading = false,
onView,
onDelete,
}) => {
// ==========================================================
// SEARCH
// ==========================================================

const filteredJobOrders = useMemo(() => {
const normalizedSearch = String(search || "")
.trim()
.toLowerCase();


if (!normalizedSearch) {
  return jobOrders;
}

return jobOrders.filter((jobOrder) => {
  const searchableValues = [
    jobOrder?.jobOrderNumber,

    // P.O. Number
    jobOrder?.poNumber,
    jobOrder?.purchaseOrderNumber,

    // Status / Priority
    jobOrder?.status,
    jobOrder?.priority,
    jobOrder?.remarks,

    // Customer
    jobOrder?.customer?.code,
    jobOrder?.customer?.name,
    jobOrder?.customerSnapshot?.code,
    jobOrder?.customerSnapshot?.name,

    // Customer Item
    jobOrder?.customerItem?.code,
    jobOrder?.customerItem?.name,
    jobOrder?.customerItem?.description,
    jobOrder?.customerItem?.productType,

    // Snapshot
    jobOrder?.customerItemSnapshot?.code,
    jobOrder?.customerItemSnapshot?.name,
    jobOrder?.customerItemSnapshot?.description,
    jobOrder?.customerItemSnapshot?.productType,
  ];

  return searchableValues.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(normalizedSearch)
  );
});


}, [jobOrders, search]);

// ==========================================================
// LOADING
// ==========================================================

if (loading) {
return ( <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"> <div className="flex min-h-96 items-center justify-center"> <div className="flex flex-col items-center gap-3"> <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />


        <p className="text-sm text-gray-500">
          Loading Job Orders...
        </p>
      </div>
    </div>
  </div>
);


}

// ==========================================================
// TABLE
// ==========================================================

return ( <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
{/* ======================================================
TABLE HEADER
====================================================== */}


  <div className="border-b border-gray-100 px-5 py-4">
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-bold text-gray-900">
          Job Order List
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          {filteredJobOrders.length}{" "}
          {filteredJobOrders.length === 1
            ? "order"
            : "orders"}{" "}
          found
        </p>
      </div>

      {search.trim() && (
        <p className="text-xs text-gray-400">
          Search:
          <span className="ml-1 font-semibold text-gray-600">
            "{search}"
          </span>
        </p>
      )}
    </div>
  </div>

  {/* ======================================================
      DESKTOP TABLE
  ====================================================== */}

  <div className="hidden overflow-x-auto lg:block">
    <table className="w-full min-w-312.5 border-collapse">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50/80">
          {/* Job Order */}
          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Job Order
          </th>

          {/* P.O. Number */}
          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            P.O Number
          </th>

          {/* Customer */}
          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Customer
          </th>

          {/* Item */}
          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Item
          </th>

          {/* Description */}
          <th className="min-w-56 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Description
          </th>

          {/* Quantity */}
          <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Quantity
          </th>

          {/* Order Date */}
          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Order Date
          </th>

          {/* Deliver Date */}
          <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Delivery Date
          </th>

          {/* Priority */}
          <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Priority
          </th>

          {/* Status */}
          <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Status
          </th>

          {/* Action */}
          <th className="w-28 px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-gray-500">
            Action
          </th>
        </tr>
      </thead>

      <tbody>
        {filteredJobOrders.length === 0 ? (
          <tr>
            <td
              colSpan={11}
              className="px-6 py-16 text-center"
            >
              <div className="mx-auto flex max-w-sm flex-col items-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                  <MdWorkOutline className="text-3xl" />
                </div>

                <h3 className="text-sm font-bold text-gray-800">
                  No Job Orders Found
                </h3>

                <p className="mt-1 text-xs leading-5 text-gray-400">
                  {search.trim()
                    ? "Try a different search term."
                    : "Create your first Job Order to get started."}
                </p>
              </div>
            </td>
          </tr>
        ) : (
          filteredJobOrders.map((jobOrder) => {
            const jobOrderId = getRecordId(jobOrder);

            return (
              <tr
                key={jobOrderId}
                className="border-b border-gray-100 transition hover:bg-indigo-50/30"
              >
                {/* Job Order */}
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onView?.(jobOrder)}
                    className="text-left"
                  >
                    <p className="text-sm font-bold text-indigo-600 transition hover:text-indigo-800">
                      {jobOrder.jobOrderNumber || "—"}
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Created{" "}
                      {formatDate(jobOrder.createdAt)}
                    </p>
                  </button>
                </td>

                {/* P.O. Number */}
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-gray-700">
                    {getPONumber(jobOrder)}
                  </p>
                </td>

                {/* Customer */}
                <td className="px-4 py-4">
                  <p className="max-w-48 truncate text-sm font-semibold text-gray-800">
                    {getCustomerName(jobOrder)}
                  </p>

                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {getCustomerCode(jobOrder)}
                  </p>
                </td>

                {/* Item */}
                <td className="px-4 py-4">
                  <p className="max-w-44 truncate text-sm font-semibold text-gray-800">
                    {getItemName(jobOrder)}
                  </p>

                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {getItemCode(jobOrder)}
                  </p>
                </td>

                {/* Description */}
                <td className="px-4 py-4">
                  <p
                    className="max-w-64 truncate text-sm text-gray-600"
                    title={getItemDescription(jobOrder)}
                  >
                    {getItemDescription(jobOrder)}
                  </p>
                </td>

                {/* Quantity */}
                <td className="px-4 py-4 text-right">
                  <p className="text-sm font-bold text-gray-800">
                    {formatQuantity(jobOrder.quantity)}
                  </p>

                  <p className="mt-0.5 text-[11px] uppercase text-gray-400">
                    {jobOrder.uom || "—"}
                  </p>
                </td>

                {/* Order Date */}
                <td className="px-4 py-4 text-sm text-gray-600">
                  {formatDate(jobOrder.orderDate)}
                </td>

                {/* Deliver Date */}
                <td className="px-4 py-4 text-sm text-gray-600">
                  {formatDate(jobOrder.dueDate)}
                </td>

                {/* Priority */}
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${getPriorityClass(
                      jobOrder.priority
                    )}`}
                  >
                    {jobOrder.priority || "—"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-4 text-center">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${getStatusClass(
                      jobOrder.status
                    )}`}
                  >
                    {jobOrder.status || "—"}
                  </span>
                </td>

                {/* Action */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onView?.(jobOrder)}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="View Job Order"
                    >
                      <MdVisibility className="text-xl" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete?.(jobOrder)}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      title="Delete Job Order"
                    >
                      <MdDeleteOutline className="text-xl" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>

  {/* ======================================================
      MOBILE / TABLET CARDS
  ====================================================== */}

  <div className="divide-y divide-gray-100 lg:hidden">
    {filteredJobOrders.length === 0 ? (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <MdWorkOutline className="text-3xl" />
          </div>

          <h3 className="text-sm font-bold text-gray-800">
            No Job Orders Found
          </h3>

          <p className="mt-1 text-xs leading-5 text-gray-400">
            {search.trim()
              ? "Try a different search term."
              : "Create your first Job Order to get started."}
          </p>
        </div>
      </div>
    ) : (
      filteredJobOrders.map((jobOrder) => {
        const jobOrderId = getRecordId(jobOrder);

        return (
          <div
            key={jobOrderId}
            className="p-4"
          >
            {/* Mobile Header */}
            <div className="flex items-start justify-between gap-3">
              <button
                type="button"
                onClick={() => onView?.(jobOrder)}
                className="min-w-0 text-left"
              >
                <p className="text-sm font-bold text-indigo-600">
                  {jobOrder.jobOrderNumber || "—"}
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-gray-800">
                  {getCustomerName(jobOrder)}
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  {getCustomerCode(jobOrder)}
                </p>
              </button>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => onView?.(jobOrder)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                  title="View"
                >
                  <MdVisibility className="text-xl" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete?.(jobOrder)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <MdDeleteOutline className="text-xl" />
                </button>
              </div>
            </div>

            {/* Mobile Details */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {/* P.O. Number */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  P.O Number
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-gray-700">
                  {getPONumber(jobOrder)}
                </p>
              </div>

              {/* Item */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Item
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-gray-700">
                  {getItemName(jobOrder)}
                </p>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  {getItemCode(jobOrder)}
                </p>
              </div>

              {/* Description */}
              <div className="col-span-2 rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Description
                </p>

                <p
                  className="mt-1 text-sm text-gray-700"
                  title={getItemDescription(jobOrder)}
                >
                  {getItemDescription(jobOrder)}
                </p>
              </div>

              {/* Quantity */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Quantity
                </p>

                <p className="mt-1 text-sm font-bold text-gray-700">
                  {formatQuantity(jobOrder.quantity)}{" "}
                  {jobOrder.uom || ""}
                </p>
              </div>

              {/* Order Date */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Order Date
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {formatDate(jobOrder.orderDate)}
                </p>
              </div>

              {/* Deliver Date */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Deliver Date
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {formatDate(jobOrder.dueDate)}
                </p>
              </div>

              {/* Priority */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Priority
                </p>

                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${getPriorityClass(
                      jobOrder.priority
                    )}`}
                  >
                    {jobOrder.priority || "—"}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Status
                </p>

                <div className="mt-1">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${getStatusClass(
                      jobOrder.status
                    )}`}
                  >
                    {jobOrder.status || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
              <span>
                Order Date:{" "}
                {formatDate(jobOrder.orderDate)}
              </span>

              <span>
                {filteredJobOrders.indexOf(jobOrder) + 1} /{" "}
                {filteredJobOrders.length}
              </span>
            </div>
          </div>
        );
      })
    )}
  </div>
</div>


);
};

export default JobOrderTable;
