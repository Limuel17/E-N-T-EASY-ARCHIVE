import {
  FiX,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString();
};

const TicketDetailsModal = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!isOpen || !ticket) {
    return null;
  }

  const isResolved =
    ticket.status === "Resolved" ||
    ticket.status === "Closed";

  const priorityClass =
    ticket.priority === "Urgent"
      ? "bg-red-100 text-red-700"
      : ticket.priority === "High"
        ? "bg-orange-100 text-orange-700"
        : ticket.priority === "Medium"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700";

  const statusClass =
    ticket.status === "Open"
      ? "bg-blue-100 text-blue-700"
      : ticket.status === "In Progress"
        ? "bg-yellow-100 text-yellow-700"
        : ticket.status === "Resolved"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-700";

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Ticket Details
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Complete information for this ticket request.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto px-6 py-6">
          <div className="space-y-6">

            {/* REQUESTER INFORMATION */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Requester Information
              </h3>

              <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 md:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {ticket.name || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Position
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {ticket.position || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                    {ticket.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {ticket.department || "-"}
                  </p>
                </div>
              </div>
            </section>

            {/* TICKET INFORMATION */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Ticket Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* PRIORITY */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-medium text-gray-400">
                    Priority
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}
                    >
                      {ticket.priority || "-"}
                    </span>
                  </div>
                </div>

                {/* STATUS */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-medium text-gray-400">
                    Status
                  </p>

                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                    >
                      {isResolved && (
                        <FiCheckCircle size={13} />
                      )}

                      {ticket.status || "-"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* CONCERN */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Concern
              </h3>

              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6 text-gray-700">
                  {ticket.concern || "-"}
                </p>
              </div>
            </section>

            {/* NOTE */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Note
              </h3>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <p className="whitespace-pre-wrap wrap-break-words text-sm leading-6 text-gray-600">
                  {ticket.note || "-"}
                </p>
              </div>
            </section>

            {/* TIME INFORMATION */}
            <section>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                Time Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* REQUEST TIME */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <FiClock size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                        Request Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatDateTime(
                          ticket.createdAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SOLVED TIME */}
                <div
                  className={`rounded-xl border p-5 ${
                    ticket.solvedAt
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        ticket.solvedAt
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <FiCheckCircle size={19} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          ticket.solvedAt
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        Solved Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {ticket.solvedAt
                          ? formatDateTime(
                              ticket.solvedAt
                            )
                          : "Not solved yet"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;