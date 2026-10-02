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
  MdTrendingUp,
} from "react-icons/md";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import useAlert from "../../context/useAlert.jsx";

import CustomersAdd from "./CustomersAdd.jsx";

const CUSTOMERS_URL = "/api/customers";

// ============================================================
// HELPERS
// ============================================================

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

// ============================================================
// CUSTOMERS
// ============================================================

const Customers = () => {
  const navigate = useNavigate();

  const { user: currentUser } = useAuth();

  const { showAlert } = useAlert();

  // ==========================================================
  // USER / PERMISSIONS
  // ==========================================================

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

  // ==========================================================
  // STATE
  // ==========================================================

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // AUTH CONFIG
  // ==========================================================

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  // ==========================================================
  // LOAD CUSTOMERS
  // ==========================================================

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

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadCustomers]);

  // ==========================================================
  // FILTER CUSTOMERS
  // ==========================================================

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

  // ==========================================================
  // ADD CUSTOMER
  // ==========================================================

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

  // ==========================================================
  // CUSTOMER ADDED
  // ==========================================================

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

  // ==========================================================
  // CUSTOMER DETAILS
  // ==========================================================

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

  // ==========================================================
  // ACCESS RESTRICTED
  // ==========================================================

  if (!canView) {
    return (
      <div className="flex min-h-100 w-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-lg shadow-red-100/40">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            🔒
          </div>

          <h2 className="mt-5 text-lg font-bold text-gray-900">
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

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 px-5 py-6 text-white shadow-lg shadow-indigo-200/50 sm:px-7 sm:py-7">

        {/* Decorative background */}

        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-violet-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          {/* TITLE */}

          <div className="flex min-w-0 items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20 backdrop-blur-sm">
              <MdPeople className="text-3xl" />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-100">
                Customer Management
              </p>

              <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                Customers
              </h1>

              <p className="mt-1 max-w-xl text-sm text-indigo-100">
                Manage customer profiles, payment
                information, and account details.
              </p>

            </div>
          </div>

          {/* TOTAL */}

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
              <MdTrendingUp className="text-xl" />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-100">
                Total Customers
              </p>

              <p className="text-xl font-bold">
                {customers.length}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">

        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

          {/* SEARCH */}

          <div className="relative w-full min-w-0 xl:max-w-2xl">

            <MdSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

            <input
              type="text"
              placeholder="Search customer, code, address, contact, payment..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-xs font-semibold text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
                aria-label="Clear search"
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* ADD BUTTON */}

          {canAdd && (
            <button
              type="button"
              onClick={handleAdd}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <MdAdd className="text-xl" />
              Add Customer
            </button>
          )}
        </div>

        {/* RESULTS INFO */}

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500">

          <div className="rounded-lg bg-gray-50 px-3 py-1.5">
            Showing{" "}
            <span className="font-bold text-gray-800">
              {filteredCustomers.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {customers.length}
            </span>{" "}
            {customers.length === 1
              ? "customer"
              : "customers"}
          </div>

          {search.trim() && (
            <div className="rounded-lg bg-indigo-50 px-3 py-1.5 text-indigo-700">
              Search:{" "}
              <span className="font-semibold">
                "{search.trim()}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          CUSTOMER TABLE
      ====================================================== */}

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* TABLE TOP BAR */}

        <div className="flex min-h-14 items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">

          <div className="flex items-center gap-2">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <MdPeople className="text-lg" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-800">
                Customer List
              </h2>

              <p className="hidden text-[11px] text-gray-400 sm:block">
                Click a customer to view details
              </p>
            </div>

          </div>

          <div className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-500">
            {customers.length} total
          </div>
        </div>

        {/* TABLE SCROLL */}

        <div className="w-full overflow-x-auto overscroll-x-contain">

          <table className="min-w-330 w-full table-auto text-left text-sm">

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
                    className={`whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-500 ${
                      index === 6
                        ? "text-right"
                        : "text-left"
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {/* ==================================================
                  LOADING
              ================================================== */}

              {loading && customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-20 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-gray-600">
                      Loading customers...
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Please wait a moment.
                    </p>
                  </td>
                </tr>

              ) : filteredCustomers.length > 0 ? (

                /* ==================================================
                   CUSTOMER ROWS
                ================================================== */

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
                      className="group cursor-pointer transition hover:bg-indigo-50/50"
                    >

                      {/* NUMBER */}

                      <td className="whitespace-nowrap px-5 py-4 text-gray-400">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </td>

                      {/* CODE */}

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 transition group-hover:bg-indigo-100">
                          {customer.code || "—"}
                        </span>
                      </td>

                      {/* NAME */}

                      <td className="whitespace-nowrap px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-bold text-gray-500 transition group-hover:bg-indigo-100 group-hover:text-indigo-600">
                            {String(
                              customer.name || "?"
                            )
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-bold text-gray-900">
                              {customer.name || "—"}
                            </p>

                            <p className="text-[11px] text-gray-400">
                              Customer
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ADDRESS */}

                      <td className="max-w-70 px-5 py-4">

                        <p
                          className="truncate text-gray-600"
                          title={customer.address || ""}
                        >
                          {customer.address || "—"}
                        </p>

                      </td>

                      {/* CONTACT */}

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {customer.contactPerson || "—"}
                      </td>

                      {/* ORDER TYPES */}

                      <td className="whitespace-nowrap px-5 py-4">

                        <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {customer.orderTypes || "—"}
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
                          title={customer.receipts || ""}
                        >
                          {customer.receipts || "—"}
                        </p>

                      </td>

                      {/* VAT TYPE */}

                      <td className="whitespace-nowrap px-5 py-4">

                        <span className="inline-flex rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          {customer.vatType || "—"}
                        </span>

                      </td>

                      {/* PAYMENT TERMS */}

                      <td className="whitespace-nowrap px-5 py-4">

                        <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {customer.paymentTerms || "—"}
                        </span>

                      </td>

                      {/* PAYMENT METHOD */}

                      <td className="whitespace-nowrap px-5 py-4">

                        <span className="inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {customer.paymentMethod || "—"}
                        </span>

                      </td>

                    </tr>
                  )
                )

              ) : (

                /* ==================================================
                   EMPTY STATE
                ================================================== */

                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-20 text-center"
                  >

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                      <MdPeople className="text-4xl" />
                    </div>

                    <p className="mt-4 font-bold text-gray-700">
                      No customers found
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {search.trim()
                        ? "Try a different search term."
                        : "Add a customer to get started."}
                    </p>

                    {!search.trim() && canAdd && (
                      <button
                        type="button"
                        onClick={handleAdd}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
                      >
                        <MdAdd className="text-lg" />
                        Add First Customer
                      </button>
                    )}

                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* ======================================================
            TABLE FOOTER
        ====================================================== */}

        {!loading && customers.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 px-4 py-3 text-xs text-gray-400 sm:px-5">

            <span>
              Sorted alphabetically by customer name
            </span>

            <span className="font-medium text-gray-500">
              {filteredCustomers.length} shown
            </span>

          </div>
        )}
      </div>

      {/* ======================================================
          ADD CUSTOMER MODAL
      ====================================================== */}

      <CustomersAdd
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCustomerAdded={handleCustomerAdded}
      />

    </div>
  );
};

export default Customers;