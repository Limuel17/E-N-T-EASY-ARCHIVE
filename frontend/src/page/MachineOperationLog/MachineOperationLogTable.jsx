import {
  FiChevronDown,
  FiChevronUp,
  FiEdit2,
  FiEye,
  FiTrash2,
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
    month: "short",
    day: "2-digit",
  });
};

const SortButton = ({
  label,
  field,
  sortConfig,
  onSort,
}) => {
  const currentIndex = sortConfig.findIndex(
    (item) => item.field === field
  );

  const currentSort =
    currentIndex >= 0
      ? sortConfig[currentIndex]
      : null;

  const handleClick = () => {
    onSort(field);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-1.5 whitespace-nowrap text-left text-xs font-bold uppercase tracking-wide transition ${
        currentSort
          ? "text-indigo-600"
          : "text-gray-500 hover:text-gray-800"
      }`}
    >
      {label}

      {currentSort && (
        <span className="flex items-center gap-0.5">
          <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-indigo-100 px-1 text-[9px] font-bold text-indigo-700">
            {currentIndex + 1}
          </span>

          {currentSort.direction === "asc" ? (
            <FiChevronUp className="text-sm" />
          ) : (
            <FiChevronDown className="text-sm" />
          )}
        </span>
      )}
    </button>
  );
};

const MachineOperationLogTable = ({
  logs,
  sortConfig,
  onSort,
  onView,
  onEdit,
  onDelete,
  readOnly = false,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-275 w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Customer"
                  field="customer"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Item Description"
                  field="itemDescription"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Dimension"
                  field="dimension"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Flute"
                  field="flute"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Joint"
                  field="joint"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Box Type"
                  field="boxType"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Code"
                  field="code"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Requested By"
                  field="requestedBy"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                <SortButton
                  label="Date"
                  field="date"
                  sortConfig={sortConfig}
                  onSort={onSort}
                />
              </th>

              <th className="border-r border-gray-100 px-5 py-4 text-left">
                Remarks
              </th>

              <th className="px-5 py-4 text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-6 py-16 text-center"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <FiEye className="text-2xl" />
                    </div>

                    <p className="mt-4 text-sm font-bold text-gray-700">
                      No machine operation logs found
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-400">
                      Machine operation records will
                      appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const requesterName = String(
                  log.requestedBy ?? ""
                ).trim();

                return (
                  <tr
                    key={log._id}
                    className="border-b border-gray-100 transition hover:bg-gray-50/70"
                  >
                    {/* CUSTOMER */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <p
                        className="max-w-40 truncate text-sm font-bold uppercase text-gray-800"
                        title={log.customer || ""}
                      >
                        {log.customer || "-"}
                      </p>
                    </td>

                    {/* ITEM DESCRIPTION */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <p
                        className="max-w-55 truncate text-sm text-gray-700"
                        title={log.itemDescription || ""}
                      >
                        {log.itemDescription || "-"}
                      </p>
                    </td>

                    {/* DIMENSION */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <p
                        className="max-w-35 truncate text-sm text-gray-700"
                        title={log.dimension || ""}
                      >
                        {log.dimension || "-"}
                      </p>
                    </td>

                    {/* FLUTE */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                        {log.flute || "-"}
                      </span>
                    </td>

                    {/* JOINT */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <p className="text-sm text-gray-700">
                        {log.joint || "-"}
                      </p>
                    </td>

                    {/* BOX TYPE */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <p
                        className="max-w-35 truncate text-sm text-gray-700"
                        title={log.boxType || ""}
                      >
                        {log.boxType || "-"}
                      </p>
                    </td>

                    {/* CODE */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <span className="inline-flex rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {log.code || "-"}
                      </span>
                    </td>

                    {/* REQUESTED BY */}


<td className="border-r border-gray-100 px-5 py-4 align-top">
  <div className="flex min-w-40 items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
      {requesterName
        ? requesterName.charAt(0).toUpperCase()
        : "?"}
    </div>

    <div className="min-w-0">
      <p
        className="max-w-40 truncate text-sm font-semibold text-gray-800"
        title={requesterName}
      >
        {requesterName || "-"}
      </p>

      <p className="mt-0.5 max-w-40 truncate text-[11px] text-gray-400">
        Requester
      </p>
    </div>
  </div>
</td>



                    {/* DATE */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <p className="whitespace-nowrap text-sm text-gray-700">
                        {formatDateTime(log.date)}
                      </p>
                    </td>

                    {/* REMARKS */}
                    <td className="border-r border-gray-100 px-5 py-4 align-top">
                      <p
                        className="max-w-55 truncate text-sm text-gray-600"
                        title={log.remarks || ""}
                      >
                        {log.remarks || "-"}
                      </p>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onView(log)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                          title="View"
                        >
                          <FiEye className="text-base" />
                        </button>

                        {!readOnly && (
                          <>
                            <button
                              type="button"
                              onClick={() => onEdit(log)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-amber-50 hover:text-amber-600"
                              title="Edit"
                            >
                              <FiEdit2 className="text-base" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDelete(log)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete"
                            >
                              <FiTrash2 className="text-base" />
                            </button>
                          </>
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
    </div>
  );
};

export default MachineOperationLogTable;