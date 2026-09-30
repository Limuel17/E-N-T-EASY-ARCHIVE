
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdPeople,
  MdSearch,
} from "react-icons/md";

import { useAuth } from "../../context/AuthContext";
import useAlert from "../../context/useAlert.jsx";

const CUSTOMERS_URL = "/api/customers";

/* =========================================================
   OPTIONS
========================================================= */

const ORDER_TYPE_OPTIONS = [
  "Overrun",
  "Underrun",
  "Exact",
  "OVERRUN/UNDERRUN",
];

const RECEIPT_OPTIONS = [
  "SALES INVOICE/DELIVERY RECEIPT",
  "ACKNOWLEDGMENT RECEIPT",
  "ACKNOWLEDGMENT RECEIPT Miscellaneous",
];

const VAT_TYPE_OPTIONS = [
  "VAT ZERO RATED",
  "VAT INCLUSIVE",
  "VAT EXCLUSIVE",
];

const PAYMENT_TERMS_OPTIONS = [
  "ADVANCE",
  "15 DAYS",
  "30 DAYS",
  "45 DAYS",
  "60 DAYS",
  "90 DAYS",
  "50% DP",
  "50% DP - 50% COD",
  "NOT APPLICABLE",
];

const PAYMENT_METHOD_OPTIONS = [
  "Cash",
  "Credit Card",
  "Debit Card",
  "Digital Wallets",
  "Bank Transfers",
];

/* =========================================================
   EMPTY FORM
========================================================= */

const createEmptyForm = () => ({
  code: "",
  name: "",
  address: "",
  contactPerson: "",
  orderTypes: "Exact",
  limits: "",
  receipts: "SALES INVOICE/DELIVERY RECEIPT",
  vatType: "VAT INCLUSIVE",
  paymentTerms: "30 DAYS",
  paymentMethod: "Cash",
});

/* =========================================================
   COMPONENT
========================================================= */

const Customers = () => {
  const { user: currentUser } = useAuth();
  const { showAlert } = useAlert();

  /* =======================================================
     PERMISSIONS
  ======================================================= */

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

  const canEdit =
    isAdmin || customerPermissions.edit === true;

  const canDelete =
    isAdmin || customerPermissions.delete === true;

  /* =======================================================
     STATE
  ======================================================= */

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState(null);
  const [formData, setFormData] =
    useState(createEmptyForm());
  const [loading, setLoading] = useState(false);

  /* =======================================================
     AUTH CONFIG
  ======================================================= */

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  /* =======================================================
     LOAD CUSTOMERS
  ======================================================= */

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

      const customerData = Array.isArray(
        response.data?.customers
      )
        ? response.data.customers
        : [];

      setCustomers(customerData);
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

  /*
    The React Hooks ESLint rule flags this because
    loadCustomers() updates component state.

    The API request itself is asynchronous and this effect
    is intentionally used to load the initial customer data.
  */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCustomers();
  }, [loadCustomers]);

  /* =======================================================
     SEARCH
  ======================================================= */

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

  /* =======================================================
     OPEN ADD MODAL
  ======================================================= */

  const handleAdd = useCallback(() => {
    if (!canAdd) {
      showAlert(
        "warning",
        "Access Denied",
        "You do not have permission to add customers."
      );
      return;
    }

    setEditingCustomer(null);
    setFormData(createEmptyForm());
    setShowModal(true);
  }, [canAdd, showAlert]);

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  const handleEdit = useCallback(
    (customer) => {
      if (!canEdit) {
        showAlert(
          "warning",
          "Access Denied",
          "You do not have permission to edit customers."
        );
        return;
      }

      setEditingCustomer(customer);

      setFormData({
        code: customer.code || "",
        name: customer.name || "",
        address: customer.address || "",
        contactPerson:
          customer.contactPerson || "",
        orderTypes:
          customer.orderTypes || "Exact",
        limits:
          customer.limits === undefined ||
          customer.limits === null
            ? ""
            : String(customer.limits),
        receipts:
          customer.receipts ||
          "SALES INVOICE/DELIVERY RECEIPT",
        vatType:
          customer.vatType || "VAT INCLUSIVE",
        paymentTerms:
          customer.paymentTerms || "30 DAYS",
        paymentMethod:
          customer.paymentMethod || "Cash",
      });

      setShowModal(true);
    },
    [canEdit, showAlert]
  );

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "code" || name === "name"
          ? value.toUpperCase()
          : value,
    }));
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseModal = useCallback(() => {
    if (loading) {
      return;
    }

    setShowModal(false);
    setEditingCustomer(null);
    setFormData(createEmptyForm());
  }, [loading]);

  /* =======================================================
     SAVE CUSTOMER
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanCode = formData.code.trim();
    const cleanName = formData.name.trim();

    if (!cleanCode) {
      showAlert(
        "warning",
        "Customer Code Required",
        "Please enter a customer code."
      );
      return;
    }

    if (!cleanName) {
      showAlert(
        "warning",
        "Customer Name Required",
        "Please enter a customer name."
      );
      return;
    }

    if (editingCustomer && !canEdit) {
      showAlert(
        "warning",
        "Access Denied",
        "You do not have permission to edit customers."
      );
      return;
    }

    if (!editingCustomer && !canAdd) {
      showAlert(
        "warning",
        "Access Denied",
        "You do not have permission to add customers."
      );
      return;
    }

    /* =====================================================
       PAYLOAD

       Limits is a STRING and can contain %
    ===================================================== */

    const payload = {
      code: cleanCode,
      name: cleanName,
      address: formData.address.trim(),
      contactPerson:
        formData.contactPerson.trim(),
      orderTypes: formData.orderTypes,
      limits: formData.limits.trim(),
      receipts: formData.receipts,
      vatType: formData.vatType,
      paymentTerms: formData.paymentTerms,
      paymentMethod: formData.paymentMethod,
    };

    try {
      setLoading(true);

      /* ===================================================
         UPDATE
      =================================================== */

      if (editingCustomer) {
        const customerId =
          editingCustomer._id ||
          editingCustomer.id;

        const response = await axios.put(
          `${CUSTOMERS_URL}/${customerId}`,
          payload,
          getAuthConfig()
        );

        const updatedCustomer =
          response.data?.customer;

        if (!updatedCustomer) {
          throw new Error(
            "Updated customer data was not returned."
          );
        }

        setCustomers((previous) =>
          previous
            .map((customer) =>
              String(
                customer._id || customer.id
              ) === String(customerId)
                ? updatedCustomer
                : customer
            )
            .sort((a, b) =>
              String(a.name || "").localeCompare(
                String(b.name || ""),
                undefined,
                {
                  sensitivity: "base",
                  numeric: true,
                }
              )
            )
        );

        showAlert(
          "success",
          "Customer Updated",
          "The customer was updated successfully."
        );
      }

      /* ===================================================
         CREATE
      =================================================== */

      else {
        const response = await axios.post(
          CUSTOMERS_URL,
          payload,
          getAuthConfig()
        );

        const newCustomer =
          response.data?.customer;

        if (!newCustomer) {
          throw new Error(
            "New customer data was not returned."
          );
        }

        setCustomers((previous) =>
          [...previous, newCustomer].sort(
            (a, b) =>
              String(a.name || "").localeCompare(
                String(b.name || ""),
                undefined,
                {
                  sensitivity: "base",
                  numeric: true,
                }
              )
          )
        );

        showAlert(
          "success",
          "Customer Added",
          "The customer was added successfully."
        );
      }

      handleCloseModal();
    } catch (error) {
      console.error(
        "FAILED TO SAVE CUSTOMER:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        editingCustomer
          ? "Update Failed"
          : "Save Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to save customer."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     DELETE CUSTOMER
  ======================================================= */

  const handleDelete = async (customer) => {
    if (!canDelete) {
      showAlert(
        "warning",
        "Access Denied",
        "You do not have permission to delete customers."
      );
      return;
    }

    const customerId =
      customer._id || customer.id;

    if (!customerId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete customer "${customer.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(
        `${CUSTOMERS_URL}/${customerId}`,
        getAuthConfig()
      );

      setCustomers((previous) =>
        previous.filter(
          (item) =>
            String(
              item._id || item.id
            ) !== String(customerId)
        )
      );

      showAlert(
        "success",
        "Customer Deleted",
        "The customer was deleted successfully."
      );
    } catch (error) {
      console.error(
        "FAILED TO DELETE CUSTOMER:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Delete Failed",
        error.response?.data?.message ||
          "Failed to delete customer."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     ACCESS DENIED
  ======================================================= */

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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden">
      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
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

          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
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
        </div>

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

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="hidden rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 sm:block">
            {customers.length} total
          </div>
        </div>

        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-330 table-auto text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  #
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Code
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Name
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Address
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Contact Person
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Order Types
                </th>

                <th className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-700">
                  Limits
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Receipts
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  VAT Type
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Payment Terms
                </th>

                <th className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                  Payment Method
                </th>

                {(canEdit || canDelete) && (
                  <th className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      canEdit || canDelete
                        ? 12
                        : 11
                    }
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

                    <p className="mt-3 text-sm text-gray-500">
                      Loading customers...
                    </p>
                  </td>
                </tr>
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map(
                  (customer, index) => (
                    <tr
                      key={
                        customer._id ||
                        customer.id
                      }
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                          {customer.code || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {customer.name || "—"}
                        </p>
                      </td>

                      <td className="max-w-70 px-5 py-4">
                        <p
                          className="truncate text-gray-600"
                          title={customer.address || ""}
                        >
                          {customer.address || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {customer.contactPerson ||
                          "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {customer.orderTypes ||
                            "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-gray-700">
                        {customer.limits || "—"}
                      </td>

                      <td className="max-w-80 px-5 py-4">
                        <p
                          className="whitespace-normal text-gray-600"
                          title={customer.receipts || ""}
                        >
                          {customer.receipts || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                          {customer.vatType || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          {customer.paymentTerms ||
                            "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {customer.paymentMethod ||
                            "—"}
                        </span>
                      </td>

                      {(canEdit || canDelete) && (
                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(customer)
                                }
                                disabled={loading}
                                className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Edit customer"
                              >
                                <MdEdit className="text-xl" />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(customer)
                                }
                                disabled={loading}
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Delete customer"
                              >
                                <MdDelete className="text-xl" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={
                      canEdit || canDelete
                        ? 12
                        : 11
                    }
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

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingCustomer
                    ? "Edit Customer"
                    : "Add Customer"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Enter customer information below
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="rounded-lg p-2 text-2xl leading-none text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {/* CODE */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Code
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Enter customer code"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  />
                </div>

                {/* NAME */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm uppercase outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  />
                </div>

                {/* ADDRESS */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Customer address"
                    disabled={loading}
                    className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  />
                </div>

                {/* CONTACT PERSON */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Contact Person
                  </label>

                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="Contact person"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  />
                </div>

                {/* ORDER TYPES */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Order Types
                  </label>

                  <select
                    name="orderTypes"
                    value={formData.orderTypes}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  >
                    {ORDER_TYPE_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* LIMITS */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Limits
                  </label>

                  <input
                    type="text"
                    name="limits"
                    value={formData.limits}
                    onChange={handleChange}
                    placeholder="e.g. 5%"
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  />
                </div>

                {/* RECEIPTS */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Receipts
                  </label>

                  <select
                    name="receipts"
                    value={formData.receipts}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  >
                    {RECEIPT_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* VAT TYPE */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    VAT Type
                  </label>

                  <select
                    name="vatType"
                    value={formData.vatType}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  >
                    {VAT_TYPE_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* PAYMENT TERMS */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Payment Terms
                  </label>

                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  >
                    {PAYMENT_TERMS_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* PAYMENT METHOD */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                    Payment Method
                  </label>

                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-gray-100"
                  >
                    {PAYMENT_METHOD_OPTIONS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {editingCustomer
                    ? "Save Changes"
                    : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

