const TableFooter = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const safeCurrentPage = Math.max(
    1,
    Math.min(currentPage || 1, totalPages || 1)
  );

  const safeTotalPages = Math.max(totalPages || 0, 1);

  const safeItemsPerPage = Number(itemsPerPage) || 10;

  const safeTotalItems = Number(totalItems) || 0;

  const startItem =
    safeTotalItems === 0
      ? 0
      : (safeCurrentPage - 1) * safeItemsPerPage + 1;

  const endItem = Math.min(
    safeCurrentPage * safeItemsPerPage,
    safeTotalItems
  );

  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  const getPageNumbers = () => {
    const pages = [];

    if (safeTotalPages <= 7) {
      for (let i = 1; i <= safeTotalPages; i += 1) {
        pages.push(i);
      }

      return pages;
    }

    // Beginning
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", safeTotalPages];
    }

    // End
    if (safeCurrentPage >= safeTotalPages - 3) {
      return [
        1,
        "...",
        safeTotalPages - 4,
        safeTotalPages - 3,
        safeTotalPages - 2,
        safeTotalPages - 1,
        safeTotalPages,
      ];
    }

    // Middle
    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      safeTotalPages,
    ];
  };

  // =========================================================
  // HANDLERS
  // =========================================================

  const handlePrevious = () => {
    if (safeCurrentPage > 1) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (
      safeTotalPages > 0 &&
      safeCurrentPage < safeTotalPages
    ) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = Number(event.target.value);

    if (typeof onItemsPerPageChange === "function") {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex flex-col gap-4 border-t border-gray-200 bg-white px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      {/* =====================================================
          RESULTS
      ====================================================== */}

      <div className="text-center text-sm text-gray-600 lg:text-left">
        Showing{" "}
        <span className="font-semibold text-gray-900">
          {startItem}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-gray-900">
          {endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-gray-900">
          {safeTotalItems.toLocaleString()}
        </span>{" "}
        results
      </div>

      {/* =====================================================
          PAGINATION CONTROLS
      ====================================================== */}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {/* ===================================================
            ITEMS PER PAGE
        ==================================================== */}

        <select
          value={safeItemsPerPage}
          onChange={handleItemsPerPageChange}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          aria-label="Items per page"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>

        {/* ===================================================
            PREVIOUS
        ==================================================== */}

        <button
          type="button"
          disabled={safeCurrentPage === 1}
          onClick={handlePrevious}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {/* ===================================================
            PAGE NUMBERS
        ==================================================== */}

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-gray-400"
                >
                  ...
                </span>
              );
            }

            const isActive =
              safeCurrentPage === page;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={
                  isActive ? "page" : undefined
                }
                className={`h-9 min-w-9 rounded-lg px-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* ===================================================
            NEXT
        ==================================================== */}

        <button
          type="button"
          disabled={
            safeTotalPages === 0 ||
            safeCurrentPage >= safeTotalPages
          }
          onClick={handleNext}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TableFooter;