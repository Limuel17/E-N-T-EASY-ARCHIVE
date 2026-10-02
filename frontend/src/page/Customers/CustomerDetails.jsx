import { useEffect, useState } from "react";
import axios from "axios";
import {
  MdArrowBack,
  MdBusiness,
  MdClose,
  MdEdit,
  MdLocationOn,
  MdPayments,
  MdPerson,
  MdSave,
} from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import useAlert from "../../context/useAlert.jsx";
import CustomerItemTable from "./CustomerItem/CustomerItemTable.jsx";
import ModalCustomerItem from "./CustomerItem/ModalCustomerItem.jsx";

const CUSTOMERS_URL = "/api/customers";

// ============================================================
// FORM
// ============================================================

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
  vatType: customer?.vatType || "VAT INCLUSIVE",
  paymentTerms: customer?.paymentTerms || "30 DAYS",
  paymentMethod: customer?.paymentMethod || "Cash",
});

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
// CUSTOMER DETAILS
// ============================================================

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // ==========================================================
  // STATE
  // ==========================================================

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(
    createEditForm(null)
  );

  const [showItemModal, setShowItemModal] =
    useState(false);

  const [editingItem, setEditingItem] =
    useState(null);

  // ==========================================================
  // LOAD CUSTOMER
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchCustomer = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setLoading(false);

          showAlert(
            "error",
            "Authentication Error",
            "Authentication token not found."
          );
        }

        return;
      }

      if (!id) {
        if (!cancelled) {
          setLoading(false);
          setCustomer(null);

          showAlert(
            "error",
            "Invalid Customer",
            "Customer ID was not found."
          );
        }

        return;
      }

      try {
        if (!cancelled) {
          setLoading(true);
        }

        const response = await axios.get(
          `${CUSTOMERS_URL}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setCustomer(
            response.data?.customer || null
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "FAILED TO LOAD CUSTOMER:",
            error.response?.data || error.message
          );

          setCustomer(null);

          showAlert(
            "error",
            "Load Failed",
            error.response?.data?.message ||
              error.message ||
              "Failed to load customer."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      cancelled = true;
    };
  }, [id, showAlert]);

  // ==========================================================
  // BACK
  // ==========================================================

  const handleBack = () => {
    navigate(-1);
  };

  // ==========================================================
  // EDIT CUSTOMER
  // ==========================================================

  const handleEditOpen = () => {
    if (!customer) {
      return;
    }

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
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "code" || name === "name"
          ? value.toUpperCase()
          : value,
    }));
  };

  // ==========================================================
  // SAVE CUSTOMER
  // ==========================================================

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

    if (!id) {
      showAlert(
        "error",
        "Invalid Customer",
        "Customer ID was not found."
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
      setSaving(true);

      const response = await axios.put(
        `${CUSTOMERS_URL}/${id}`,
        payload,
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
        const reloadResponse = await axios.get(
          `${CUSTOMERS_URL}/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCustomer(
          reloadResponse.data?.customer || null
        );
      }

      setShowEditModal(false);

      showAlert(
        "success",
        "Customer Updated",
        "The customer information was updated successfully."
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
          error.message ||
          "Failed to update customer."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CUSTOMER ITEMS
  // ==========================================================

  const handleAddItem = () => {
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowItemModal(true);
  };

  const handleItemModalClose = () => {
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleItemSaved = () => {
    setShowItemModal(false);
    setEditingItem(null);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-100 w-full items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-700">
            Loading customer...
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!customer) {
    return (
      <div className="flex min-h-100 w-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
            <MdBusiness className="text-3xl" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Customer Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            The customer may have been deleted or
            is no longer available.
          </p>

          <button
            type="button"
            onClick={handleBack}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <MdArrowBack className="text-lg" />
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CUSTOMER INITIAL
  // ==========================================================

  const customerInitial =
    customer.name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "C";

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden p-4 sm:p-5 lg:p-6">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 px-5 py-5 text-white shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

        <div className="pointer-events-none absolute -bottom-20 right-28 h-32 w-32 rounded-full bg-violet-300/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl font-extrabold shadow-inner ring-1 ring-white/20 backdrop-blur-sm">
              {customerInitial}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-100 ring-1 ring-white/10">
                  Customer
                </span>

                {customer.code && (
                  <span className="rounded-md bg-white px-2 py-1 text-[10px] font-extrabold tracking-wider text-indigo-700 shadow-sm">
                    {customer.code}
                  </span>
                )}
              </div>

              <h1 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
                {customer.name}
              </h1>

              <p className="mt-0.5 text-xs text-indigo-100">
                Customer profile and registered items
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <MdArrowBack className="text-lg" />

              <span className="hidden sm:inline">
                Back
              </span>
            </button>

            <button
              type="button"
              onClick={handleEditOpen}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
            >
              <MdEdit className="text-lg" />
              Edit Customer
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================
          CUSTOMER SUMMARY
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 sm:grid-cols-4 sm:divide-y-0">
          <SummaryItem
            label="Customer Code"
            value={customer.code}
          />

          <SummaryItem
            label="Contact Person"
            value={customer.contactPerson}
          />

          <SummaryItem
            label="Payment Terms"
            value={customer.paymentTerms}
          />

          <SummaryItem
            label="Payment Method"
            value={customer.paymentMethod}
          />
        </div>
      </div>

      {/* ======================================================
          CUSTOMER INFORMATION
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="flex min-h-14 items-center border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <MdBusiness className="text-lg" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-800">
                Customer Information
              </h2>

              <p className="hidden text-[11px] text-gray-400 sm:block">
                Customer identity, contact, and payment information
              </p>
            </div>
          </div>
        </div>

        {/* CONTENT */}

        <div className="space-y-5 p-4 sm:p-5">
          {/* IDENTITY */}

          <section>
            <SectionLabel
              icon={<MdPerson />}
              title="Identity & Contact"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            </div>
          </section>

          {/* BUSINESS */}

          <section>
            <SectionLabel
              icon={<MdPayments />}
              title="Business & Payment"
            />

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Order Types"
                value={customer.orderTypes}
                badge="blue"
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
                badge="purple"
              />

              <InfoItem
                label="Payment Terms"
                value={customer.paymentTerms}
                badge="green"
              />

              <InfoItem
                label="Payment Method"
                value={customer.paymentMethod}
                badge="amber"
              />
            </div>
          </section>

          {/* ADDRESS */}

          <section>
            <SectionLabel
              icon={<MdLocationOn />}
              title="Address"
            />

            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="wrap-break-word text-sm leading-6 text-gray-700">
                {customer.address ||
                  "No address provided."}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* ======================================================
          CUSTOMER ITEMS
      ====================================================== */}

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="flex min-h-14 items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <MdBusiness className="text-lg" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-800">
                Customer Items
              </h2>

              <p className="hidden truncate text-[11px] text-gray-400 sm:block">
                Products and item specifications registered for this customer
              </p>
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="w-full min-w-0 overflow-hidden">
          <CustomerItemTable
            customerId={id}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
          />
        </div>
      </div>

      {/* ======================================================
          CUSTOMER ITEM MODAL
      ====================================================== */}

      <ModalCustomerItem
        isOpen={showItemModal}
        onClose={handleItemModalClose}
        customerId={id}
        editItem={editingItem}
        onSaved={handleItemSaved}
      />

      {/* ======================================================
          EDIT CUSTOMER MODAL
      ====================================================== */}

      {showEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              handleEditClose();
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MdEdit className="text-xl" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900">
                    Edit Customer
                  </h2>

                  <p className="truncate text-[11px] text-gray-400">
                    Update customer information and payment settings
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEditClose}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-gray-700 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Close"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="min-h-0 overflow-y-auto"
            >
              <div className="space-y-4 p-4 sm:p-5">
                {/* BASIC */}

                <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <SectionTitle
                    title="Basic Information"
                    subtitle="Customer identification and contact details."
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <FormInput
                      label="Customer Code"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />

                    <FormInput
                      label="Customer Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />

                    <FormInput
                      label="Contact Person"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      disabled={saving}
                    />

                    <FormInput
                      label="Limits"
                      name="limits"
                      value={formData.limits}
                      onChange={handleChange}
                      disabled={saving}
                      placeholder="Example: 5%"
                    />

                    <div className="sm:col-span-2">
                      <FormTextarea
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={saving}
                        placeholder="Enter complete customer address"
                      />
                    </div>
                  </div>
                </section>

                {/* ORDER */}

                <section className="rounded-xl border border-gray-200 bg-white p-4">
                  <SectionTitle
                    title="Order & Receipt Settings"
                    subtitle="Configure order and receipt handling."
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <FormSelect
                      label="Order Types"
                      name="orderTypes"
                      value={formData.orderTypes}
                      onChange={handleChange}
                      options={ORDER_TYPE_OPTIONS}
                      disabled={saving}
                    />

                    <FormSelect
                      label="Receipts"
                      name="receipts"
                      value={formData.receipts}
                      onChange={handleChange}
                      options={RECEIPT_OPTIONS}
                      disabled={saving}
                    />
                  </div>
                </section>

                {/* PAYMENT */}

                <section className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                  <SectionTitle
                    title="Tax & Payment"
                    subtitle="VAT and payment preferences."
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <FormSelect
                      label="VAT Type"
                      name="vatType"
                      value={formData.vatType}
                      onChange={handleChange}
                      options={VAT_TYPE_OPTIONS}
                      disabled={saving}
                    />

                    <FormSelect
                      label="Payment Terms"
                      name="paymentTerms"
                      value={formData.paymentTerms}
                      onChange={handleChange}
                      options={PAYMENT_TERMS_OPTIONS}
                      disabled={saving}
                    />

                    <FormSelect
                      label="Payment Method"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      options={PAYMENT_METHOD_OPTIONS}
                      disabled={saving}
                    />
                  </div>
                </section>
              </div>

              {/* FOOTER */}

              <div className="flex shrink-0 flex-col-reverse gap-2.5 border-t border-gray-200 bg-white px-4 py-3.5 sm:flex-row sm:justify-end sm:px-5">
                <button
                  type="button"
                  onClick={handleEditClose}
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <MdSave className="text-lg" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SUMMARY ITEM
// ============================================================

const SummaryItem = ({ label, value }) => (
  <div className="min-w-0 px-4 py-3.5 sm:px-5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
      {label}
    </p>

    <p className="mt-1 truncate text-xs font-bold text-gray-700">
      {value || "—"}
    </p>
  </div>
);

// ============================================================
// SECTION LABEL
// ============================================================

const SectionLabel = ({ icon, title }) => (
  <div className="flex items-center gap-2">
    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </span>

    <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">
      {title}
    </h3>
  </div>
);

// ============================================================
// INFO ITEM
// ============================================================

const InfoItem = ({
  label,
  value,
  badge = "",
}) => {
  const badgeClasses = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-indigo-200 hover:shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      {badge ? (
        <div className="mt-1.5">
          <span
            className={`inline-flex max-w-full rounded-lg px-2.5 py-1 text-xs font-semibold ${
              badgeClasses[badge] ||
              "bg-gray-100 text-gray-700"
            }`}
          >
            <span className="wrap-break-word">
              {value || "—"}
            </span>
          </span>
        </div>
      ) : (
        <p className="mt-1.5 wrap-break-word text-sm font-semibold leading-5 text-gray-800">
          {value || "—"}
        </p>
      )}
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
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
);

export default CustomerDetails;