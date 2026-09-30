
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  MdArrowBack,
  MdBusiness,
  MdEdit,
  MdInventory2,
} from "react-icons/md";

import {
  useNavigate,
  useParams,
} from "react-router";

import useAlert from "../../context/useAlert.jsx";

const CUSTOMERS_URL = "/api/customers";

const createEditForm = (customer) => ({
  code: customer?.code || "",
  name: customer?.name || "",
  address: customer?.address || "",
  contactPerson: customer?.contactPerson || "",
  orderTypes: customer?.orderTypes || "Exact",
  limits: customer?.limits || "",
  receipts:
    customer?.receipts ||
    "SALES INVOICE/DELIVERY RECEIPT",
  vatType:
    customer?.vatType || "VAT INCLUSIVE",
  paymentTerms:
    customer?.paymentTerms || "30 DAYS",
  paymentMethod:
    customer?.paymentMethod || "Cash",
});

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [customer, setCustomer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] =
    useState(createEditForm());

  const loadCustomer = useCallback(async () => {
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
        `${CUSTOMERS_URL}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomer(
        response.data?.customer || null
      );
    } catch (error) {
      console.error(
        "FAILED TO LOAD CUSTOMER:",
        error.response?.data || error.message
      );

      setCustomer(null);

      showAlert(
        "error",
        "Load Failed",
        error.response?.data?.message ||
          "Failed to load customer."
      );
    } finally {
      setLoading(false);
    }
  }, [id, showAlert]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCustomer();
  }, [loadCustomer]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditOpen = () => {
    setFormData(createEditForm(customer));
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );
      return;
    }

    if (!formData.code.trim()) {
      showAlert(
        "warning",
        "Missing Code",
        "Please enter the customer code."
      );
      return;
    }

    if (!formData.name.trim()) {
      showAlert(
        "warning",
        "Missing Customer Name",
        "Please enter the customer name."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `${CUSTOMERS_URL}/${id}`,
        {
          code: formData.code.trim(),
          name: formData.name.trim(),
          address: formData.address.trim(),
          contactPerson:
            formData.contactPerson.trim(),
          orderTypes: formData.orderTypes,
          limits: formData.limits.trim(),
          receipts: formData.receipts,
          vatType: formData.vatType,
          paymentTerms: formData.paymentTerms,
          paymentMethod:
            formData.paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedCustomer =
        response.data?.customer;

      if (updatedCustomer) {
        setCustomer(updatedCustomer);
      } else {
        await loadCustomer();
      }

      setShowEditModal(false);

      showAlert(
        "success",
        "Customer Updated",
        "Customer information has been updated successfully."
      );
    } catch (error) {
      console.error(
        "FAILED TO UPDATE CUSTOMER:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Update Failed",
        error.response?.data?.message ||
          "Failed to update customer."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="w-full p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <MdArrowBack className="text-lg" />
          Back
        </button>

        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <MdBusiness className="mx-auto text-5xl text-gray-300" />

          <h2 className="mt-3 text-lg font-bold text-gray-800">
            Customer Not Found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            The requested customer could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-w-0 space-y-6 overflow-x-hidden p-6">
        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="shrink-0 rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
              aria-label="Back"
            >
              <MdArrowBack className="text-xl" />
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-gray-900">
                Customer Details
              </h1>

              <p className="mt-1 truncate text-sm text-gray-500">
                {customer.name || "Customer"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEditOpen}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <MdEdit className="text-lg" />
            Edit Customer
          </button>
        </div>

        {/* ========================================================
            CUSTOMER INFORMATION
        ======================================================== */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <MdBusiness className="text-xl" />
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900">
                Customer Information
              </h2>

              <p className="text-xs text-gray-500">
                Customer account information
              </p>
            </div>
          </div>

          <div className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Customer Code"
              value={customer.code}
            />

            <InfoItem
              label="Customer Name"
              value={customer.name}
            />

            <InfoItem
              label="Contact Person"
              value={customer.contactPerson}
            />

            <InfoItem
              label="Address"
              value={customer.address}
              className="sm:col-span-2 lg:col-span-3"
            />

            <InfoItem
              label="Order Types"
              value={customer.orderTypes}
            />

            <InfoItem
              label="Limits"
              value={customer.limits}
            />

            <InfoItem
              label="Receipts"
              value={customer.receipts}
            />

            <InfoItem
              label="VAT Type"
              value={customer.vatType}
            />

            <InfoItem
              label="Payment Terms"
              value={customer.paymentTerms}
            />

            <InfoItem
              label="Payment Method"
              value={customer.paymentMethod}
            />
          </div>
        </section>

        {/* ========================================================
            ITEMS
        ======================================================== */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              + Add Item
            </button>
          </div>

          <div className="w-full overflow-x-auto overscroll-x-contain">
            <table className="min-w-225 w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <TableHeader>#</TableHeader>
                  <TableHeader>Item Code</TableHeader>
                  <TableHeader>Item Name</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Unit</TableHeader>
                  <TableHeader>Price</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-14 text-center"
                  >
                    <MdInventory2 className="mx-auto mb-3 text-4xl text-gray-300" />

                    <p className="text-sm font-semibold text-gray-500">
                      No items yet
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Add an item for this customer.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ==========================================================
          EDIT CUSTOMER MODAL
      ========================================================== */}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Customer
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Update customer information
                </p>
              </div>

              <button
                type="button"
                onClick={handleEditClose}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="min-h-0 overflow-y-auto"
            >
              <div className="grid gap-5 p-5 sm:grid-cols-2">
                <FormInput
                  label="Customer Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />

                <FormInput
                  label="Customer Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <FormInput
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />

                <FormInput
                  label="Limits"
                  name="limits"
                  value={formData.limits}
                  onChange={handleChange}
                  placeholder="Example: 5%"
                />

                <div className="sm:col-span-2">
                  <FormTextarea
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <FormSelect
                  label="Order Types"
                  name="orderTypes"
                  value={formData.orderTypes}
                  onChange={handleChange}
                  options={[
                    "Overrun",
                    "Underrun",
                    "Exact",
                    "OVERRUN/UNDERRUN",
                  ]}
                />

                <FormSelect
                  label="Receipts"
                  name="receipts"
                  value={formData.receipts}
                  onChange={handleChange}
                  options={[
                    "SALES INVOICE/DELIVERY RECEIPT",
                    "ACKNOWLEDGMENT RECEIPT",
                    "ACKNOWLEDGMENT RECEIPT Miscellaneous",
                  ]}
                />

                <FormSelect
                  label="VAT Type"
                  name="vatType"
                  value={formData.vatType}
                  onChange={handleChange}
                  options={[
                    "VAT ZERO RATED",
                    "VAT INCLUSIVE",
                    "VAT EXCLUSIVE",
                  ]}
                />

                <FormSelect
                  label="Payment Terms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  options={[
                    "ADVANCE",
                    "15 DAYS",
                    "30 DAYS",
                    "45 DAYS",
                    "60 DAYS",
                    "90 DAYS",
                    "50% DP",
                    "50% DP - 50% COD",
                    "NOT APPLICABLE",
                  ]}
                />

                <FormSelect
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  options={[
                    "Cash",
                    "Credit Card",
                    "Debit Card",
                    "Digital Wallets",
                    "Bank Transfers",
                  ]}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleEditClose}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

/* ============================================================
   INFO ITEM
============================================================ */

const InfoItem = ({
  label,
  value,
  className = "",
}) => (
  <div className={className}>
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="wrap-break-words text-sm font-semibold text-gray-800">
      {value || "—"}
    </p>
  </div>
);

/* ============================================================
   FORM INPUT
============================================================ */

const FormInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label}
      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </span>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
    />
  </label>
);

/* ============================================================
   FORM TEXTAREA
============================================================ */

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label}
    </span>

    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
    />
  </label>
);

/* ============================================================
   FORM SELECT
============================================================ */

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label}
    </span>

    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  </label>
);

/* ============================================================
   TABLE HEADER
============================================================ */

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

export default CustomerDetails;

