import { useCallback, useState } from "react";
import axios from "axios";
import {
  MdBusiness,
  MdClose,
  MdSave,
} from "react-icons/md";
import useAlert from "../../context/useAlert.jsx";

const CUSTOMERS_URL = "/api/customers";

// ============================================================
// OPTIONS
// ============================================================

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
  "Cheque",
  "COD",
];

// ============================================================
// EMPTY FORM
// ============================================================

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

// ============================================================
// COMPONENT
// ============================================================

const CustomersAdd = ({
  isOpen,
  onClose,
  onCustomerAdded,
}) => {
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState(
    createEmptyForm()
  );

  const [loading, setLoading] = useState(false);

  // ============================================================
  // AUTH CONFIG
  // ============================================================

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  // ============================================================
  // FORM CHANGE
  // ============================================================

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

  // ============================================================
  // CLOSE
  // ============================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    setFormData(createEmptyForm());

    if (onClose) {
      onClose();
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

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

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );
      return;
    }

    const payload = {
      code: cleanCode,
      name: cleanName,
      address: formData.address.trim(),
      contactPerson: formData.contactPerson.trim(),
      orderTypes: formData.orderTypes,
      limits: formData.limits.trim(),
      receipts: formData.receipts,
      vatType: formData.vatType,
      paymentTerms: formData.paymentTerms,
      paymentMethod: formData.paymentMethod,
    };

    try {
      setLoading(true);

      const response = await axios.post(
        CUSTOMERS_URL,
        payload,
        getAuthConfig()
      );

      const newCustomer = response.data?.customer;

      if (!newCustomer) {
        throw new Error(
          "New customer data was not returned."
        );
      }

      showAlert(
        "success",
        "Customer Added",
        "The customer was added successfully."
      );

      setFormData(createEmptyForm());

      if (onCustomerAdded) {
        onCustomerAdded(newCustomer);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error(
        "FAILED TO ADD CUSTOMER:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Save Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to add customer."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HIDDEN
  // ============================================================

  if (!isOpen) {
    return null;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          handleClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-linear-to-r from-indigo-50 via-white to-violet-50 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
              <MdBusiness className="text-2xl" />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">
                Add Customer
              </h2>

              <p className="mt-0.5 truncate text-xs text-gray-500">
                Create a new customer profile
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white hover:text-gray-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Close"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="min-h-0 overflow-y-auto"
        >
          <div className="space-y-6 p-5 sm:p-6">
            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
              <SectionTitle
                title="Basic Information"
                subtitle="Enter the customer's identification and contact details."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Customer Code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Example: ABC"
                  required
                  disabled={loading}
                />

                <FormInput
                  label="Customer Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                  disabled={loading}
                />

                <FormInput
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Enter contact person"
                  disabled={loading}
                />

                <FormInput
                  label="Limits"
                  name="limits"
                  value={formData.limits}
                  onChange={handleChange}
                  placeholder="Example: 5%"
                  disabled={loading}
                />

                <div className="sm:col-span-2">
                  <FormTextarea
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete customer address"
                    disabled={loading}
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                ORDER & RECEIPTS
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <SectionTitle
                title="Order & Receipt Settings"
                subtitle="Configure how orders and receipts are handled for this customer."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormSelect
                  label="Order Types"
                  name="orderTypes"
                  value={formData.orderTypes}
                  onChange={handleChange}
                  options={ORDER_TYPE_OPTIONS}
                  disabled={loading}
                />

                <FormSelect
                  label="Receipts"
                  name="receipts"
                  value={formData.receipts}
                  onChange={handleChange}
                  options={RECEIPT_OPTIONS}
                  disabled={loading}
                />
              </div>
            </section>

            {/* =================================================
                TAX & PAYMENT
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5">
              <SectionTitle
                title="Tax & Payment"
                subtitle="Set the customer's VAT and payment preferences."
              />

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FormSelect
                  label="VAT Type"
                  name="vatType"
                  value={formData.vatType}
                  onChange={handleChange}
                  options={VAT_TYPE_OPTIONS}
                  disabled={loading}
                />

                <FormSelect
                  label="Payment Terms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                  options={PAYMENT_TERMS_OPTIONS}
                  disabled={loading}
                />

                <FormSelect
                  label="Payment Method"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  options={PAYMENT_METHOD_OPTIONS}
                  disabled={loading}
                />
              </div>
            </section>
          </div>

          {/* ===================================================
              FOOTER
          =================================================== */}

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <MdSave className="text-lg" />
                  Add Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// SECTION TITLE
// ============================================================

const SectionTitle = ({
  title,
  subtitle,
}) => (
  <div className="border-b border-gray-200 pb-3">
    <h3 className="text-sm font-bold text-gray-900">
      {title}
    </h3>

    <p className="mt-1 text-xs leading-5 text-gray-500">
      {subtitle}
    </p>
  </div>
);

// ============================================================
// FORM INPUT
// ============================================================

const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
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
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
    />
  </label>
);

// ============================================================
// FORM TEXTAREA
// ============================================================

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  disabled = false,
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
      placeholder={placeholder}
      disabled={disabled}
      className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
    />
  </label>
);

// ============================================================
// FORM SELECT
// ============================================================

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
}) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-gray-600">
      {label}
    </span>

    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 outline-none transition hover:border-gray-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
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

export default CustomersAdd;