import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router";

const HistoryModal = ({
  isOpen,
  onClose,
  history,
  loading,
  factoryCardId,
}) => {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const formatFieldName = (field) => {
    const fieldNames = {
      customer: "Customer",
      partNumber: "Part Number",
      jobOrder: "Job Order",
      type: "Type",
      prf: "PRF",
      status: "Status",
    };

    return fieldNames[field] || field;
  };

  const formatValue = (field, value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    if (field === "prf") {
      return value ? "Yes" : "No";
    }

    return String(value);
  };

  const handleSeeMore = () => {
    if (!factoryCardId) {
      return;
    }

    const storedUser = localStorage.getItem("user");

    let role = "";

    try {
      const parsedUser = JSON.parse(
        storedUser || "{}"
      );

      role = String(
        parsedUser?.role || ""
      ).toLowerCase();
    } catch {
      role = "";
    }

    const basePath =
      role === "employee"
        ? "/employee/development/factorycard"
        : "/admin/development/factorycard";

    onClose();

    navigate(
      `${basePath}/${factoryCardId}/history`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Factory Card History
            </h2>

            <p className="text-sm text-gray-500">
              Changes made to this factory card
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-137.5 overflow-y-auto p-6">
          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading history...
            </div>
          ) : !history || history.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No changes have been recorded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((record) => (
                <div
                  key={record._id}
                  className="relative border-l-2 border-indigo-200 pl-6"
                >
                  {/* TIMELINE DOT */}
                  <span className="absolute -left-1.75 top-1 h-3 w-3 rounded-full bg-indigo-600" />

                  {/* DATE */}
                  <p className="text-xs font-medium text-gray-500">
                    {formatDate(record.changedAt)}
                  </p>

                  {/* USER INFORMATION */}
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-500">
                        Changed by:
                      </span>{" "}
                      <span className="font-semibold text-gray-900">
                        {record.changedBy?.name ||
                          "Unknown User"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-500">
                        Role:
                      </span>{" "}
                      <span className="capitalize">
                        {record.changedBy?.role || "-"}
                      </span>
                    </p>

                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-500">
                        Position:
                      </span>{" "}
                      {record.changedBy?.position || "-"}
                    </p>
                  </div>

                  {/* ACTION */}
                  <p className="mt-3 text-base font-semibold text-gray-900">
                    {record.action}
                  </p>

                  {/* CHANGED FIELDS */}
                  {record.changedFields?.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {record.changedFields.map(
                        (change, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                          >
                            <p className="mb-2 text-sm font-semibold text-gray-700">
                              {formatFieldName(
                                change.field
                              )}
                            </p>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              {/* PREVIOUS */}
                              <div className="flex-1">
                                <p className="mb-1 text-xs text-gray-400">
                                  Previous
                                </p>

                                <div className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
                                  {formatValue(
                                    change.field,
                                    change.oldValue
                                  )}
                                </div>
                              </div>

                              {/* ARROW */}
                              <div className="hidden text-lg text-gray-400 sm:block">
                                →
                              </div>

                              {/* NEW */}
                              <div className="flex-1">
                                <p className="mb-1 text-xs text-gray-400">
                                  New
                                </p>

                                <div className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-600">
                                  {formatValue(
                                    change.field,
                                    change.newValue
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* NOTE */}
                  {record.note?.trim() && (
                    <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">
                        Note
                      </p>

                      <p className="whitespace-pre-wrap text-sm text-gray-700">
                        {record.note}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t bg-gray-50 px-6 py-3">
          {/* SEE MORE */}
          {history?.length > 0 && factoryCardId ? (
            <button
              type="button"
              onClick={handleSeeMore}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              See More
            </button>
          ) : (
            <div />
          )}

          {/* CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;