import {
  FiEye,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiMail,
} from "react-icons/fi";

// =========================================================
// HELPERS
// =========================================================

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// =========================================================
// PRIORITY
// =========================================================

const getPriorityClass = (priority) => {
  switch (priority) {
    case "Urgent":
      return "border-red-200 bg-red-50 text-red-700";

    case "High":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "Medium":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "Low":
      return "border-green-200 bg-green-50 text-green-700";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

const getPriorityDotClass = (priority) => {
  switch (priority) {
    case "Urgent":
      return "bg-red-500";

    case "High":
      return "bg-orange-500";

    case "Medium":
      return "bg-yellow-500";

    case "Low":
      return "bg-green-500";

    default:
      return "bg-gray-400";
  }
};

// =========================================================
// STATUS
// =========================================================

const getStatusClass = (status) => {
  switch (status) {
    case "Open":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "In Progress":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "Resolved":
      return "border-green-200 bg-green-50 text-green-700";

    case "Closed":
      return "border-gray-200 bg-gray-50 text-gray-600";

    default:
      return "border-gray-200 bg-gray-50 text-gray-600";
  }
};

const getStatusDotClass = (status) => {
  switch (status) {
    case "Open":
      return "bg-blue-500";

    case "In Progress":
      return "bg-yellow-500";

    case "Resolved":
      return "bg-green-500";

    case "Closed":
      return "bg-gray-400";

    default:
      return "bg-gray-400";
  }
};

// =========================================================
// TICKET TABLE
// =========================================================

const TicketTable = ({
  tickets = [],
  loading = false,
  isAdmin = false,
  onView,
  onSolve,
  onDelete,
}) => {
  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-h-72 flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading tickets...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // EMPTY
  // =======================================================

  if (!tickets.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <FiCheckCircle size={30} />
          </div>

          <h3 className="mt-5 text-base font-semibold text-gray-800">
            No tickets found
          </h3>

          <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-500">
            {isAdmin
              ? "There are currently no ticket requests in the system."
              : "You have not submitted any ticket requests yet."}
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // TABLE
  // =======================================================

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* ===================================================
          TABLE HEADER BAR
      =================================================== */}

      <div className="flex flex-col gap-1 border-b border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Ticket Requests
          </h3>

          <p className="mt-0.5 text-xs text-gray-500">
            {tickets.length}{" "}
            {tickets.length === 1 ? "ticket" : "tickets"} found
          </p>
        </div>

        {isAdmin && (
          <div className="hidden items-center gap-2 text-xs text-gray-400 sm:flex">
            <FiEye size={14} />
            <span>View</span>

            <span className="mx-1 text-gray-300">•</span>

            <FiCheckCircle size={14} />
            <span>Solve</span>

            <span className="mx-1 text-gray-300">•</span>

            <FiTrash2 size={14} />
            <span>Delete</span>
          </div>
        )}
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="overflow-x-auto">
        <table className="min-w-375 w-full border-collapse">
          {/* =================================================
              THEAD
          ================================================= */}

          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b border-gray-200">
              {/* NAME */}

              <th className="whitespace-nowrap border-r border-gray-100 px-5 py-4 text-left">
                <div className="flex items-center gap-2">
                  <FiUser className="text-gray-400" />

                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Name
                  </span>
                </div>
              </th>

              {/* POSITION */}

              <th className="whitespace-nowrap px-5 py-4 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Position
                </span>
              </th>

              {/* EMAIL */}

              <th className="w-55 max-w-55 px-5 py-4 text-left">
                <div className="flex items-center gap-2">
                  <FiMail className="text-gray-400" />

                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Email
                  </span>
                </div>
              </th>

              {/* DEPARTMENT */}

              <th className="whitespace-nowrap px-5 py-4 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Department
                </span>
              </th>

              {/* PRIORITY */}

              <th className="whitespace-nowrap px-5 py-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Priority
                </span>
              </th>

              {/* CONCERN */}

              <th className="min-w-55 px-5 py-4 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Concern
                </span>
              </th>

              {/* NOTE */}

              <th className="min-w-65 px-5 py-4 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Note
                </span>
              </th>

              {/* STATUS */}

              <th className="whitespace-nowrap px-5 py-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Status
                </span>
              </th>

              {/* REQUEST TIME */}

              <th className="whitespace-nowrap px-5 py-4 text-left">
                <div className="flex items-center gap-2">
                  <FiClock className="text-gray-400" />

                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Request Time
                  </span>
                </div>
              </th>

              {/* SOLVED TIME */}

              <th className="whitespace-nowrap px-5 py-4 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Solved Time
                </span>
              </th>

              {/* SOLVED BY */}

              <th className="whitespace-nowrap px-5 py-4 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Solved By
                </span>
              </th>

              {/* ACTION */}

              {isAdmin && (
                <th className="sticky right-0 whitespace-nowrap border-l border-gray-200 bg-gray-50 px-5 py-4 text-center shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.2)]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Action
                  </span>
                </th>
              )}
            </tr>
          </thead>

          {/* =================================================
              TBODY
          ================================================= */}

          <tbody className="divide-y divide-gray-100">
            {tickets.map((ticket) => {
              const isSolved =
                ticket.status === "Resolved" ||
                ticket.status === "Closed";

              return (
                <tr
                  key={ticket._id}
                  className="group transition-colors hover:bg-indigo-50/30"
                >
                  {/* =========================================
                      NAME
                  ========================================= */}

                  <td className="border-r border-gray-100 px-5 py-4 align-top">
                    <div className="flex min-w-40 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                        {ticket.name
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </div>

                      <div className="min-w-0">
                        <p
                          className="max-w-45 truncate text-sm font-semibold text-gray-800"
                          title={ticket.name || ""}
                        >
                          {ticket.name || "-"}
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Requester
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* =========================================
                      POSITION
                  ========================================= */}

                  <td className="px-5 py-4 align-top">
                    <div className="max-w-45">
                      <p
                        className="truncate text-sm text-gray-700"
                        title={ticket.position || ""}
                      >
                        {ticket.position || "-"}
                      </p>

                      {ticket.role && (
                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {ticket.role}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* =========================================
                      EMAIL
                  ========================================= */}

                  <td className="w-55 max-w-55 px-5 py-4 align-top">
                    <p
                      className="w-full max-w-55 whitespace-normal wrap-break-words text-sm leading-5 text-gray-600"
                      title={ticket.email || ""}
                    >
                      {ticket.email || "-"}
                    </p>
                  </td>

                  {/* =========================================
                      DEPARTMENT
                  ========================================= */}

                  <td className="px-5 py-4 align-top">
                    <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                      {ticket.department || "-"}
                    </span>
                  </td>

                  {/* =========================================
                      PRIORITY
                  ========================================= */}

                  <td className="px-5 py-4 text-center align-top">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityClass(
                        ticket.priority
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getPriorityDotClass(
                          ticket.priority
                        )}`}
                      />

                      {ticket.priority || "-"}
                    </span>
                  </td>

                  {/* =========================================
                      CONCERN
                  ========================================= */}

                  <td className="px-5 py-4 align-top">
                    <div className="max-w-60">
                      <p
                        className="line-clamp-3 text-sm font-medium leading-5 text-gray-700"
                        title={ticket.concern || ""}
                      >
                        {ticket.concern || "-"}
                      </p>
                    </div>
                  </td>

                  {/* =========================================
                      NOTE
                  ========================================= */}

                  <td className="px-5 py-4 align-top">
                    <div className="max-w-70">
                      <p
                        className="line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-gray-500"
                        title={ticket.note || ""}
                      >
                        {ticket.note || "-"}
                      </p>
                    </div>
                  </td>

                  {/* =========================================
                      STATUS
                  ========================================= */}

                  <td className="px-5 py-4 text-center align-top">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                        ticket.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDotClass(
                          ticket.status
                        )}`}
                      />

                      {ticket.status || "-"}
                    </span>
                  </td>

                  {/* =========================================
                      REQUEST TIME
                  ========================================= */}

                  <td className="whitespace-nowrap px-5 py-4 align-top">
                    <div className="flex items-start gap-2">
                      <FiClock className="mt-0.5 shrink-0 text-gray-400" />

                      <p className="text-sm text-gray-600">
                        {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>
                  </td>

                  {/* =========================================
                      SOLVED TIME
                  ========================================= */}

                  <td className="whitespace-nowrap px-5 py-4 align-top">
                    {ticket.solvedAt ? (
                      <div className="flex items-start gap-2">
                        <FiCheckCircle className="mt-0.5 shrink-0 text-green-500" />

                        <p className="text-sm font-medium text-gray-700">
                          {formatDateTime(ticket.solvedAt)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">-</p>
                    )}
                  </td>

                  {/* =========================================
                      SOLVED BY
                  ========================================= */}

                  <td className="px-5 py-4 align-top">
                    {ticket.solvedBy?.name ? (
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-xs font-bold text-green-700">
                          {ticket.solvedBy.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <p
                          className="max-w-45 truncate text-sm font-semibold text-gray-700"
                          title={ticket.solvedBy.name}
                        >
                          {ticket.solvedBy.name}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex rounded-lg bg-gray-50 px-2.5 py-1 text-xs text-gray-400">
                        Not solved
                      </span>
                    )}
                  </td>

                  {/* =========================================
                      ADMIN ACTIONS
                  ========================================= */}

                  {isAdmin && (
                    <td className="sticky right-0 border-l border-gray-200 bg-white px-5 py-4 align-top shadow-[-4px_0_8px_-6px_rgba(0,0,0,0.2)] transition-colors group-hover:bg-indigo-50/30">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* VIEW */}

                        <button
                          type="button"
                          onClick={() => onView?.(ticket)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 transition hover:border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                          title="View ticket"
                          aria-label="View ticket"
                        >
                          <FiEye size={16} />
                        </button>

                        {/* SOLVE */}

                        <button
                          type="button"
                          onClick={() => onSolve?.(ticket)}
                          disabled={isSolved}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-100 bg-green-50 text-green-600 transition hover:border-green-200 hover:bg-green-100 hover:text-green-700 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                          title={
                            isSolved
                              ? "Ticket already resolved"
                              : "Mark as resolved"
                          }
                          aria-label={
                            isSolved
                              ? "Ticket already resolved"
                              : "Mark as resolved"
                          }
                        >
                          <FiCheckCircle size={16} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => onDelete?.(ticket)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 transition hover:border-red-200 hover:bg-red-100 hover:text-red-700"
                          title="Delete ticket"
                          aria-label="Delete ticket"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===================================================
          TABLE FOOTER
      =================================================== */}

      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3">
        <p className="text-xs text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {tickets.length}
          </span>{" "}
          {tickets.length === 1 ? "ticket" : "tickets"}
        </p>

        <p className="text-[11px] text-gray-400">
          Scroll horizontally to view more
        </p>
      </div>
    </div>
  );
};

export default TicketTable;