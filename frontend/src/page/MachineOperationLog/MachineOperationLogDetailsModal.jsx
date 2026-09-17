
import {
  FiCalendar,
  FiFileText,
  FiX,
} from "react-icons/fi";

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
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DetailItem = ({
  label,
  value,
  fullWidth = false,
}) => {
  return (
    <div
      className={
        fullWidth ? "sm:col-span-2" : ""
      }
    >
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
        {label}
      </p>

      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <p className="wrap-break-words text-sm font-medium text-gray-800">
          {value || "-"}
        </p>
      </div>
    </div>
  );
};

const MachineOperationLogDetailsModal = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!isOpen || !log) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | REQUESTER INFORMATION
  |--------------------------------------------------------------------------
  |
  | Your current MachineOperationLog model stores
  | requestedBy as a String, not an object.
  |
  | Therefore we support both:
  |
  | requestedBy: "John"
  |
  | and, if your backend later returns an object:
  |
  | requestedBy: {
  |   name,
  |   position,
  |   email
  | }
  |
  */

  const requesterName =
    typeof log.requestedBy === "object"
      ? log.requestedBy?.name || "-"
      : log.requestedBy || "-";

  const requesterPosition =
    typeof log.requestedBy === "object"
      ? log.requestedBy?.position || "-"
      : "-";

  const requesterEmail =
    typeof log.requestedBy === "object"
      ? log.requestedBy?.email || "-"
      : "-";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        {/* -------------------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------------------- */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FiFileText className="text-xl" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                Machine Operation Log
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                View machine operation record details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* CONTENT */}
        {/* -------------------------------------------------------------- */}

        <div className="overflow-y-auto p-5 sm:p-7">
          {/* ------------------------------------------------------------ */}
          {/* REQUESTER SUMMARY */}
          {/* ------------------------------------------------------------ */}

          <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* REQUESTER */}

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                  {requesterName
                    .charAt(0)
                    .toUpperCase() || "?"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {requesterName}
                  </p>

                  {requesterPosition !== "-" && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {requesterPosition}
                    </p>
                  )}

                  {requesterEmail !== "-" && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {requesterEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* REQUEST DATE */}

              <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                <FiCalendar className="shrink-0 text-indigo-500" />

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                    Request Date
                  </p>

                  <p className="text-xs font-semibold text-gray-700">
                    {formatDateTime(log.date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* MACHINE INFORMATION */}
          {/* ------------------------------------------------------------ */}

          <div className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-indigo-600" />

              <h3 className="text-sm font-bold text-gray-800">
                Machine Information
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Customer"
                value={log.customer}
              />

              <DetailItem
                label="Item Description"
                value={log.itemDescription}
              />

              <DetailItem
                label="Dimension"
                value={log.dimension}
              />

              <DetailItem
                label="Flute"
                value={log.flute}
              />

              <DetailItem
                label="Joint"
                value={log.joint}
              />

              <DetailItem
                label="Box Type"
                value={log.boxType}
              />

              <DetailItem
                label="Code"
                value={log.code}
              />

              <DetailItem
                label="Date"
                value={formatDateTime(log.date)}
              />

              <DetailItem
                label="Remarks"
                value={log.remarks}
                fullWidth
              />
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* REQUEST INFORMATION */}
          {/* ------------------------------------------------------------ */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-indigo-600" />

              <h3 className="text-sm font-bold text-gray-800">
                Request Information
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Requested By"
                value={requesterName}
              />

              <DetailItem
                label="Position"
                value={requesterPosition}
              />
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------- */}
        {/* FOOTER */}
        {/* -------------------------------------------------------------- */}

        <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 sm:px-7">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineOperationLogDetailsModal;

