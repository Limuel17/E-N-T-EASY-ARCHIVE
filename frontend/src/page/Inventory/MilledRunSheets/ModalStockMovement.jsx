import { useEffect, useState } from "react";
import {
  FiX,
  FiPlus,
  FiMinus,
  FiPackage,
} from "react-icons/fi";

const ModalStockMovement = ({
  isOpen,
  onClose,
  onSubmit,
  runSheet,
  action = "add",
  saving = false,
}) => {
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");

  const isAdd = action === "add";
  const currentStock = Number(runSheet?.stock || 0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuantity("");
    setRemarks("");
    setError("");
  }, [isOpen, action, runSheet?._id]);

  if (!isOpen || !runSheet) {
    return null;
  }

  const numericQuantity = Number(quantity);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      quantity === "" ||
      !Number.isFinite(numericQuantity) ||
      numericQuantity <= 0
    ) {
      setError("Please enter a quantity greater than 0.");
      return;
    }

    if (!isAdd && numericQuantity > currentStock) {
      setError(
        `Insufficient stock. Available stock: ${currentStock}.`
      );
      return;
    }

    try {
      await onSubmit({
        quantity: numericQuantity,
        remarks: remarks.trim(),
      });
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          "Failed to update stock."
      );
    }
  };

  const projectedStock = isAdd
    ? currentStock + (Number.isFinite(numericQuantity)
        ? numericQuantity
        : 0)
    : Math.max(
        0,
        currentStock -
          (Number.isFinite(numericQuantity)
            ? numericQuantity
            : 0)
      );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isAdd
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isAdd ? (
                <FiPlus size={20} />
              ) : (
                <FiMinus size={20} />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {isAdd ? "Add Stock" : "Remove Stock"}
              </h2>

              <p className="text-sm text-gray-500">
                Update inventory stock
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {/* Run Sheet Information */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FiPackage className="text-gray-500" />

                <span className="text-sm font-medium text-gray-700">
                  Run Sheet
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">
                    Item Code
                  </p>

                  <p className="font-medium text-gray-800">
                    {runSheet.itemCode || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">
                    Supplier
                  </p>

                  <p className="font-medium text-gray-800">
                    {runSheet.supplier || "-"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-gray-500">
                    Specification
                  </p>

                  <p className="font-medium text-gray-800">
                    {runSheet.specification || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Stock */}
            <div className="rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Current Stock
                </span>

                <span className="text-xl font-bold text-gray-800">
                  {currentStock}
                </span>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="stock-quantity"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Quantity
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <input
                id="stock-quantity"
                type="number"
                min="0.000001"
                step="any"
                value={quantity}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setError("");
                }}
                placeholder="Enter quantity"
                disabled={saving}
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* Projected Stock */}
            {quantity !== "" &&
              Number.isFinite(numericQuantity) &&
              numericQuantity > 0 && (
                <div
                  className={`rounded-lg border px-4 py-3 ${
                    isAdd
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        isAdd
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      Stock After
                    </span>

                    <span
                      className={`text-lg font-bold ${
                        isAdd
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {projectedStock}
                    </span>
                  </div>
                </div>
              )}

            {/* Remarks */}
            <div>
              <label
                htmlFor="stock-remarks"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Remarks
              </label>

              <textarea
                id="stock-remarks"
                rows={3}
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
                placeholder="Enter remarks (optional)"
                disabled={saving}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isAdd
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isAdd ? (
                <FiPlus size={16} />
              ) : (
                <FiMinus size={16} />
              )}

              {saving
                ? "Saving..."
                : isAdd
                ? "Add Stock"
                : "Remove Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalStockMovement;