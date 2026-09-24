import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const TableFooter = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
}) => {
  // =========================================================
  // SAFE VALUES
  // =========================================================

  const safeCurrentPage = Math.max(
    1,
    Math.min(
      Number(currentPage) || 1,
      Number(totalPages) || 1
    )
  );

  const safeTotalPages = Math.max(
    Number(totalPages) || 0,
    1
  );

  const safeItemsPerPage =
    Number(itemsPerPage) || 10;

  const safeTotalItems =
    Number(totalItems) || 0;

  // =========================================================
  // RESULT RANGE
  // =========================================================

  const startItem =
    safeTotalItems === 0
      ? 0
      : (safeCurrentPage - 1) *
          safeItemsPerPage +
        1;

  const endItem = Math.min(
    safeCurrentPage * safeItemsPerPage,
    safeTotalItems
  );

  // =========================================================
  // PAGE NUMBERS
  // =========================================================

  const getPageNumbers = () => {
    if (safeTotalPages <= 7) {
      return Array.from(
        { length: safeTotalPages },
        (_, index) => index + 1
      );
    }

    if (safeCurrentPage <= 4) {
      return [
        1,
        2,
        3,
        4,
        5,
        "...",
        safeTotalPages,
      ];
    }

    if (
      safeCurrentPage >=
      safeTotalPages - 3
    ) {
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
    if (
      safeCurrentPage > 1 &&
      typeof onPageChange === "function"
    ) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (
      safeCurrentPage < safeTotalPages &&
      typeof onPageChange === "function"
    ) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const handleFirst = () => {
    if (
      safeCurrentPage > 1 &&
      typeof onPageChange === "function"
    ) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (
      safeCurrentPage < safeTotalPages &&
      typeof onPageChange === "function"
    ) {
      onPageChange(safeTotalPages);
    }
  };

  const handlePageChange = (page) => {
    if (
      typeof onPageChange === "function" &&
      Number.isInteger(page) &&
      page >= 1 &&
      page <= safeTotalPages
    ) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = Number(
      event.target.value
    );

    if (
      typeof onItemsPerPageChange ===
        "function" &&
      newItemsPerPage > 0
    ) {
      onItemsPerPageChange(
        newItemsPerPage
      );
    }
  };

  // =========================================================
  // BUTTON STYLES
  // =========================================================

  const navigationButtonClass = [
    "inline-flex h-9 shrink-0",
    "items-center justify-center",
    "rounded-lg border border-gray-200",
    "bg-white px-2.5",
    "text-gray-600",
    "shadow-sm",
    "transition-all duration-200",
    "hover:border-indigo-200",
    "hover:bg-indigo-50",
    "hover:text-indigo-600",
    "focus:outline-none",
    "focus:ring-2 focus:ring-indigo-200",
    "disabled:cursor-not-allowed",
    "disabled:border-gray-100",
    "disabled:bg-gray-50",
    "disabled:text-gray-300",
    "disabled:shadow-none",
  ].join(" ");

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full min-w-0 border-t border-gray-200 bg-linear-to-b from-white to-gray-50/70 px-4 py-4 sm:px-5">
      <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        {/* =====================================================
            RESULTS SUMMARY
        ===================================================== */}

        <div className="flex min-w-0 items-center">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-2 shadow-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-[10px] font-extrabold text-indigo-600">
              #
            </span>

            <p className="whitespace-nowrap text-xs text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-800">
                {startItem.toLocaleString()}
              </span>{" "}
              –{" "}
              <span className="font-bold text-gray-800">
                {endItem.toLocaleString()}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {safeTotalItems.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* =====================================================
            PAGINATION CONTROLS
        ===================================================== */}

        <div className="flex min-w-0 flex-wrap items-center justify-center gap-2 xl:justify-end">
          {/* =================================================
              ITEMS PER PAGE
          ================================================= */}

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] font-semibold text-gray-400 sm:inline">
              Rows
            </span>

            <div className="relative shrink-0">
              <select
                value={safeItemsPerPage}
                onChange={
                  handleItemsPerPageChange
                }
                aria-label="Items per page"
                className={[
                  "h-9 cursor-pointer",
                  "appearance-none rounded-lg",
                  "border border-gray-200",
                  "bg-white py-1.5 pl-3 pr-8",
                  "text-xs font-semibold text-gray-700",
                  "shadow-sm outline-none",
                  "transition-all duration-200",
                  "hover:border-indigo-200",
                  "hover:bg-gray-50",
                  "focus:border-indigo-400",
                  "focus:ring-4",
                  "focus:ring-indigo-500/10",
                ].join(" ")}
              >
                <option value={10}>
                  10 / page
                </option>

                <option value={25}>
                  25 / page
                </option>

                <option value={50}>
                  50 / page
                </option>

                <option value={100}>
                  100 / page
                </option>
              </select>

              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
                ▼
              </span>
            </div>
          </div>

          {/* =================================================
              FIRST PAGE
          ================================================= */}

          <button
            type="button"
            disabled={
              safeCurrentPage === 1
            }
            onClick={handleFirst}
            aria-label="First page"
            title="First page"
            className={navigationButtonClass}
          >
            <FiChevronsLeft size={15} />
          </button>

          {/* =================================================
              PREVIOUS
          ================================================= */}

          <button
            type="button"
            disabled={
              safeCurrentPage === 1
            }
            onClick={handlePrevious}
            aria-label="Previous page"
            title="Previous page"
            className={navigationButtonClass}
          >
            <FiChevronLeft size={16} />

            <span className="hidden sm:inline">
              Previous
            </span>
          </button>

          {/* =================================================
              PAGE NUMBERS
          ================================================= */}

          <div className="flex min-w-0 shrink-0 items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {getPageNumbers().map(
              (page, index) => {
                // ---------------------------------------------
                // ELLIPSIS
                // ---------------------------------------------

                if (page === "...") {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="flex h-8 min-w-7 items-center justify-center px-1 text-xs font-bold text-gray-400"
                    >
                      •••
                    </span>
                  );
                }

                // ---------------------------------------------
                // PAGE BUTTON
                // ---------------------------------------------

                const isActive =
                  safeCurrentPage === page;

                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() =>
                      handlePageChange(page)
                    }
                    aria-current={
                      isActive
                        ? "page"
                        : undefined
                    }
                    aria-label={`Go to page ${page}`}
                    className={[
                      "flex h-8 min-w-8",
                      "items-center justify-center",
                      "rounded-lg px-2",
                      "text-xs font-bold",
                      "transition-all duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600",
                    ].join(" ")}
                  >
                    {page}
                  </button>
                );
              }
            )}
          </div>

          {/* =================================================
              NEXT
          ================================================= */}

          <button
            type="button"
            disabled={
              safeCurrentPage >=
              safeTotalPages
            }
            onClick={handleNext}
            aria-label="Next page"
            title="Next page"
            className={navigationButtonClass}
          >
            <span className="hidden sm:inline">
              Next
            </span>

            <FiChevronRight size={16} />
          </button>

          {/* =================================================
              LAST PAGE
          ================================================= */}

          <button
            type="button"
            disabled={
              safeCurrentPage >=
              safeTotalPages
            }
            onClick={handleLast}
            aria-label="Last page"
            title="Last page"
            className={navigationButtonClass}
          >
            <FiChevronsRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableFooter;