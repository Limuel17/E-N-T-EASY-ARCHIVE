
import { useEffect, useState } from "react";
import {
  FiX,
  FiPackage,
  FiPlus,
  FiMinus,
  FiEdit2,
  FiClock,
  FiUser,
  FiRefreshCw,
  FiFileText,
} from "react-icons/fi";

const API_URL = "/api/milled-run-sheets";

const getToken = () => {
  return localStorage.getItem("token");
};

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatNumber = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
};

const ModalStockHistory = ({
  isOpen,
  onClose,
  runSheet,
}) => {
  const [movements, setMovements] = useState([]);
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runSheetId = runSheet?._id;

  // ============================================================
  // FETCH HISTORY
  // ============================================================
  useEffect(() => {
    if (!isOpen || !runSheetId) {
      return undefined;
    }

    const controller = new AbortController();

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        const response = await fetch(
          `${API_URL}/${runSheetId}/stock-history`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Failed to fetch stock history."
          );
        }

        setMovements(
          Array.isArray(data?.movements)
            ? data.movements
            : []
        );

        setStock(Number(data?.stock || 0));
      } catch (fetchError) {
        if (fetchError?.name === "AbortError") {
          return;
        }

        console.error(
          "FETCH STOCK HISTORY ERROR:",
          fetchError
        );

        setError(
          fetchError?.message ||
            "Failed to fetch stock history."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      loadHistory();
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, runSheetId]);

  // ============================================================
  // REFRESH
  // ============================================================
  const handleRefresh = async () => {
    if (!runSheetId || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/${runSheetId}/stock-history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to refresh stock history."
        );
      }

      setMovements(
        Array.isArray(data?.movements)
          ? data.movements
          : []
      );

      setStock(Number(data?.stock || 0));
    } catch (refreshError) {
      console.error(
        "REFRESH STOCK HISTORY ERROR:",
        refreshError
      );

      setError(
        refreshError?.message ||
          "Failed to refresh stock history."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CLOSE
  // ============================================================
  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  // ============================================================
  // HISTORY HELPERS
  // ============================================================
  const getActionInfo = (movement) => {
    const action = String(
      movement?.action || ""
    ).toLowerCase();

    if (action === "created") {
      return {
        label: "Created",
        icon: <FiFileText size={13} />,
        className: "bg-blue-100 text-blue-700",
      };
    }

    if (action === "add") {
      return {
        label: "Added",
        icon: <FiPlus size={13} />,
        className: "bg-green-100 text-green-700",
      };
    }

    if (action === "remove") {
      return {
        label: "Removed",
        icon: <FiMinus size={13} />,
        className: "bg-red-100 text-red-700",
      };
    }

    return {
      label: "Stock Adjusted",
      icon: <FiEdit2 size={13} />,
      className: "bg-purple-100 text-purple-700",
    };
  };

  const isCreatedMovement = (movement) => {
    return (
      String(movement?.action || "").toLowerCase() ===
      "created"
    );
  };

  const isAddMovement = (movement) => {
    return (
      String(movement?.action || "").toLowerCase() ===
      "add"
    );
  };

  const isRemoveMovement = (movement) => {
    return (
      String(movement?.action || "").toLowerCase() ===
      "remove"
    );
  };

  const isAdjustmentMovement = (movement) => {
    const action = String(
      movement?.action || ""
    ).toLowerCase();

    return (
      action === "adjustment" ||
      action === "edit"
    );
  };

  const getAdjustment = (movement) => {
    if (isCreatedMovement(movement)) {
      return 0;
    }

    if (isAddMovement(movement)) {
      return Number(movement.quantity || 0);
    }

    if (isRemoveMovement(movement)) {
      return -Number(movement.quantity || 0);
    }

    if (isAdjustmentMovement(movement)) {
      return (
        Number(movement.newStock || 0) -
        Number(movement.oldStock || 0)
      );
    }

    return 0;
  };

  const getAdjustmentText = (movement) => {
    const adjustment = getAdjustment(movement);

    if (adjustment > 0) {
      return `+${formatNumber(adjustment)}`;
    }

    if (adjustment < 0) {
      return formatNumber(adjustment);
    }

    return "0";
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (!isOpen || !runSheet) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <FiPackage size={20} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Stock History
              </h2>

              <p className="text-sm text-gray-500">
                {runSheet.itemCode || "-"}
                {runSheet.supplier
                  ? ` • ${runSheet.supplier}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* SUMMARY */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {/* ITEM CODE */}
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Item Code
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {runSheet.itemCode || "-"}
              </p>
            </div>

            {/* TYPE */}
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Type
              </p>

              <p className="mt-1 font-semibold text-gray-800">
                {runSheet.type || "-"}
              </p>
            </div>

            {/* SPECIFICATION */}
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Specification
              </p>

              <p className="mt-1 truncate font-semibold text-gray-800">
                {runSheet.specification || "-"}
              </p>
            </div>

            {/* CURRENT STOCK */}
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Current Stock
              </p>

              <p className="mt-1 text-xl font-bold text-blue-600">
                {formatNumber(stock)}
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
          {/* MOVEMENT HEADER */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                History Records
              </h3>

              <p className="text-sm text-gray-500">
                {movements.length}{" "}
                {movements.length === 1
                  ? "record"
                  : "records"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                size={15}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* LOADING */}
          {loading && movements.length === 0 && (
            <div className="flex min-h-48 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <FiRefreshCw
                  size={18}
                  className="animate-spin"
                />

                Loading stock history...
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* EMPTY */}
          {!loading &&
            !error &&
            movements.length === 0 && (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 text-center">
                <FiPackage
                  size={32}
                  className="mb-3 text-gray-400"
                />

                <h3 className="font-medium text-gray-700">
                  No stock history
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  No history records have been
                  recorded for this run sheet yet.
                </p>
              </div>
            )}

          {/* HISTORY TABLE */}
          {movements.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-375 w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Action
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Stock Adjustment
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-600">
                      Balance After
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Details
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Remarks
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Performed By
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Date & Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {movements.map((movement) => {
                    const actionInfo =
                      getActionInfo(movement);

                    const created =
                      isCreatedMovement(movement);

                    const add =
                      isAddMovement(movement);

                    const remove =
                      isRemoveMovement(movement);

                    const adjustment =
                      isAdjustmentMovement(movement);

                    const adjustmentValue =
                      getAdjustment(movement);

                    const performedBy =
                      movement.performedBy ||
                      movement.changedBy;

                    return (
                      <tr
                        key={movement._id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                      >
                        {/* ACTION */}
                        <td className="px-4 py-4">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${actionInfo.className}`}
                          >
                            {actionInfo.icon}
                            {actionInfo.label}
                          </div>
                        </td>

                        {/* QUANTITY */}
                        <td className="px-4 py-4 text-right">
                          {created || adjustment ? (
                            <span className="text-gray-400">
                              -
                            </span>
                          ) : (
                            <span
                              className={`font-semibold ${
                                add
                                  ? "text-green-600"
                                  : remove
                                    ? "text-red-600"
                                    : "text-gray-600"
                              }`}
                            >
                              {formatNumber(
                                movement.quantity
                              )}
                            </span>
                          )}
                        </td>

                        {/* STOCK ADJUSTMENT */}
                        <td className="px-4 py-4">
                          {created ? (
                            <span className="text-gray-400">
                              Initial stock
                            </span>
                          ) : adjustment ? (
                            <div className="whitespace-nowrap">
                              <span className="font-semibold text-gray-500">
                                {formatNumber(
                                  movement.oldStock
                                )}
                              </span>

                              <span className="mx-2 text-gray-400">
                                →
                              </span>

                              <span className="font-semibold text-blue-600">
                                {formatNumber(
                                  movement.newStock
                                )}
                              </span>

                              <span
                                className={`ml-2 font-bold ${
                                  adjustmentValue > 0
                                    ? "text-green-600"
                                    : adjustmentValue < 0
                                      ? "text-red-600"
                                      : "text-gray-500"
                                }`}
                              >
                                (
                                {getAdjustmentText(
                                  movement
                                )}
                                )
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`font-semibold ${
                                adjustmentValue > 0
                                  ? "text-green-600"
                                  : adjustmentValue < 0
                                    ? "text-red-600"
                                    : "text-gray-500"
                              }`}
                            >
                              {getAdjustmentText(
                                movement
                              )}
                            </span>
                          )}
                        </td>

                        {/* BALANCE AFTER */}
                        <td className="px-4 py-4 text-right">
                          <span className="font-semibold text-gray-800">
                            {formatNumber(
                              movement.balanceAfter ??
                                movement.newStock ??
                                0
                            )}
                          </span>
                        </td>

                        {/* DETAILS */}
                        <td className="max-w-sm px-4 py-4">
                          {created ? (
                            <div className="space-y-1 text-xs text-gray-600">
                              <p>
                                <span className="font-medium text-gray-700">
                                  Supplier:
                                </span>{" "}
                                {runSheet.supplier || "-"}
                              </p>

                              <p>
                                <span className="font-medium text-gray-700">
                                  Customer:
                                </span>{" "}
                                {runSheet.customer || "-"}
                              </p>

                              <p>
                                <span className="font-medium text-gray-700">
                                  Type:
                                </span>{" "}
                                {runSheet.type || "-"}
                              </p>

                              <p>
                                <span className="font-medium text-gray-700">
                                  Paper:
                                </span>{" "}
                                {runSheet.paperCombination ||
                                  "-"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}
                        </td>

                        {/* REMARKS */}
                        <td className="max-w-xs px-4 py-4">
                          <span className="block max-w-xs truncate text-gray-600">
                            {movement.remarks || "-"}
                          </span>
                        </td>

                        {/* PERFORMED BY */}
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-2">
                            <FiUser
                              size={15}
                              className="mt-0.5 shrink-0 text-gray-400"
                            />

                            <div>
                              <p className="font-medium text-gray-800">
                                {performedBy?.name ||
                                  "Unknown User"}
                              </p>

                              {performedBy?.position && (
                                <p className="text-xs text-gray-500">
                                  {
                                    performedBy.position
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* DATE & TIME */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 whitespace-nowrap text-gray-600">
                            <FiClock
                              size={14}
                              className="shrink-0 text-gray-400"
                            />

                            {formatDateTime(
                              movement.createdAt ||
                                movement.changedAt
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalStockHistory;