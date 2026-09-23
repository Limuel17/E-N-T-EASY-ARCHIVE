import { useEffect, useRef, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiCheck,
  FiChevronDown,
  FiClock,
} from "react-icons/fi";

// =========================================================
// SORT BUTTON
// =========================================================

const SortButton = ({
  field,
  direction,
  children,
  sortRules,
  onSortChange,
  onClose,
}) => {
  const rule = sortRules.find(
    (item) => item.field === field
  );

  const selected =
    rule?.direction === direction;

  const handleClick = () => {
    if (typeof onSortChange === "function") {
      onSortChange(field, direction);
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "flex w-full items-center justify-between gap-3",
        "px-3.5 py-2.5 text-left text-sm",
        "transition-colors duration-150",
        selected
          ? "bg-indigo-50 font-semibold text-indigo-700"
          : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
    >
      <span className="flex items-center gap-2">
        {direction === "asc" ? (
          <FiArrowUp
            size={14}
            className={
              selected
                ? "text-indigo-600"
                : "text-gray-400"
            }
          />
        ) : (
          <FiArrowDown
            size={14}
            className={
              selected
                ? "text-indigo-600"
                : "text-gray-400"
            }
          />
        )}

        <span>{children}</span>
      </span>

      {selected && (
        <FiCheck
          size={16}
          className="shrink-0 text-indigo-600"
        />
      )}
    </button>
  );
};

// =========================================================
// SORT MENU
// =========================================================

const SortMenu = ({
  field,
  title,
  sortRules,
  openMenu,
  onToggle,
  children,
  menuRef,
  width = "w-56",
  icon,
}) => {
  const priorityIndex = sortRules.findIndex(
    (rule) => rule.field === field
  );

  const priority =
    priorityIndex === -1
      ? null
      : priorityIndex + 1;

  const isOpen = openMenu === field;
  const isActive = priority !== null;

  return (
    <div
      ref={menuRef}
      className="relative inline-block"
    >
      {/* =================================================
          SORT TRIGGER
      ================================================= */}

      <button
        type="button"
        onClick={() => onToggle(field)}
        className={[
          "group flex items-center gap-1.5",
          "rounded-lg px-2.5 py-1.5",
          "text-xs font-bold uppercase tracking-wide",
          "transition-colors duration-150",
          isOpen || isActive
            ? "bg-indigo-100 text-indigo-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800",
        ].join(" ")}
        title={`Sort ${title}`}
      >
        {icon && (
          <span
            className={
              isOpen || isActive
                ? "text-indigo-600"
                : "text-gray-400"
            }
          >
            {icon}
          </span>
        )}

        <span>{title}</span>

        <FiChevronDown
          size={14}
          className={[
            "transition-transform duration-200",
            isOpen
              ? "rotate-180 text-indigo-600"
              : "text-gray-400",
          ].join(" ")}
        />

        {/* PRIORITY */}

        {priority && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
            {priority}
          </span>
        )}
      </button>

      {/* =================================================
          DROPDOWN
      ================================================= */}

      {isOpen && (
        <div
          className={[
            "absolute left-0 top-full z-50 mt-2",
            width,
            "overflow-hidden rounded-xl",
            "border border-gray-200 bg-white",
            "shadow-2xl ring-1 ring-black/5",
          ].join(" ")}
        >
          {/* MENU HEADER */}

          <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-br from-gray-50 to-white px-3.5 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Sort by
              </p>

              <p className="mt-0.5 text-sm font-semibold text-gray-800">
                {title}
              </p>
            </div>

            {priority && (
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-700">
                Priority #{priority}
              </span>
            )}
          </div>

          {/* MENU OPTIONS */}

          <div className="py-1">
            {children}
          </div>

          {/* ACTIVE SORT FOOTER */}

          {priority && (
            <div className="border-t border-gray-100 bg-gray-50 px-3.5 py-2.5">
              <p className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <FiCheck
                  size={13}
                  className="text-indigo-600"
                />

                <span>
                  This field is part of your multi-sort.
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================
// STATIC TABLE HEADER
// =========================================================

const StaticHeader = ({
  children,
  align = "left",
}) => {
  const alignment =
    align === "center"
      ? "justify-center text-center"
      : "justify-start text-left";

  return (
    <div
      className={[
        "flex items-center",
        alignment,
      ].join(" ")}
    >
      <span className="whitespace-nowrap text-xs font-bold uppercase tracking-wide text-gray-500">
        {children}
      </span>
    </div>
  );
};

// =========================================================
// TABLE THEAD
// =========================================================

const TableThead = ({
  sortRules = [],
  onSortChange,
}) => {
  const [openMenu, setOpenMenu] = useState(null);

  const menuRefs = useRef({});

  // =======================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // =======================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openMenu) {
        return;
      }

      const currentRef =
        menuRefs.current[openMenu];

      if (
        currentRef &&
        !currentRef.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [openMenu]);

  // =======================================================
  // TOGGLE MENU
  // =======================================================

  const handleToggleMenu = (field) => {
    setOpenMenu((current) =>
      current === field ? null : field
    );
  };

  // =======================================================
  // CLOSE MENU
  // =======================================================

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

  // =======================================================
  // MENU REF
  // =======================================================

  const setMenuRef = (field, element) => {
    menuRefs.current[field] = element;
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <thead className="sticky top-0 z-20 bg-gray-50">
      <tr className="border-b border-gray-200 bg-linear-to-b from-gray-50 to-gray-100/90">

        {/* =================================================
            CUSTOMER
        ================================================= */}

        <th className="min-w-50 border-r border-gray-100 px-5 py-3.5 text-left">
          <SortMenu
            field="customer"
            title="Customer"
            sortRules={sortRules}
            openMenu={openMenu}
            onToggle={handleToggleMenu}
            menuRef={(element) =>
              setMenuRef("customer", element)
            }
            width="w-64"
          >
            {/* CUSTOMER SECTION */}

            <div className="border-b border-gray-100 px-3.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Customer Name
              </p>
            </div>

            <SortButton
              field="customer"
              direction="asc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              A → Z
            </SortButton>

            <SortButton
              field="customer"
              direction="desc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              Z → A
            </SortButton>

            {/* CREATED SECTION */}

            <div className="mt-1 border-t border-gray-100 px-3.5 py-2">
              <div className="flex items-center gap-2">
                <FiClock
                  size={13}
                  className="text-gray-400"
                />

                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Created Date
                </p>
              </div>
            </div>

            <SortButton
              field="createdAt"
              direction="desc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              Newest → Oldest
            </SortButton>

            <SortButton
              field="createdAt"
              direction="asc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              Oldest → Newest
            </SortButton>
          </SortMenu>
        </th>

        {/* =================================================
            PART NUMBER
        ================================================= */}

        <th className="min-w-70 border-r border-gray-100 px-5 py-3.5 text-left">
          <StaticHeader>
            Part Number
          </StaticHeader>
        </th>

        {/* =================================================
            JOB ORDER
        ================================================= */}

        <th className="min-w-42.5 border-r border-gray-100 px-5 py-3.5 text-center">
          <StaticHeader align="center">
            Job Order
          </StaticHeader>
        </th>

        {/* =================================================
            TYPE
        ================================================= */}

        <th className="min-w-37.5 border-r border-gray-100 px-5 py-3.5 text-center">
          <SortMenu
            field="type"
            title="Type"
            sortRules={sortRules}
            openMenu={openMenu}
            onToggle={handleToggleMenu}
            menuRef={(element) =>
              setMenuRef("type", element)
            }
            width="w-52"
          >
            <SortButton
              field="type"
              direction="asc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              A → Z
            </SortButton>

            <SortButton
              field="type"
              direction="desc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              Z → A
            </SortButton>
          </SortMenu>
        </th>

        {/* =================================================
            PRF
        ================================================= */}

        <th className="min-w-31.25 border-r border-gray-100 px-5 py-3.5 text-center">
          <SortMenu
            field="prf"
            title="PRF"
            sortRules={sortRules}
            openMenu={openMenu}
            onToggle={handleToggleMenu}
            menuRef={(element) =>
              setMenuRef("prf", element)
            }
            width="w-48"
          >
            <SortButton
              field="prf"
              direction="desc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              Yes → No
            </SortButton>

            <SortButton
              field="prf"
              direction="asc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              No → Yes
            </SortButton>
          </SortMenu>
        </th>

        {/* =================================================
            STATUS
        ================================================= */}

        <th className="min-w-41.25 border-r border-gray-100 px-5 py-3.5 text-center">
          <SortMenu
            field="status"
            title="Status"
            sortRules={sortRules}
            openMenu={openMenu}
            onToggle={handleToggleMenu}
            menuRef={(element) =>
              setMenuRef("status", element)
            }
            width="w-64"
          >
            <SortButton
              field="status"
              direction="asc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              IN → OUT → MISSING
            </SortButton>

            <SortButton
              field="status"
              direction="desc"
              sortRules={sortRules}
              onSortChange={onSortChange}
              onClose={handleCloseMenu}
            >
              MISSING → OUT → IN
            </SortButton>
          </SortMenu>
        </th>

        {/* =================================================
            HISTORY
        ================================================= */}

        <th className="min-w-36.25 px-5 py-3.5 text-center">
          <StaticHeader align="center">
            History
          </StaticHeader>
        </th>
      </tr>
    </thead>
  );
};

export default TableThead;