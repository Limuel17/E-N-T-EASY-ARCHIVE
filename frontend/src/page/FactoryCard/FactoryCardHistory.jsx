
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import { IoArrowBack } from "react-icons/io5";

const API_URL = "/api/factory-cards";

const FactoryCardHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // AUTH CONFIG
  // =========================================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =========================================================
  // FETCH HISTORY
  // =========================================================

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/${id}/history`,
          getAuthConfig()
        );

        setHistory(
          Array.isArray(response.data?.history)
            ? response.data.history
            : []
        );
      } catch (error) {
        console.error(
          "FAILED TO GET HISTORY:",
          error.response?.data || error.message
        );

        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [id]);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsedDate);
  };

  // =========================================================
  // FORMAT FIELD NAME
  // =========================================================

  const formatFieldName = (field) => {
    const fieldNames = {
      customer: "Customer",
      partNumber: "Part Number",
      jobOrder: "Job Order",
      type: "Type",
      prf: "PRF",
      status: "Status",
      note: "Note",
    };

    return fieldNames[field] || field;
  };

  // =========================================================
  // FORMAT VALUE
  // =========================================================

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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-5">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Factory Card History
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Complete history of changes made to this
            factory card
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
        >
          <IoArrowBack />
          Back
        </button>
      </div>

      {/* HISTORY TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-gray-500">
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No history records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-275 text-left text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Changed By
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Role
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Position
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Action
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Changes
                  </th>

                  <th className="px-5 py-4 font-semibold text-gray-700">
                    Note
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {history.map((record) => (
                  <tr
                    key={record._id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* DATE */}

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(record.changedAt)}
                    </td>

                    {/* CHANGED BY */}

                    <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-900">
                      {record.changedBy?.name ||
                        "Unknown User"}
                    </td>

                    {/* ROLE */}

                    <td className="whitespace-nowrap px-5 py-4 capitalize text-gray-600">
                      {record.changedBy?.role || "-"}
                    </td>

                    {/* POSITION */}

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {record.changedBy?.position || "-"}
                    </td>

                    {/* ACTION */}

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          record.action === "Created"
                            ? "bg-green-100 text-green-700"
                            : record.action === "Updated"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.action}
                      </span>
                    </td>

                    {/* CHANGES */}

                    <td className="min-w-87.5 px-5 py-4">
                      {record.changedFields?.length > 0 ? (
                        <div className="space-y-2">
                          {record.changedFields.map(
                            (change, index) => (
                              <div
                                key={`${change.field}-${index}`}
                                className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                              >
                                <p className="font-semibold text-gray-700">
                                  {formatFieldName(
                                    change.field
                                  )}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                    {formatValue(
                                      change.field,
                                      change.oldValue
                                    )}
                                  </span>

                                  <span className="text-gray-400">
                                    →
                                  </span>

                                  <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-600">
                                    {formatValue(
                                      change.field,
                                      change.newValue
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          No field changes
                        </span>
                      )}
                    </td>

                    {/* NOTE */}

                    <td className="min-w-62.5 px-5 py-4">
                      {record.note?.trim() ? (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                          <p className="whitespace-pre-wrap text-sm text-gray-700">
                            {record.note}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryCardHistory;