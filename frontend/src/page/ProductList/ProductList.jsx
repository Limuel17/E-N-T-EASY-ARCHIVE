import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  MdAdd,
  MdEdit,
  MdInventory2,
  MdRefresh,
  MdSearch,
  MdVisibility,
} from "react-icons/md";

import useAlert from "../../context/useAlert.jsx";

import ModalCustomerItem from "../Customers/CustomerItem/ModalCustomerItem.jsx";
import ModalCustomerItemView from "../Customers/CustomerItem/ModalCustomerItemView.jsx";

// ============================================================
// API
// ============================================================

const CUSTOMERS_URL = "/api/customers";
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

const getId = (item) => {
  return item?._id || item?.id || "";
};

const sortByName = (items = []) => {
  return [...items].sort((a, b) =>
    String(a?.name || "").localeCompare(
      String(b?.name || ""),
      undefined,
      {
        sensitivity: "base",
        numeric: true,
      }
    )
  );
};

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
    <div className="min-w-44 space-y-0.5">
      <div className="whitespace-nowrap text-sm font-semibold text-gray-800">
        {widthDisplay} × {lengthDisplay} × {heightDisplay}{" "}
        <span className="text-[10px] font-bold uppercase text-gray-400">
          mm
        </span>
      </div>

      <div className="whitespace-nowrap text-xs font-medium text-gray-400">
        {widthInches} × {lengthInches} × {heightInches}{" "}
        <span className="text-[10px] font-semibold uppercase">
          in
        </span>
      </div>
    </div>
  );
};

const getCustomerFromItem = (
  item,
  customers = []
) => {
  const customer = item?.customer;

  // Customer is already populated.
  if (
    customer &&
    typeof customer === "object"
  ) {
    return customer;
  }

  // Customer is only an ID.
  const customerId =
    customer || item?.customerId;

  if (!customerId) {
    return {};
  }

  return (
    customers.find(
      (entry) =>
        String(getId(entry)) ===
        String(customerId)
    ) || {}
  );
};

const getCustomerData = (response) => {
  if (
    Array.isArray(
      response?.data?.customers
    )
  ) {
    return response.data.customers;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

const ProductList = () => {
  const { showAlert } = useAlert();

  // ==========================================================
  // STATE
  // ==========================================================

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [loadingCustomers, setLoadingCustomers] =
    useState(false);

  const [viewingItem, setViewingItem] =
    useState(null);

  const [editingItem, setEditingItem] =
    useState(null);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [selectedCustomerId, setSelectedCustomerId] =
    useState("");

  // ==========================================================
  // LOAD PRODUCTS
  // ==========================================================

  const loadProducts = useCallback(
    async (showRefresh = false) => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        setRefreshing(false);

        showAlert(
          "error",
          "Authentication Error",
          "Authentication token not found."
        );

        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        // ------------------------------------------------------
        // LOAD CUSTOMERS
        // ------------------------------------------------------

        const customerResponse =
          await axios.get(
            CUSTOMERS_URL,
            getAuthConfig()
          );

        const customerData =
          getCustomerData(customerResponse);

        setCustomers(customerData);

        // ------------------------------------------------------
        // LOAD ITEMS FOR ALL CUSTOMERS
        // ------------------------------------------------------

        const customerResults =
          await Promise.all(
            customerData.map(
              async (customer) => {
                const customerId =
                  getId(customer);

                if (!customerId) {
                  return [];
                }

                try {
                  const response =
                    await axios.get(
                      `${CUSTOMER_ITEMS_URL}/customer/${customerId}`,
                      getAuthConfig()
                    );

                  const items = Array.isArray(
                    response.data?.items
                  )
                    ? response.data.items
                    : [];

                  return items.map(
                    (item) => ({
                      ...item,

                      customer: {
                        ...(item?.customer &&
                        typeof item.customer ===
                          "object"
                          ? item.customer
                          : {}),

                        _id: customerId,

                        code:
                          customer.code || "",

                        name:
                          customer.name || "",

                        address:
                          customer.address || "",
                      },
                    })
                  );
                } catch (error) {
                  console.error(
                    `FAILED TO LOAD ITEMS FOR CUSTOMER ${customerId}:`,
                    error.response?.data ||
                      error.message
                  );

                  return [];
                }
              }
            )
          );

        // ------------------------------------------------------
        // COMBINE PRODUCTS
        // ------------------------------------------------------

        const allProducts =
          customerResults.flat();

        setProducts(
          sortByName(allProducts)
        );
      } catch (error) {
        console.error(
          "FAILED TO LOAD PRODUCT LIST:",
          error.response?.data ||
            error.message
        );

        setProducts([]);

        showAlert(
          "error",
          "Load Failed",
          error.response?.data?.message ||
            "Failed to load product list."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showAlert]
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================
  //
  // A zero-delay timer prevents the React Hooks
  // set-state-in-effect warning because loadProducts()
  // updates component state asynchronously.
  //
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [loadProducts]);

  // ==========================================================
  // REFRESH AFTER CUSTOMER ITEM SAVE
  // ==========================================================

  useEffect(() => {
    const handleRefresh = () => {
      void loadProducts(true);
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
  }, [loadProducts]);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredProducts = useMemo(() => {
    const keyword = String(search || "")
      .trim()
      .toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((item) => {
      const customer =
        item?.customer || {};

      const searchableValues = [
        customer.name,
        customer.code,

        item?.name,
        item?.description,
        item?.code,

        item?.productType,
        item?.printingType,
        item?.jointType,
        item?.uom,

        item?.widthMM,
        item?.lengthMM,
        item?.heightMM,

        // Dimension with spaces.
        `${item?.widthMM ?? ""} ${
          item?.lengthMM ?? ""
        } ${item?.heightMM ?? ""}`,

        // Dimension using ×.
        `${item?.widthMM ?? ""} × ${
          item?.lengthMM ?? ""
        } × ${item?.heightMM ?? ""}`,

        // Dimension with MM.
        `${item?.widthMM ?? ""} × ${
          item?.lengthMM ?? ""
        } × ${item?.heightMM ?? ""} mm`,
      ];

      return searchableValues.some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(keyword)
      );
    });
  }, [products, search]);

  // ==========================================================
  // VIEW
  // ==========================================================

  const handleView = useCallback(
    (item) => {
      setViewingItem(item);
    },
    []
  );

  const handleCloseView =
    useCallback(() => {
      setViewingItem(null);
    }, []);

  // ==========================================================
  // EDIT
  // ==========================================================

  const handleEdit = useCallback(
    (item) => {
      setEditingItem(item);
    },
    []
  );

  const handleCloseEdit =
    useCallback(() => {
      setEditingItem(null);
    }, []);

  // ==========================================================
  // OPEN ADD ITEM
  // ==========================================================

  const handleOpenAdd =
    useCallback(async () => {
      setSelectedCustomerId("");
      setShowAddModal(true);

      // Customers are already loaded.
      if (customers.length > 0) {
        return;
      }

      const token =
        localStorage.getItem("token");

      if (!token) {
        return;
      }

      try {
        setLoadingCustomers(true);

        const response =
          await axios.get(
            CUSTOMERS_URL,
            getAuthConfig()
          );

        const customerData =
          getCustomerData(response);

        setCustomers(customerData);
      } catch (error) {
        console.error(
          "FAILED TO LOAD CUSTOMERS:",
          error.response?.data ||
            error.message
        );

        showAlert(
          "error",
          "Load Failed",
          "Failed to load customers."
        );
      } finally {
        setLoadingCustomers(false);
      }
    }, [customers.length, showAlert]);

  // ==========================================================
  // CLOSE ADD CUSTOMER SELECTION
  // ==========================================================

  const handleCloseAdd =
    useCallback(() => {
      setShowAddModal(false);
      setSelectedCustomerId("");
    }, []);

  // ==========================================================
  // CONTINUE TO ADD ITEM
  // ==========================================================

  const handleContinueAdd =
    useCallback(() => {
      if (!selectedCustomerId) {
        showAlert(
          "warning",
          "Select Customer",
          "Please select a customer before continuing."
        );

        return;
      }

      setShowAddModal(false);
    }, [selectedCustomerId, showAlert]);

  // ==========================================================
  // ADD ITEM SAVED
  // ==========================================================

  const handleAddSaved =
    useCallback(() => {
      setShowAddModal(false);
      setSelectedCustomerId("");

      // ModalCustomerItem dispatches
      // "customer-item-saved".
      // The event listener above handles refresh.
    }, []);

  // ==========================================================
  // EDIT ITEM SAVED
  // ==========================================================

  const handleEditSaved =
    useCallback(() => {
      setEditingItem(null);

      // ModalCustomerItem dispatches
      // "customer-item-saved".
      // The event listener above handles refresh.
    }, []);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ======================================================
          PRODUCT LIST
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* TITLE */}

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <MdInventory2 className="text-2xl" />
              </div>

              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-900">
                  Product List
                </h1>

                <p className="text-xs text-gray-500">
                  Customer products and item
                  specifications
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  void loadProducts(true)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdRefresh
                  className={`text-xl ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
              >
                <MdAdd className="text-xl" />

                Add Item
              </button>
            </div>
          </div>

          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xl">
              <MdSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search customer, product name, code, product type..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">
                {filteredProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">
                {products.length}
              </span>{" "}
              {products.length === 1
                ? "product"
                : "products"}
            </div>
          </div>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="min-w-337.5 w-full table-auto text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <TableHeader>
                  #
                </TableHeader>

                <TableHeader>
                  Customer
                </TableHeader>

                <TableHeader>
                  Product Name
                </TableHeader>

                <TableHeader>
                  Description
                </TableHeader>

                <TableHeader>
                  Code
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
                    colSpan={9}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading products...
                    </p>
                  </td>
                </tr>
              ) : filteredProducts.length >
                0 ? (
                filteredProducts.map(
                  (item, index) => {
                    const customer =
                      getCustomerFromItem(
                        item,
                        customers
                      );

                    const itemId =
                      getId(item);

                    return (
                      <tr
                        key={
                          itemId ||
                          `product-${index}`
                        }
                        className="transition hover:bg-emerald-50/40"
                      >
                        {/* NUMBER */}

                        <td className="whitespace-nowrap px-5 py-4 text-gray-400">
                          {index + 1}
                        </td>

                        {/* CUSTOMER */}

                        <td className="min-w-45 px-5 py-4">
                          <p
                            className="font-semibold text-gray-900"
                            title={
                              customer.name ||
                              ""
                            }
                          >
                            {customer.name ||
                              "—"}
                          </p>

                          <p className="mt-0.5 text-xs font-medium text-gray-400">
                            {customer.code ||
                              "—"}
                          </p>
                        </td>

                        {/* PRODUCT NAME */}

                        <td className="min-w-45 max-w-60 px-5 py-4">
                          <p
                            className="wrap-break-word font-semibold text-gray-900"
                            title={
                              item.name || ""
                            }
                          >
                            {item.name || "—"}
                          </p>
                        </td>

                        {/* DESCRIPTION */}

                        <td className="min-w-55 max-w-75 px-5 py-4">
                          <p
                            className="wrap-break-word text-gray-600"
                            title={
                              item.description ||
                              ""
                            }
                          >
                            {item.description ||
                              "—"}
                          </p>
                        </td>

                        {/* ITEM CODE */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                            {item.code || "—"}
                          </span>
                        </td>

                        {/* PRODUCT TYPE */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {item.productType ||
                              "—"}
                          </span>
                        </td>

                        {/* DIMENSION */}

                        <td className="px-5 py-4">
                          {formatDimension(item)}
                        </td>

                        {/* PRINT TYPE */}

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                            {item.printingType ||
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
                                handleEdit(item)
                              }
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                              title="Edit Item"
                              aria-label="Edit Item"
                            >
                              <MdEdit className="text-lg" />
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
                    colSpan={9}
                    className="px-5 py-16 text-center"
                  >
                    <MdInventory2 className="mx-auto mb-3 text-5xl text-gray-300" />

                    <p className="font-semibold text-gray-600">
                      {search.trim()
                        ? "No matching products"
                        : "No products found"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {search.trim()
                        ? "Try a different search term."
                        : "Customer items will appear here."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================
          VIEW ITEM
      ====================================================== */}

      <ModalCustomerItemView
        isOpen={Boolean(viewingItem)}
        onClose={handleCloseView}
        item={viewingItem}
      />

      {/* ======================================================
          EDIT ITEM
      ====================================================== */}

      <ModalCustomerItem
        isOpen={Boolean(editingItem)}
        onClose={handleCloseEdit}
        customerId={
          editingItem?.customer?._id ||
          editingItem?.customer?.id ||
          editingItem?.customer
        }
        editItem={editingItem}
        onSaved={handleEditSaved}
      />

      {/* ======================================================
          ADD ITEM - CUSTOMER SELECTION
      ====================================================== */}

      {showAddModal && (
        <CustomerSelectionModal
          customers={customers}
          selectedCustomerId={
            selectedCustomerId
          }
          loading={loadingCustomers}
          onChange={setSelectedCustomerId}
          onClose={handleCloseAdd}
          onContinue={handleContinueAdd}
        />
      )}

      {/* ======================================================
          ADD ITEM FORM
      ====================================================== */}

      {!showAddModal &&
        selectedCustomerId && (
          <ModalCustomerItem
            isOpen={Boolean(
              selectedCustomerId
            )}
            onClose={() => {
              setSelectedCustomerId("");
            }}
            customerId={
              selectedCustomerId
            }
            editItem={null}
            onSaved={handleAddSaved}
          />
        )}
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
  return (
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
};

// ============================================================
// CUSTOMER SELECTION MODAL
// ============================================================

const CustomerSelectionModal = ({
  customers,
  selectedCustomerId,
  loading,
  onChange,
  onClose,
  onContinue,
}) => {
  const sortedCustomers = useMemo(
    () => sortByName(customers),
    [customers]
  );

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Select Customer
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Select the customer for this
            new product.
          </p>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="p-5">
          <label
            htmlFor="product-customer"
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
          >
            Customer
          </label>

          {loading ? (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />

              <span className="text-sm text-gray-500">
                Loading customers...
              </span>
            </div>
          ) : (
            <select
              id="product-customer"
              value={selectedCustomerId}
              onChange={(event) =>
                onChange(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="">
                Select a customer
              </option>

              {sortedCustomers.map(
                (customer) => {
                  const customerId =
                    getId(customer);

                  if (!customerId) {
                    return null;
                  }

                  return (
                    <option
                      key={customerId}
                      value={customerId}
                    >
                      {customer.name ||
                        "Unnamed Customer"}

                      {customer.code
                        ? ` — ${customer.code}`
                        : ""}
                    </option>
                  );
                }
              )}
            </select>
          )}
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={
              !selectedCustomerId ||
              loading
            }
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;