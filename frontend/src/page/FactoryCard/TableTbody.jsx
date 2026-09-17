
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdHistory } from "react-icons/md";

// =========================================================
// TYPE STYLING
// =========================================================

const getTypeClass = (type) => {
  switch (type) {
    case "RSC":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Pad":
      return "border-purple-200 bg-purple-50 text-purple-700";

    case "Other":
      return "border-gray-200 bg-gray-50 text-gray-600";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

// =========================================================
// STATUS STYLING
// =========================================================

const getStatusClass = (status) => {
  switch (status) {
    case "In":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Out":
      return "border-rose-200 bg-rose-50 text-rose-700";

    case "Missing":
      return "border-amber-200 bg-amber-50 text-amber-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

const getStatusDotClass = (status) => {
  switch (status) {
    case "In":
      return "bg-emerald-500";

    case "Out":
      return "bg-rose-500";

    case "Missing":
      return "bg-amber-500";

    default:
      return "bg-gray-400";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "In":
      return "IN";

    case "Out":
      return "OUT";

    case "Missing":
      return "MISSING";

    default:
      return "-";
  }
};

// =========================================================
// TABLE TBODY
// =========================================================

const TableTbody = ({
  filteredItems = [],
  onEdit,
  onHistory,
  readOnly = false,
}) => {
  // =======================================================
  // EMPTY STATE
  // =======================================================

  if (!filteredItems.length) {
    return (
      <tbody>
        <tr>
          <td colSpan={7} className="px-6 py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
                <MdHistory className="text-3xl text-gray-300" />
              </div>

              <h3 className="mt-5 text-sm font-semibold text-gray-700">
                No factory card items found
              </h3>

              <p className="mt-1.5 max-w-sm text-xs leading-5 text-gray-400">
                There are no records matching your current search or filter.
              </p>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  // =======================================================
  // TABLE ROWS
  // =======================================================

  return (
    <tbody className="divide-y divide-gray-100">
      {filteredItems.map((item) => {
        const status = item.status || "";
        const type = item.type || "";

        const canEdit =
          !readOnly && typeof onEdit === "function";

        const itemId = item._id || item.id;

        return (
          <tr
            key={itemId}
            onClick={() => {
              if (canEdit) {
                onEdit(item);
              }
            }}
            className={[
              "group transition-all duration-150",
              canEdit
                ? "cursor-pointer hover:bg-indigo-50/40"
                : "hover:bg-gray-50/80",
            ].join(" ")}
          >
            {/* =================================================
                CUSTOMER
            ================================================= */}

            <td className="min-w-52 border-r border-gray-100 px-5 py-4 align-middle">
              <div className="min-w-0">
                <p
                  className="max-w-60 truncate text-sm font-semibold text-gray-800"
                  title={item.customer || ""}
                >
                  {item.customer || "-"}
                </p>
              </div>
            </td>

            {/* =================================================
                PART NUMBER
            ================================================= */}

            <td className="min-w-45 px-5 py-4 align-middle">
              {item.partNumber ? (
                <div
                  className="inline-flex max-w-48 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 transition-colors group-hover:border-gray-300 group-hover:bg-white"
                  title={item.partNumber}
                >
                  <span className="truncate font-mono text-xs font-medium text-gray-700">
                    {item.partNumber}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-300">
                  —
                </span>
              )}
            </td>

            {/* =================================================
                JOB ORDER
            ================================================= */}

            <td className="min-w-40 px-5 py-4 text-center align-middle">
              {item.jobOrder?.trim() ? (
                <span
                  className="inline-flex max-w-36 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-medium text-slate-700 transition-colors group-hover:border-slate-300 group-hover:bg-white"
                  title={item.jobOrder}
                >
                  {item.jobOrder}
                </span>
              ) : (
                <span className="text-sm text-gray-300">
                  —
                </span>
              )}
            </td>

            {/* =================================================
                TYPE
            ================================================= */}

            <td className="min-w-35 px-5 py-4 text-center align-middle">
              <span
                className={[
                  "inline-flex min-w-18 items-center justify-center",
                  "rounded-full border px-3 py-1.5",
                  "text-xs font-semibold shadow-sm",
                  getTypeClass(type),
                ].join(" ")}
              >
                {type || "-"}
              </span>
            </td>

            {/* =================================================
                PRF
            ================================================= */}

            <td className="min-w-30 px-5 py-4 text-center align-middle">
              {item.prf ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                  <IoIosCheckmarkCircle className="text-base text-emerald-500" />
                  <span>YES</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                  <span>N/A</span>
                </span>
              )}
            </td>

            {/* =================================================
                STATUS
            ================================================= */}

            <td className="min-w-40 px-5 py-4 text-center align-middle">
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full",
                  "border px-3.5 py-1.5",
                  "text-[11px] font-bold tracking-wide shadow-sm",
                  getStatusClass(status),
                ].join(" ")}
              >
                <span
                  className={[
                    "h-2 w-2 rounded-full",
                    "ring-2 ring-white/70",
                    getStatusDotClass(status),
                  ].join(" ")}
                />

                {getStatusLabel(status)}
              </span>
            </td>

            {/* =================================================
                HISTORY
            ================================================= */}

            <td className="min-w-32 px-5 py-4 text-center align-middle">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  if (typeof onHistory === "function") {
                    onHistory(item);
                  }
                }}
                className={[
                  "inline-flex items-center gap-2 rounded-xl",
                  "border border-indigo-100 bg-white px-3 py-2",
                  "text-xs font-semibold text-indigo-600",
                  "shadow-sm transition-all duration-150",
                  "hover:border-indigo-200 hover:bg-indigo-50",
                  "hover:text-indigo-700 hover:shadow",
                  "active:scale-[0.98]",
                  "focus:outline-none focus:ring-2",
                  "focus:ring-indigo-200 focus:ring-offset-1",
                ].join(" ")}
                title="View factory card history"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50">
                  <MdHistory className="text-sm text-indigo-500" />
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

