
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  MdAdd,
  MdPeople,
  MdSearch,
} from "react-icons/md";

import { useNavigate } from "react-router";

import { useAuth } from "../../context/AuthContext";
import useAlert from "../../context/useAlert.jsx";

import CustomersAdd from "./CustomersAdd.jsx";

const CUSTOMERS_URL = "/api/customers";

/* ============================================================
   SORT CUSTOMERS
============================================================ */

const sortCustomers = (items) =>
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

/* ============================================================
   CUSTOMERS
============================================================ */

const Customers = () => {
  const navigate = useNavigate();

  const { user: currentUser } = useAuth();

  const { showAlert } = useAlert();

  /* ==========================================================
     USER / PERMISSIONS
  ========================================================== */

  const currentUserRole = String(
    currentUser?.role || ""
  ).toLowerCase();

  const isAdmin = currentUserRole === "admin";

  const customerPermissions =
    currentUser?.permissions?.customer || {};

  const canView =
    isAdmin || customerPermissions.view === true;

  const canAdd =
    isAdmin || customerPermissions.add === true;

  /* ==========================================================
     STATE
  ========================================================== */

  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [loading, setLoading] = useState(false);

  /* ==========================================================
     AUTH CONFIG
  ========================================================== */

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  /* ==========================================================
     LOAD CUSTOMERS
  ========================================================== */

  const loadCustomers = useCallback(async () => {
    if (!canView) {
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
      setLoading(true);

      const response = await axios.get(
        CUSTOMERS_URL,
        getAuthConfig()
      );

      const data = Array.isArray(
        response.data?.customers
      )
        ? response.data.customers
        : [];

      setCustomers(sortCustomers(data));
    } catch (error) {
      console.error(
        "FAILED TO LOAD CUSTOMERS:",
        error.response?.data || error.message
      );

      setCustomers([]);

      showAlert(
        "error",
        "Load Failed",
        error.response?.data?.message ||
          "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  }, [
    canView,
    getAuthConfig,
    showAlert,
  ]);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadCustomers]);

  /* ==========================================================
     FILTER CUSTOMERS
  ========================================================== */

  const filteredCustomers = useMemo(() => {
    const keyword = String(search || "")
      .trim()
      .toLowerCase();

    if (!keyword) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.code,
        customer.name,
        customer.address,
        customer.contactPerson,
        customer.orderTypes,
        customer.limits,
        customer.receipts,
        customer.vatType,
        customer.paymentTerms,
        customer.paymentMethod,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(keyword)
      )
    );
  }, [customers, search]);

  /* ==========================================================
     ADD CUSTOMER
  ========================================================== */

  const handleAdd = useCallback(() => {
    if (!canAdd) {
      showAlert(
        "warning",
        "Access Denied",
        "You do not have permission to add customers."
      );

      return;
    }

    setShowAddModal(true);
  }, [canAdd, showAlert]);

  /* ==========================================================
     CUSTOMER ADDED
  ========================================================== */

  const handleCustomerAdded = useCallback(
    (newCustomer) => {
      if (!newCustomer) {
        return;
      }

      setCustomers((previous) =>
        sortCustomers([
          ...previous,
          newCustomer,
        ])
      );

      setShowAddModal(false);
    },
    []
  );

  /* ==========================================================
     CUSTOMER DETAILS
  ========================================================== */

  const handleCustomerClick = useCallback(
    (customer) => {
      const customerId =
        customer?._id || customer?.id;

      if (!customerId) {
        showAlert(
          "error",
          "Invalid Customer",
          "Customer ID was not found."
        );

        return;
      }

      navigate(
        `/admin/customers/${customerId}`
      );
    },
    [navigate, showAlert]
  );

  /* ==========================================================
     ACCESS RESTRICTED
  ========================================================== */

  if (!canView) {
    return (
      <div className="flex min-h-100 w-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
            🔒
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-800">
            Access Restricted
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            You do not have permission to view
            customers.
          </p>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden">
      {/* ========================================================
          TOOLBAR
      ======================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* SEARCH */}

          <div className="relative w-full min-w-0 xl:max-w-xl">
            <MdSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

            <input
              type="text"
              placeholder="Search code, customer, address, contact..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* ADD BUTTON */}

          {canAdd && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <MdAdd className="text-xl" />

              Add Customer
            </button>
          )}
        </div>

        {/* RESULTS INFO */}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredCustomers.length}
            </span>{" "}
            {filteredCustomers.length === 1
              ? "customer"
              : "customers"}
          </span>

          {search.trim() && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1">
              Search:{" "}
              <span className="font-medium text-gray-700">
                "{search.trim()}"
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================
          CUSTOMER TABLE
      ======================================================== */}

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* TABLE HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="hidden rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 sm:block">
            {customers.length} total
          </div>
        </div>

        {/* TABLE SCROLL */}

        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-330 table-auto text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {[
                  "#",
                  "Code",
                  "Name",
                  "Address",
                  "Contact Person",
                  "Order Types",
                  "Limits",
                  "Receipts",
                  "VAT Type",
                  "Payment Terms",
                  "Payment Method",
                ].map((heading, index) => (
                  <th
                    key={heading}
                    className={`whitespace-nowrap px-5 py-4 font-semibold text-gray-700 ${
                      index === 6
                        ? "text-right"
                        : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {/* LOADING */}

              {loading && customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                /* CUSTOMER ROWS */

                filteredCustomers.map(
                  (customer, index) => (
                    <tr
                      key={
                        customer._id ||
                        customer.id
                      }
                      onClick={() =>
                        handleCustomerClick(
                          customer
                        )
                      }
                      className="cursor-pointer transition hover:bg-indigo-50/50"
                    >
                      {/* NUMBER */}

                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                        {index + 1}
                      </td>

                      {/* CODE */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                          {customer.code || "—"}
                        </span>
                      </td>

                      {/* NAME */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {customer.name || "—"}
                        </p>
                      </td>

                      {/* ADDRESS */}

                      <td className="max-w-70 px-5 py-4">
                        <p
                          className="truncate text-gray-600"
                          title={
                            customer.address || ""
                          }
                        >
                          {customer.address || "—"}
                        </p>
                      </td>

                      {/* CONTACT */}

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {customer.contactPerson ||
                          "—"}
                      </td>

                      {/* ORDER TYPES */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {customer.orderTypes ||
                            "—"}
                        </span>
                      </td>

                      {/* LIMITS */}

                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-gray-700">
                        {customer.limits || "—"}
                      </td>

                      {/* RECEIPTS */}

                      <td className="max-w-80 px-5 py-4">
                        <p
                          className="whitespace-normal text-gray-600"
                          title={
                            customer.receipts || ""
                          }
                        >
                          {customer.receipts || "—"}
                        </p>
                      </td>

                      {/* VAT TYPE */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          {customer.vatType || "—"}
                        </span>
                      </td>

                      {/* PAYMENT TERMS */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {customer.paymentTerms ||
                            "—"}
                        </span>
                      </td>

                      {/* PAYMENT METHOD */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {customer.paymentMethod ||
                            "—"}
                        </span>
                      </td>
                    </tr>
                  )
                )
              ) : (
                /* EMPTY STATE */

                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-16 text-center"
                  >
                    <MdPeople className="mx-auto mb-3 text-5xl text-gray-300" />

                    <p className="font-semibold text-gray-600">
                      No customers found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {search.trim()
                        ? "Try a different search term."
                        : "Add a customer to get started."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          ADD CUSTOMER MODAL
      ======================================================== */}

      <CustomersAdd
        isOpen={showAddModal}
        onClose={() =>
          setShowAddModal(false)
        }
        onCustomerAdded={
          handleCustomerAdded
        }
      />
    </div>
  );
};

export default Customers;

