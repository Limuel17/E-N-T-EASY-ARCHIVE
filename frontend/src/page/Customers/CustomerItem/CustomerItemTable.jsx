import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

import {
  MdAdd,
  MdDeleteOutline,
  MdEdit,
  MdInventory2,
  MdVisibility,
} from "react-icons/md";

import useAlert from "../../../context/useAlert.jsx";
import ModalCustomerItemView from "./ModalCustomerItemView.jsx";

const CUSTOMER_ITEMS_URL = "/api/customer-items";

// ============================================================
// AUTH
// ============================================================

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ============================================================
// CODE NUMBER
// ============================================================
//
// NAIX-01 → 1
// NAIX-02 → 2
// NAIX-10 → 10
//
// ============================================================

const getCodeNumber = (code) => {
  const match = String(code || "").match(
    /-(\d+)$/
  );

  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const number = Number(match[1]);

  return Number.isFinite(number)
    ? number
    : Number.MAX_SAFE_INTEGER;
};

// ============================================================
// SORT BY CODE
// ============================================================

const sortItemsByCode = (items = []) => {
  return [...items].sort((a, b) => {
    const codeNumberA = getCodeNumber(
      a?.code
    );

    const codeNumberB = getCodeNumber(
      b?.code
    );

    if (codeNumberA !== codeNumberB) {
      return codeNumberA - codeNumberB;
    }

    return String(a?.code || "").localeCompare(
      String(b?.code || ""),
      undefined,
      {
        sensitivity: "base",
        numeric: true,
      }
    );
  });
};

// ============================================================
// MM → INCHES
// ============================================================

const mmToInches = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  return (number / 25.4).toFixed(2);
};

// ============================================================
// DIMENSION FORMATTER
//
// Width × Length × Height
//
// Example:
//
// 150 × 650 × 200 mm
// 5.91 × 25.59 × 7.87 in
//
// ============================================================

const formatDimension = (item) => {
  const width = Number(item?.widthMM);
  const length = Number(item?.lengthMM);
  const height = Number(item?.heightMM);

  const hasWidth =
    Number.isFinite(width) && width > 0;

  const hasLength =
    Number.isFinite(length) && length > 0;

  const hasHeight =
    Number.isFinite(height) && height > 0;

  if (!hasWidth && !hasLength && !hasHeight) {
    return (
      <span className="text-gray-400">
        —
      </span>
    );
  }

  const widthDisplay = hasWidth
    ? String(width)
    : "—";

  const lengthDisplay = hasLength
    ? String(length)
    : "—";

  const heightDisplay = hasHeight
    ? String(height)
    : "—";

  const widthInches = hasWidth
    ? mmToInches(width)
    : "—";

  const lengthInches = hasLength
    ? mmToInches(length)
    : "—";

  const heightInches = hasHeight
    ? mmToInches(height)
    : "—";

  return (
    <div className="min-w-44 space-y-1">
      {/* MILLIMETERS */}
      <div
        className="whitespace-nowrap text-sm font-bold text-gray-800"
        title="Width × Length × Height"
      >
        {widthDisplay} × {lengthDisplay} ×{" "}
        {heightDisplay}{" "}
        <span className="text-[10px] font-bold uppercase text-gray-400">
          mm
        </span>
      </div>

      {/* INCHES */}
      <div
        className="whitespace-nowrap text-xs font-medium text-gray-400"
        title="Width × Length × Height in inches"
      >
        {widthInches} × {lengthInches} ×{" "}
        {heightInches}{" "}
        <span className="text-[10px] font-semibold uppercase">
          in
        </span>
      </div>
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const CustomerItemTable = ({
  customerId,
  onAddItem,
  onEditItem,
}) => {
  const { showAlert } = useAlert();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] =
    useState(null);
  const [viewingItem, setViewingItem] =
    useState(null);

  // ==========================================================
  // LOAD ITEMS
  // ==========================================================

  const loadItems = useCallback(
    async (showLoading = true) => {
      if (!customerId) {
        setItems([]);
        setLoading(false);
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        setItems([]);
        setLoading(false);

        showAlert(
          "error",
          "Authentication Error",
          "Authentication token not found."
        );

        return;
      }

      try {
        if (showLoading) {
          setLoading(true);
        }

        const response =
          await axios.get(
            `${CUSTOMER_ITEMS_URL}/customer/${customerId}`,
            getAuthConfig()
          );

        const data = Array.isArray(
          response.data?.items
        )
          ? response.data.items
          : [];

        setItems(sortItemsByCode(data));
      } catch (error) {
        console.error(
          "FAILED TO LOAD CUSTOMER ITEMS:",
          error.response?.data ||
            error.message
        );

        setItems([]);

        showAlert(
          "error",
          "Load Failed",
          error.response?.data?.message ||
            "Failed to load customer items."
        );
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [customerId, showAlert]
  );

  // ==========================================================
  // INITIAL LOAD
  //
  // Deferred to avoid:
  // react-hooks/set-state-in-effect
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadItems();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadItems]);

  // ==========================================================
  // REFRESH AFTER SAVE
  // ==========================================================

  useEffect(() => {
    const handleCustomerItemSaved = () => {
      void loadItems(false);
    };

    window.addEventListener(
      "customer-item-saved",
      handleCustomerItemSaved
    );

    return () => {
      window.removeEventListener(
        "customer-item-saved",
        handleCustomerItemSaved
      );
    };
  }, [loadItems]);

  // ==========================================================
  // SORTED ITEMS
  // ==========================================================

  const sortedItems = useMemo(() => {
    return sortItemsByCode(items);
  }, [items]);

  // ==========================================================
  // VIEW ITEM
  // ==========================================================

  const handleView = useCallback((item) => {
    if (!item) {
      return;
    }

    setViewingItem(item);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewingItem(null);
  }, []);

  // ==========================================================
  // DELETE ITEM
  // ==========================================================

  const handleDelete = useCallback(
    async (item) => {
      const itemId =
        item?._id || item?.id;

      if (!itemId) {
        showAlert(
          "error",
          "Invalid Item",
          "Item ID was not found."
        );

        return;
      }

      const itemName =
        item?.name ||
        item?.code ||
        "this item";

      const confirmed =
        window.confirm(
          `Delete item "${itemName}"?`
        );

      if (!confirmed) {
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        showAlert(
          "error",
          "Authentication Error",
          "Authentication token not found."
        );

        return;
      }

      try {
        setDeletingId(itemId);

        await axios.delete(
          `${CUSTOMER_ITEMS_URL}/${itemId}`,
          getAuthConfig()
        );

        // Remove immediately from UI.
        setItems((previousItems) =>
          previousItems.filter(
            (currentItem) =>
              (currentItem?._id ||
                currentItem?.id) !==
              itemId
          )
        );

        // Close view modal if the deleted
        // item was currently being viewed.
        setViewingItem((currentItem) => {
          if (!currentItem) {
            return null;
          }

          const currentItemId =
            currentItem?._id ||
            currentItem?.id;

          return currentItemId === itemId
            ? null
            : currentItem;
        });

        showAlert(
          "success",
          "Item Deleted",
          "The customer item was deleted and the item codes were renumbered successfully."
        );

        // Reload from backend so the UI gets
        // the newly assigned sequential codes.
        await loadItems(false);
      } catch (error) {
        console.error(
          "FAILED TO DELETE CUSTOMER ITEM:",
          error.response?.data ||
            error.message
        );

        showAlert(
          "error",
          "Delete Failed",
          error.response?.data?.message ||
            "Failed to delete customer item."
        );
      } finally {
        setDeletingId(null);
      }
    },
    [loadItems, showAlert]
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* TITLE */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MdInventory2 className="text-xl" />
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Items
                </h2>

                <p className="text-xs text-gray-500">
                  Items associated with this customer
                </p>
              </div>
            </div>

            {/* ITEM COUNT + ADD BUTTON */}
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">
                  {sortedItems.length}
                </span>{" "}
                {sortedItems.length === 1
                  ? "item"
                  : "items"}
              </div>

              <button
                type="button"
                onClick={onAddItem}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
              >
                <MdAdd className="text-xl" />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-275 w-full table-auto text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <TableHeader>
                  #
                </TableHeader>

                <TableHeader>
                  Code
                </TableHeader>

                <TableHeader>
                  Name
                </TableHeader>

                <TableHeader>
                  Description
                </TableHeader>

                <TableHeader>
                  Product Type
                </TableHeader>

                <TableHeader>
                  Dimension
                </TableHeader>

                <TableHeader>
                  Print Type
                </TableHeader>

                <TableHeader align="right">
                  Action
                </TableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center"
                  >
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading items...
                    </p>
                  </td>
                </tr>
              ) : sortedItems.length > 0 ? (
                /* ==================================================
                    ITEMS
                ================================================== */

                sortedItems.map(
                  (item, index) => {
                    const itemId =
                      item?._id ||
                      item?.id;

                    const isDeleting =
                      deletingId ===
                      itemId;

                    return (
                      <tr
                        key={itemId}
                        className="transition hover:bg-emerald-50/40"
                      >
                        {/* NUMBER */}
                        <td className="whitespace-nowrap px-5 py-4 text-gray-400">
                          {index + 1}
                        </td>

                        {/* CODE */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="inline-flex min-w-18 items-center justify-center rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700">
                            {item?.code ||
                              "—"}
                          </span>
                        </td>

                        {/* NAME */}
                        <td className="max-w-60 px-5 py-4">
                          <p
                            className="font-semibold text-gray-900"
                            title={
                              item?.name ||
                              ""
                            }
                          >
                            {item?.name ||
                              "—"}
                          </p>
                        </td>

                        {/* DESCRIPTION */}
                        <td className="max-w-70 px-5 py-4">
                          <p
                            className="wrap-break-words text-gray-600"
                            title={
                              item?.description ||
                              ""
                            }
                          >
                            {item?.description ||
                              "—"}
                          </p>
                        </td>

                        {/* PRODUCT TYPE */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {item?.productType ||
                              "—"}
                          </span>
                        </td>

                        {/* DIMENSION */}
                        <td
                          className="px-5 py-4"
                          title="Width × Length × Height"
                        >
                          {formatDimension(
                            item
                          )}
                        </td>

                        {/* PRINT TYPE */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                            {item?.printingType ||
                              "—"}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {/* VIEW */}
                            <button
                              type="button"
                              onClick={() =>
                                handleView(
                                  item
                                )
                              }
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                              title="View Item"
                              aria-label="View Item"
                            >
                              <MdVisibility className="text-lg" />
                            </button>

                            {/* EDIT */}
                            <button
                              type="button"
                              onClick={() =>
                                onEditItem?.(
                                  item
                                )
                              }
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                              title="Edit Item"
                              aria-label="Edit Item"
                            >
                              <MdEdit className="text-lg" />
                            </button>

                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  item
                                )
                              }
                              disabled={
                                isDeleting
                              }
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                              title="Delete Item"
                              aria-label="Delete Item"
                            >
                              {isDeleting ? (
                                <span className="block h-4.5 w-4.5 animate-spin rounded-full border-2 border-gray-200 border-t-red-500" />
                              ) : (
                                <MdDeleteOutline className="text-lg" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                /* ==================================================
                    EMPTY
                ================================================== */

                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center"
                  >
                    <MdInventory2 className="mx-auto mb-3 text-5xl text-gray-300" />

                    <p className="font-semibold text-gray-600">
                      No items yet
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      Add an item for this
                      customer to get
                      started.
                    </p>

                    <button
                      type="button"
                      onClick={onAddItem}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <MdAdd className="text-lg" />
                      Add First Item
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================
          VIEW ITEM MODAL
      ====================================================== */}

      <ModalCustomerItemView
        isOpen={Boolean(viewingItem)}
        onClose={handleCloseView}
        item={viewingItem}
      />
    </>
  );
};

// ============================================================
// TABLE HEADER
// ============================================================

const TableHeader = ({
  children,
  align = "left",
}) => {
  const alignmentClass =
    align === "right"
      ? "text-right"
      : "text-left";

  return (
    <th
      className={`whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 ${alignmentClass}`}
    >
      {children}
    </th>
  );
};

export default CustomerItemTable;