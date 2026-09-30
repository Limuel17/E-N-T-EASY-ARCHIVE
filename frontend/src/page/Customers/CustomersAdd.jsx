
import { useCallback, useState } from "react";

import axios from "axios";

import { MdAdd, MdClose } from "react-icons/md";

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

const CustomersAdd = ({
  isOpen,
  onClose,
  onCustomerAdded,
}) => {
  const { showAlert } = useAlert();

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
     CLOSE
  ======================================================= */

  const handleClose = () => {
    if (loading) {
      return;
    }

    setFormData(createEmptyForm());

    if (onClose) {
      onClose();
    }
  };

  /* =======================================================
     SUBMIT
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

  /* =======================================================
     HIDDEN
  ======================================================= */

  if (!isOpen) {
    return null;
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <MdAdd className="text-xl" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Add Customer
                </h2>

                <p className="text-xs text-gray-500">
                  Enter customer information below
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

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

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <MdAdd className="text-xl" />
              )}

              {loading
                ? "Saving..."
                : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomersAdd;

