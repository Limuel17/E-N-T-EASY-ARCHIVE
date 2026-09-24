import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdHistory } from "react-icons/md";

// ============================================================
// TYPE STYLING
// ============================================================

const getTypeClass = (type) => {
  switch (String(type || "").trim().toLowerCase()) {
    case "rsc":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "pad":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "other":
      return "border-gray-200 bg-gray-50 text-gray-600";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

// ============================================================
// STATUS STYLING
// ============================================================

const getStatusClass = (status) => {
  switch (String(status || "").trim().toLowerCase()) {
    case "in":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "out":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "missing":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

// ============================================================
// STATUS DOT
// ============================================================

const getStatusDotClass = (status) => {
  switch (String(status || "").trim().toLowerCase()) {
    case "in":
      return "bg-emerald-500";

    case "out":
      return "bg-rose-500";

    case "missing":
      return "bg-amber-500";

    default:
      return "bg-gray-400";
  }
};

// ============================================================
// STATUS LABEL
// ============================================================

const getStatusLabel = (status) => {
  switch (String(status || "").trim().toLowerCase()) {
    case "in":
      return "IN";

    case "out":
      return "OUT";

    case "missing":
      return "MISSING";

    default:
      return "-";
  }
};

// ============================================================
// TABLE TBODY
// ============================================================

const TableTbody = ({
  filteredItems = [],
  onEdit,
  onHistory,
  readOnly = false,
}) => {
  const canEdit =
    !readOnly && typeof onEdit === "function";

  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (!filteredItems.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={7} className="px-6 py-20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-linear-to-br from-gray-50 to-gray-100 shadow-sm">
                <MdHistory className="text-4xl text-gray-300" />
              </div>

              <h3 className="mt-5 text-base font-bold text-gray-700">
                No factory card items found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                There are no records matching your current
                search or filter.
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  // ==========================================================
  // TABLE ROWS
  // ==========================================================

  return (
    <tbody className="divide-y divide-gray-100">
      {filteredItems.map((item) => {
        const itemId = item._id || item.id;
        const type = item.type || "";
        const status = item.status || "";

        return (
          <tr
            key={itemId}
            onClick={() => {
              if (canEdit) {
                onEdit(item);
              }
            }}
            className={[
              "group",
              "transition-all duration-200",
              canEdit
                ? "cursor-pointer hover:bg-indigo-50/40"
                : "hover:bg-gray-50/70",
            ].join(" ")}
          >
            {/* CUSTOMER */}
            <td className="w-50 min-w-50 max-w-65 border-r border-gray-100 px-5 py-4 align-middle">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400 ring-2 ring-indigo-100 transition-all duration-200 group-hover:bg-indigo-500 group-hover:ring-indigo-200" />

                  <p
                    className="truncate text-sm font-bold text-gray-800 transition-colors duration-200 group-hover:text-indigo-700"
                    title={item.customer || ""}
                  >
                    {item.customer || "-"}
                  </p>
                </div>
              </div>
            </td>

            {/* PART NUMBER */}
            <td className="w-70 min-w-70 border-r border-gray-100 px-5 py-4 align-middle">
              {item.partNumber ? (
                <div
                  className={[
                    "inline-flex max-w-full items-center",
                    "whitespace-nowrap rounded-xl",
                    "border border-gray-200 bg-gray-50",
                    "px-3.5 py-2",
                    "shadow-sm",
                    "transition-all duration-200",
                    "group-hover:border-indigo-200",
                    "group-hover:bg-white",
                    "group-hover:shadow-md",
                  ].join(" ")}
                  title={item.partNumber}
                >
                  <span className="mr-2 h-2 w-2 shrink-0 rounded-full bg-indigo-400 ring-2 ring-indigo-100" />

                  <span className="max-w-57.5 truncate font-mono text-xs font-bold tracking-tight text-gray-700">
                    {item.partNumber}
                  </span>
                </div>
              ) : (
                <span className="text-sm font-medium text-gray-300">
                  —
                </span>
              )}
            </td>

            {/* JOB ORDER */}
            <td className="w-42.5 min-w-42.5 border-r border-gray-100 px-5 py-4 text-center align-middle">
              {item.jobOrder?.trim() ? (
                <span
                  className={[
                    "inline-flex max-w-36.25 items-center",
                    "overflow-hidden text-ellipsis whitespace-nowrap",
                    "rounded-xl border border-slate-200",
                    "bg-slate-50 px-3.5 py-2",
                    "font-mono text-xs font-bold text-slate-700",
                    "shadow-sm",
                    "transition-all duration-200",
                    "group-hover:border-slate-300",
                    "group-hover:bg-white",
                    "group-hover:shadow-md",
                  ].join(" ")}
                  title={item.jobOrder}
                >
                  {item.jobOrder}
                </span>
              ) : (
                <span className="text-sm font-medium text-gray-300">
                  —
                </span>
              )}
            </td>

            {/* TYPE */}
            <td className="w-37.5 min-w-37.5 border-r border-gray-100 px-5 py-4 text-center align-middle">
              <span
                className={[
                  "inline-flex min-w-20 items-center justify-center",
                  "rounded-full border",
                  "px-3.5 py-1.5",
                  "text-xs font-bold uppercase",
                  "shadow-sm",
                  "transition-all duration-200",
                  "group-hover:shadow",
                  getTypeClass(type),
                ].join(" ")}
              >
                {type || "-"}
              </span>
            </td>

            {/* PRF */}
            <td className="w-31.25 min-w-31.25 border-r border-gray-100 px-5 py-4 text-center align-middle">
              {item.prf ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm transition-all duration-200 group-hover:border-emerald-300 group-hover:bg-emerald-100">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                    <IoIosCheckmarkCircle className="text-base text-emerald-500" />
                  </span>

                  <span>YES</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />

                  <span>N/A</span>
                </span>
              )}
            </td>

            {/* STATUS */}
            <td className="w-41.25 min-w-41.25 border-r border-gray-100 px-5 py-4 text-center align-middle">
              <span
                className={[
                  "inline-flex items-center gap-2",
                  "rounded-full border",
                  "px-3.5 py-1.5",
                  "text-[11px] font-extrabold tracking-wide",
                  "shadow-sm",
                  "transition-all duration-200",
                  "group-hover:shadow",
                  getStatusClass(status),
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2.5 w-2.5 shrink-0 rounded-full",
                    "ring-2 ring-white/80",
                    getStatusDotClass(status),
                  ].join(" ")}
                />

                {getStatusLabel(status)}
              </span>
            </td>

            {/* HISTORY */}
            <td className="w-36.25 min-w-36.25 px-5 py-4 text-center align-middle">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  if (typeof onHistory === "function") {
                    onHistory(item);
                  }
                }}
                className={[
                  "inline-flex items-center gap-2",
                  "rounded-xl border border-indigo-100",
                  "bg-white px-3.5 py-2",
                  "text-xs font-bold text-indigo-600",
                  "shadow-sm",
                  "transition-all duration-200",
                  "hover:-translate-y-0.5",
                  "hover:border-indigo-200",
                  "hover:bg-indigo-50",
                  "hover:text-indigo-700",
                  "hover:shadow-md",
                  "active:translate-y-0",
                  "focus:outline-none",
                  "focus:ring-2 focus:ring-indigo-200",
                  "focus:ring-offset-1",
                ].join(" ")}
                title="View factory card history"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 transition-colors duration-200 group-hover:bg-indigo-100">
                  <MdHistory className="text-base text-indigo-500" />
                </span>

                <span>History</span>
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default TableTbody;