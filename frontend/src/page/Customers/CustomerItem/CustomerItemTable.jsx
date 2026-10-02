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
  MdSearch,
  MdVisibility,
} from "react-icons/md";

import useAlert from "../../../context/useAlert.jsx";
import ModalCustomerItemView from "./ModalCustomerItemView.jsx";

const CUSTOMER_ITEMS_URL = "/api/customer-items";

// ============================================================
// HELPERS
// ============================================================

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const sortItems = (items) =>
  [...items].sort((a, b) =>
    String(a.name || "").localeCompare(
      String(b.name || ""),
      undefined,
      {
        sensitivity: "base",
        numeric: true,
      }
    )
  );

const mmToInches = (mm) => {
  const value = Number(mm);

  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  return (value / 25.4).toFixed(2);
};

const formatDimension = (item) => {
  const width = Number(item?.widthMM);
  const length = Number(item?.lengthMM);

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(length) ||
    width <= 0 ||
    length <= 0
  ) {
    return "—";
  }

  return (
    <div className="space-y-0.5">
      <div className="whitespace-nowrap font-semibold text-gray-800">
        {width} × {length} mm
      </div>

      <div className="whitespace-nowrap text-xs text-gray-400">
        {mmToInches(width)} × {mmToInches(length)} in
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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  // ==========================================================
  // LOAD ITEMS
  // ==========================================================

  const loadItems = useCallback(async () => {
    if (!customerId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${CUSTOMER_ITEMS_URL}/customer/${customerId}`,
        getAuthConfig()
      );

      const data = Array.isArray(response.data?.items)
        ? response.data.items
        : [];

      setItems(sortItems(data));
    } catch (error) {
      console.error(
        "FAILED TO LOAD CUSTOMER ITEMS:",
        error.response?.data || error.message
      );

      setItems([]);

      showAlert(
        "error",
        "Load Failed",
        error.response?.data?.message ||
          "Failed to load customer items."
      );
    } finally {
      setLoading(false);
    }
  }, [customerId, showAlert]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchItems = async () => {
      if (!customerId) {
        if (!cancelled) {
          setItems([]);
          setLoading(false);
        }

        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          showAlert(
            "error",
            "Authentication Error",
            "Authentication token not found."
          );

          setLoading(false);
        }

        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
        }

        const response = await axios.get(
          `${CUSTOMER_ITEMS_URL}/customer/${customerId}`,
          getAuthConfig()
        );

        const data = Array.isArray(response.data?.items)
          ? response.data.items
          : [];

        if (!cancelled) {
          setItems(sortItems(data));
        }
      } catch (error) {
        console.error(
          "FAILED TO LOAD CUSTOMER ITEMS:",
          error.response?.data || error.message
        );

        if (!cancelled) {
          setItems([]);

          showAlert(
            "error",
            "Load Failed",
            error.response?.data?.message ||
              "Failed to load customer items."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      cancelled = true;
    };
  }, [customerId, showAlert]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredItems = useMemo(() => {
    const keyword = String(search || "")
      .trim()
      .toLowerCase();

    if (!keyword) {
      return items;
    }

    return items.filter((item) =>
      [
        item.name,
        item.description,
        item.code,
        item.productType,
        item.printingType,
        item.jointType,
        item.uom,
        item.widthMM,
        item.lengthMM,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [items, search]);

  // ==========================================================
  // VIEW
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
  // DELETE
  // ==========================================================

  const handleDelete = useCallback(
    async (item) => {
      const itemId = item?._id || item?.id;

      if (!itemId) {
        showAlert(
          "error",
          "Invalid Item",
          "Item ID was not found."
        );

        return;
      }

      const confirmed = window.confirm(
        `Delete item "${item.name || item.code}"?`
      );

      if (!confirmed) {
        return;
      }

      const token = localStorage.getItem("token");

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

        setItems((previous) =>
          previous.filter(
            (currentItem) =>
              (currentItem._id || currentItem.id) !== itemId
          )
        );

        setViewingItem((currentItem) => {
          if (
            currentItem &&
            (currentItem._id || currentItem.id) === itemId
          ) {
            return null;
          }

          return currentItem;
        });

        showAlert(
          "success",
          "Item Deleted",
          "The customer item was deleted successfully."
        );
      } catch (error) {
        console.error(
          "FAILED TO DELETE CUSTOMER ITEM:",
          error.response?.data || error.message
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
    [showAlert]
  );

  // ==========================================================
  // REFRESH AFTER SAVE
  // ==========================================================

  useEffect(() => {
    const handleRefresh = () => {
      loadItems();
    };

    window.addEventListener(
      "customer-item-saved",
      handleRefresh
    );

    return () => {
      window.removeEventListener(
        "customer-item-saved",
        handleRefresh
      );
    };
  }, [loadItems]);

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
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

            {/* ADD BUTTON */}

            <button
              type="button"
              onClick={onAddItem}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
            >
              <MdAdd className="text-xl" />
              Add Item
            </button>
          </div>

          {/* SEARCH / RESULT INFO */}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <MdSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search item name, code, product type..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredItems.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {items.length}
              </span>{" "}
              {items.length === 1 ? "item" : "items"}
            </div>
          </div>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-250 w-full table-auto text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <TableHeader>#</TableHeader>
                <TableHeader>Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Code</TableHeader>
                <TableHeader>Product Type</TableHeader>
                <TableHeader>Dimension</TableHeader>
                <TableHeader>Print Type</TableHeader>
                <TableHeader align="right">
                  Action
                </TableHeader>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* LOADING */}

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
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const itemId =
                    item?._id || item?.id;

                  return (
                    <tr
                      key={itemId}
                      className="transition hover:bg-emerald-50/40"
                    >
                      {/* NUMBER */}

                      <td className="whitespace-nowrap px-5 py-4 text-gray-400">
                        {index + 1}
                      </td>

                      {/* NAME */}

                      <td className="max-w-60 px-5 py-4">
                        <p
                          className="font-semibold text-gray-900"
                          title={item.name || ""}
                        >
                          {item.name || "—"}
                        </p>
                      </td>

                      {/* DESCRIPTION */}

                      <td className="max-w-70 px-5 py-4">
                        <p
                          className="wrap-break-words text-gray-600"
                          title={item.description || ""}
                        >
                          {item.description || "—"}
                        </p>
                      </td>

                      {/* CODE */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                          {item.code || "—"}
                        </span>
                      </td>

                      {/* PRODUCT TYPE */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {item.productType || "—"}
                        </span>
                      </td>

                      {/* DIMENSION */}

                      <td className="px-5 py-4">
                        {formatDimension(item)}
                      </td>

                      {/* PRINT TYPE */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          {item.printingType || "—"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              handleView(item)
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
                              onEditItem?.(item)
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
                              handleDelete(item)
                            }
                            disabled={
                              deletingId === itemId
                            }
                            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Delete Item"
                            aria-label="Delete Item"
                          >
                            {deletingId === itemId ? (
                              <span className="block h-4.5 w-4.5 animate-spin rounded-full border-2 border-gray-200 border-t-red-500" />
                            ) : (
                              <MdDeleteOutline className="text-lg" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* EMPTY */

                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center"
                  >
                    <MdInventory2 className="mx-auto mb-3 text-5xl text-gray-300" />

                    <p className="font-semibold text-gray-600">
                      {search.trim()
                        ? "No matching items"
                        : "No items yet"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {search.trim()
                        ? "Try a different search term."
                        : "Add an item for this customer to get started."}
                    </p>

                    {!search.trim() && (
                      <button
                        type="button"
                        onClick={onAddItem}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                      >
                        <MdAdd className="text-lg" />
                        Add First Item
                      </button>
                    )}
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
}) => (
  <th
    className={`whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 ${
      align === "right"
        ? "text-right"
        : "text-left"
    }`}
  >
    {children}
  </th>
);

export default CustomerItemTable;