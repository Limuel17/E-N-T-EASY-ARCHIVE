
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiFileText,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiPackage,
  FiUser,
} from "react-icons/fi";

const MilledRunSheetsTable = ({
  runSheets = [],
  showActions = false,
  onEdit,
  onDelete,
  onAddStock,
  onRemoveStock,
  onStockHistory,
  sortField,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}) => {
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <FiChevronDown
          className="ml-1 inline-block text-gray-300"
          size={14}
        />
      );
    }

    return (
      <FiChevronDown
        className={`ml-1 inline-block text-indigo-600 transition-transform ${
          sortDirection === "desc" ? "rotate-180" : ""
        }`}
        size={14}
      />
    );
  };

  const formatNumber = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });
  };

  const formatPrice = (value) => {
    return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleEditClick = (runSheet) => {
    if (!runSheet?._id || !onEdit) {
      return;
    }

    onEdit(runSheet);
  };

  const handleDeleteClick = (runSheet) => {
    if (!runSheet?._id || !onDelete) {
      return;
    }

    onDelete(runSheet);
  };

  const handleAddStockClick = (runSheet) => {
    if (!runSheet?._id || !onAddStock) {
      return;
    }

    onAddStock(runSheet);
  };

  const handleRemoveStockClick = (runSheet) => {
    if (!runSheet?._id || !onRemoveStock) {
      return;
    }

    onRemoveStock(runSheet);
  };

  const handleHistoryClick = (runSheet) => {
    if (!runSheet?._id || !onStockHistory) {
      return;
    }

    onStockHistory(runSheet);
  };

  const startItem =
    totalItems === 0
      ? 0
      : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(
    currentPage * itemsPerPage,
    totalItems
  );

  const ActionButton = ({
    onClick,
    title,
    icon,
    variant = "default",
    disabled = false,
  }) => {
    const variants = {
      edit: "border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100",
      add: "border-emerald-200 bg-emerald-50 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-100",
      remove:
        "border-amber-200 bg-amber-50 text-amber-600 hover:border-amber-300 hover:bg-amber-100",
      history:
        "border-violet-200 bg-violet-50 text-violet-600 hover:border-violet-300 hover:bg-violet-100",
      delete:
        "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100",
      default:
        "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100",
    };

    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={title}
        className={`group inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none ${variants[variant]}`}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* ====================================================== */}
      {/* TABLE HEADER BAR */}
      {/* ====================================================== */}

      <div className="flex flex-col gap-2 border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <FiPackage size={19} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Milled Run Sheets
            </h3>

            <p className="text-xs text-gray-500">
              Inventory and stock overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 shadow-sm">
          <span className="text-xs text-gray-500">
            Total
          </span>

          <span className="text-sm font-bold text-gray-900">
            {totalItems}
          </span>

          <span className="text-xs text-gray-400">
            records
          </span>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <div className="w-full overflow-x-auto">
        <table className="min-w-[1800px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">

              {/* ITEM CODE */}
              <th className="sticky left-0 z-10 bg-gray-50/95 px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Item Code
              </th>

              {/* SUPPLIER */}
              <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Supplier
              </th>

              {/* CUSTOMER */}
              <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Customer
              </th>

              {/* TYPE */}
              <th
                className="cursor-pointer px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                onClick={() => handleSort("type")}
              >
                <span className="inline-flex items-center">
                  Type
                  {renderSortIcon("type")}
                </span>
              </th>

              {/* PAPER COMBINATION */}
              <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Paper Combination
              </th>

              {/* SPECIFICATION */}
              <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Specification
              </th>

              {/* PENDING QTY */}
              <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Pending QTY
              </th>

              {/* STOCK */}
              <th
                className="cursor-pointer px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                onClick={() => handleSort("stock")}
              >
                <span className="inline-flex items-center">
                  Stock
                  {renderSortIcon("stock")}
                </span>
              </th>

              {/* PRICE */}
              <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Price
              </th>

              {/* REMARKS */}
              <th className="px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Remarks
              </th>

              {/* ACTION */}
              <th className="px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {runSheets.length === 0 ? (
              <tr>
                <td colSpan={11}>
                  <div className="flex min-h-65 flex-col items-center justify-center px-6 py-12">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <FiPackage size={25} />
                    </div>

                    <h3 className="text-sm font-semibold text-gray-700">
                      No milled run sheets found
                    </h3>

                    <p className="mt-1 text-xs text-gray-400">
                      There are currently no records to display.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              runSheets.map((runSheet) => {
                const stock = Number(
                  runSheet.stock || 0
                );

                const pendingQty = Number(
                  runSheet.pendingQty || 0
                );

                return (
                  <tr
                    key={runSheet._id}
                    className="group transition-colors duration-150 hover:bg-indigo-50/30"
                  >

                    {/* ITEM CODE */}
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-white px-5 py-4 text-sm font-semibold text-gray-900 group-hover:bg-indigo-50/30">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                          <FiFileText size={14} />
                        </span>

                        {runSheet.itemCode || "-"}
                      </div>
                    </td>

                    {/* SUPPLIER */}
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {runSheet.supplier || "-"}
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-4 py-4 text-sm font-medium text-gray-800">
                      {runSheet.customer || "-"}
                    </td>

                    {/* TYPE */}
                    <td className="px-4 py-4">
                      {runSheet.type ? (
                        <span className="inline-flex rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {runSheet.type}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          -
                        </span>
                      )}
                    </td>

                    {/* PAPER COMBINATION */}
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {runSheet.paperCombination || "-"}
                    </td>

                    {/* SPECIFICATION */}
                    <td className="max-w-55 truncate px-4 py-4 text-sm text-gray-600">
                      {runSheet.specification || "-"}
                    </td>

                    {/* PENDING QTY */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          pendingQty > 0
                            ? "text-amber-600"
                            : "text-gray-400"
                        }`}
                      >
                        {formatNumber(
                          runSheet.pendingQty
                        )}
                      </span>
                    </td>

                    {/* STOCK */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`inline-flex min-w-22 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
                          stock > 0
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            stock > 0
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />

                        {formatNumber(stock)}
                      </span>
                    </td>

                    {/* PRICE */}
                    <td className="px-4 py-4 text-right">
                      <span className="font-mono text-sm font-medium text-gray-800">
                        {formatPrice(runSheet.price)}
                      </span>
                    </td>

                    {/* REMARKS */}
                    <td
                      className="max-w-65 truncate px-4 py-4 text-sm text-gray-500"
                      title={runSheet.remarks || ""}
                    >
                      {runSheet.remarks || (
                        <span className="text-gray-300">
                          No remarks
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1.5">

                        {showActions ? (
                          <>
                            <ActionButton
                              onClick={() =>
                                handleEditClick(
                                  runSheet
                                )
                              }
                              title="Edit"
                              variant="edit"
                              icon={
                                <FiEdit2 size={15} />
                              }
                            />

                            <ActionButton
                              onClick={() =>
                                handleAddStockClick(
                                  runSheet
                                )
                              }
                              title="Add Stock"
                              variant="add"
                              icon={
                                <FiPlus size={17} />
                              }
                            />

                            <ActionButton
                              onClick={() =>
                                handleRemoveStockClick(
                                  runSheet
                                )
                              }
                              title="Remove Stock"
                              variant="remove"
                              disabled={stock <= 0}
                              icon={
                                <FiMinus size={17} />
                              }
                            />

                            <ActionButton
                              onClick={() =>
                                handleHistoryClick(
                                  runSheet
                                )
                              }
                              title="Stock History"
                              variant="history"
                              icon={
                                <FiClock size={15} />
                              }
                            />

                            <ActionButton
                              onClick={() =>
                                handleDeleteClick(
                                  runSheet
                                )
                              }
                              title="Delete"
                              variant="delete"
                              icon={
                                <FiTrash2 size={15} />
                              }
                            />
                          </>
                        ) : (
                          <ActionButton
                            onClick={() =>
                              handleHistoryClick(
                                runSheet
                              )
                            }
                            title="Stock History"
                            variant="history"
                            icon={
                              <FiFileText size={15} />
                            }
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ====================================================== */}
      {/* PAGINATION */}
      {/* ====================================================== */}

      <div className="flex flex-col gap-4 border-t border-gray-200 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

        {/* RESULT COUNT */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <FiUser
            size={14}
            className="text-gray-400"
          />

          <span>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {totalItems}
            </span>{" "}
            entries
          </span>
        </div>

        {/* PAGE CONTROLS */}
        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() =>
              onPageChange(currentPage - 1)
            }
            disabled={currentPage <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-600"
            title="Previous page"
          >
            <FiChevronLeft size={17} />
          </button>

          <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white px-4 text-xs shadow-sm">
            <span className="text-gray-500">
              Page
            </span>

            <span className="mx-1.5 font-bold text-gray-900">
              {currentPage}
            </span>

            <span className="text-gray-400">
              /
            </span>

            <span className="ml-1.5 font-semibold text-gray-600">
              {totalPages}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onPageChange(currentPage + 1)
            }
            disabled={
              currentPage >= totalPages
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-600"
            title="Next page"
          >
            <FiChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MilledRunSheetsTable;