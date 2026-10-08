import {
useCallback,
useEffect,
useMemo,
useRef,
useState,
} from "react";

import axios from "axios";

import {
MdAdd,
MdClose,
MdRefresh,
MdSearch,
MdWork,
} from "react-icons/md";

import JobOrderTable from "./JobOrderTable";
import ModalJobOrderView from "./ModalJobOrderView";

// ============================================================
// API
// ============================================================

const API_URL = "/api/job-orders";
const CUSTOMERS_URL = "/api/customers";
const CUSTOMER_ITEMS_URL = "/api/customer-items/customer";

// ============================================================
// CONSTANTS
// ============================================================

const PRIORITIES = [
"Low",
"Medium",
"High",
"Urgent",
];

const STATUSES = [
"Pending",
"Confirmed",
"In Production",
"Completed",
"Cancelled",
];

// ============================================================
// HELPERS
// ============================================================

const getAuthConfig = () => {
const token = localStorage.getItem("token");

if (!token) {
return {};
}

return {
headers: {
Authorization: `Bearer ${token}`,
},
};
};

const getItemId = (item) => {
return String(item?._id || item?.id || "");
};

const getArrayFromResponse = (data, keys = []) => {
if (Array.isArray(data)) {
return data;
}

for (const key of keys) {
if (Array.isArray(data?.[key])) {
return data[key];
}
}

if (Array.isArray(data?.data)) {
return data.data;
}

if (
data?.data &&
typeof data.data === "object"
) {
for (const key of keys) {
if (Array.isArray(data.data?.[key])) {
return data.data[key];
}
}
}

return [];
};

const getToday = () => {
return new Date()
.toISOString()
.slice(0, 10);
};

const getErrorMessage = (
error,
fallback
) => {
return (
error?.response?.data?.message ||
error?.message ||
fallback
);
};

// ============================================================
// COMPONENT
// ============================================================

const JobOrder = () => {
// ==========================================================
// JOB ORDER STATE
// ==========================================================

const [jobOrders, setJobOrders] = useState([]);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const [selectedJobOrder, setSelectedJobOrder] =
useState(null);

const [deletingId, setDeletingId] =
useState(null);

// ==========================================================
// CREATE MODAL STATE
// ==========================================================

const [showCreateModal, setShowCreateModal] =
useState(false);

const [creating, setCreating] =
useState(false);

// ==========================================================
// CUSTOMER STATE
// ==========================================================

const [customers, setCustomers] = useState([]);

const [loadingCustomers, setLoadingCustomers] =
useState(false);

// ==========================================================
// CUSTOMER ITEM STATE
// ==========================================================

const [customerItems, setCustomerItems] =
useState([]);

const [loadingItems, setLoadingItems] =
useState(false);

const customerItemsRequestRef =
useRef(0);

// ==========================================================
// CREATE FORM
// ==========================================================

const [createForm, setCreateForm] =
useState({
customer: "",
customerItem: "",


  // NEW
  poNumber: "",

  quantity: "",
  uom: "",

  orderDate: getToday(),

  // Backend field remains dueDate.
  // UI label is Deliver Date.
  dueDate: "",

  priority: "Medium",
  status: "Pending",
  remarks: "",
});


// ==========================================================
// SELECTED CUSTOMER ITEM
// ==========================================================

const selectedCustomerItem = useMemo(() => {
if (!createForm.customerItem) {
return null;
}


return (
  customerItems.find(
    (item) =>
      getItemId(item) ===
      String(createForm.customerItem)
  ) || null
);


}, [
customerItems,
createForm.customerItem,
]);

// ==========================================================
// LOAD JOB ORDERS
// ==========================================================

const loadJobOrders = useCallback(
async () => {
try {
setLoading(true);
setError("");


    const response = await axios.get(
      API_URL,
      getAuthConfig()
    );

    const data = response?.data;

    if (!data?.success) {
      throw new Error(
        data?.message ||
          "Failed to load Job Orders."
      );
    }

    setJobOrders(
      Array.isArray(data.jobOrders)
        ? data.jobOrders
        : []
    );
  } catch (err) {
    console.error(
      "Failed to load Job Orders:",
      err
    );

    setJobOrders([]);

    setError(
      getErrorMessage(
        err,
        "Failed to load Job Orders."
      )
    );
  } finally {
    setLoading(false);
  }
},
[]


);

// ==========================================================
// INITIAL LOAD
// ==========================================================

useEffect(() => {
let cancelled = false;


const fetchJobOrders = async () => {
  try {
    const response = await axios.get(
      API_URL,
      getAuthConfig()
    );

    if (cancelled) {
      return;
    }

    const data = response?.data;

    if (!data?.success) {
      throw new Error(
        data?.message ||
          "Failed to load Job Orders."
      );
    }

    setJobOrders(
      Array.isArray(data.jobOrders)
        ? data.jobOrders
        : []
    );

    setError("");
  } catch (err) {
    if (cancelled) {
      return;
    }

    console.error(
      "Failed to load Job Orders:",
      err
    );

    setJobOrders([]);

    setError(
      getErrorMessage(
        err,
        "Failed to load Job Orders."
      )
    );
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
};

fetchJobOrders();

return () => {
  cancelled = true;
};


}, []);

// ==========================================================
// LOAD CUSTOMERS
// ==========================================================

const loadCustomers = useCallback(
async () => {
try {
setLoadingCustomers(true);


    const response = await axios.get(
      CUSTOMERS_URL,
      getAuthConfig()
    );

    const data = response?.data;

    if (!data?.success) {
      throw new Error(
        data?.message ||
          "Failed to load customers."
      );
    }

    const loadedCustomers =
      getArrayFromResponse(data, [
        "customers",
        "customerList",
      ]);

    setCustomers(loadedCustomers);
  } catch (err) {
    console.error(
      "Failed to load customers:",
      err
    );

    setCustomers([]);

    setError(
      getErrorMessage(
        err,
        "Failed to load customers."
      )
    );
  } finally {
    setLoadingCustomers(false);
  }
},
[]


);

// ==========================================================
// LOAD CUSTOMER ITEMS
// ==========================================================

const loadCustomerItems = useCallback(
async (customerId) => {
const requestId =
++customerItemsRequestRef.current;


  if (!customerId) {
    setCustomerItems([]);
    setLoadingItems(false);
    return;
  }

  try {
    setLoadingItems(true);
    setError("");

    const response = await axios.get(
      `${CUSTOMER_ITEMS_URL}/${encodeURIComponent(
        customerId
      )}`,
      getAuthConfig()
    );

    if (
      requestId !==
      customerItemsRequestRef.current
    ) {
      return;
    }

    const data = response?.data;

    if (data?.success === false) {
      throw new Error(
        data?.message ||
          "Failed to load Customer Items."
      );
    }

    const loadedItems =
      getArrayFromResponse(data, [
        "customerItems",
        "items",
        "customerItemList",
      ]);

    setCustomerItems(loadedItems);
  } catch (err) {
    if (
      requestId !==
      customerItemsRequestRef.current
    ) {
      return;
    }

    console.error(
      "Failed to load Customer Items:",
      err
    );

    setCustomerItems([]);

    setError(
      getErrorMessage(
        err,
        "Failed to load Customer Items."
      )
    );
  } finally {
    if (
      requestId ===
      customerItemsRequestRef.current
    ) {
      setLoadingItems(false);
    }
  }
},
[]


);

// ==========================================================
// OPEN CREATE MODAL
// ==========================================================

const openCreateModal = () => {
setError("");


setCreateForm({
  customer: "",
  customerItem: "",

  // NEW
  poNumber: "",

  quantity: "",
  uom: "",
  orderDate: getToday(),
  dueDate: "",
  priority: "Medium",
  status: "Pending",
  remarks: "",
});

customerItemsRequestRef.current += 1;

setCustomerItems([]);
setLoadingItems(false);

setShowCreateModal(true);

loadCustomers();


};

// ==========================================================
// CLOSE CREATE MODAL
// ==========================================================

const closeCreateModal = () => {
if (creating) {
return;
}


customerItemsRequestRef.current += 1;

setShowCreateModal(false);
setCustomerItems([]);
setLoadingItems(false);
setError("");


};

// ==========================================================
// CUSTOMER CHANGE
// ==========================================================

const handleCustomerChange = async (
event
) => {
const customerId =
event.target.value;


setCreateForm((previous) => ({
  ...previous,
  customer: customerId,
  customerItem: "",
  uom: "",
}));

setCustomerItems([]);
setError("");

if (!customerId) {
  customerItemsRequestRef.current += 1;
  setLoadingItems(false);
  return;
}

await loadCustomerItems(customerId);


};

// ==========================================================
// CUSTOMER ITEM CHANGE
// ==========================================================

const handleCustomerItemChange = (
event
) => {
const itemId =
event.target.value;


const item = customerItems.find(
  (customerItem) =>
    getItemId(customerItem) ===
    String(itemId)
);

setCreateForm((previous) => ({
  ...previous,
  customerItem: itemId,
  uom: item?.uom
    ? String(item.uom).toUpperCase()
    : "",
}));

setError("");


};

// ==========================================================
// CREATE FORM CHANGE
// ==========================================================

const handleCreateFormChange = (
event
) => {
const {
name,
value,
} = event.target;


setCreateForm((previous) => ({
  ...previous,
  [name]: value,
}));

setError("");


};

// ==========================================================
// CREATE JOB ORDER
// ==========================================================

const handleCreateJobOrder = async (
event
) => {
event.preventDefault();
setError("");


// --------------------------------------------------------
// CUSTOMER
// --------------------------------------------------------

if (!createForm.customer) {
  setError(
    "Please select a Customer."
  );
  return;
}

// --------------------------------------------------------
// CUSTOMER ITEM
// --------------------------------------------------------

if (!createForm.customerItem) {
  setError(
    "Please select a Customer Item."
  );
  return;
}

// --------------------------------------------------------
// P.O NUMBER
// --------------------------------------------------------

if (!createForm.poNumber.trim()) {
  setError(
    "Please enter the P.O Number."
  );
  return;
}

// --------------------------------------------------------
// QUANTITY
// --------------------------------------------------------

if (!createForm.quantity) {
  setError(
    "Please enter the Quantity."
  );
  return;
}

const quantity = Number(
  createForm.quantity
);

if (
  !Number.isFinite(quantity) ||
  quantity <= 0
) {
  setError(
    "Quantity must be greater than zero."
  );
  return;
}

// --------------------------------------------------------
// UOM
// --------------------------------------------------------

if (!createForm.uom) {
  setError(
    "Customer Item UOM is missing."
  );
  return;
}

// --------------------------------------------------------
// CREATE
// --------------------------------------------------------

try {
  setCreating(true);

  const payload = {
    customerId:
      createForm.customer,

    customerItemId:
      createForm.customerItem,

    // NEW
    poNumber:
      createForm.poNumber.trim(),

    quantity,

    orderDate:
      createForm.orderDate,

    dueDate:
      createForm.dueDate || null,

    priority:
      createForm.priority,

    status:
      createForm.status,

    remarks:
      createForm.remarks.trim(),
  };

  const response =
    await axios.post(
      API_URL,
      payload,
      getAuthConfig()
    );

  const data = response?.data;

  if (!data?.success) {
    throw new Error(
      data?.message ||
        "Failed to create Job Order."
    );
  }

  const newJobOrder =
    data.jobOrder || data.data;

  if (newJobOrder) {
    setJobOrders((previous) => [
      newJobOrder,
      ...previous,
    ]);
  } else {
    await loadJobOrders();
  }

  setShowCreateModal(false);
  setCustomerItems([]);
  setLoadingItems(false);
  setError("");
} catch (err) {
  console.error(
    "Failed to create Job Order:",
    err
  );

  setError(
    getErrorMessage(
      err,
      "Failed to create Job Order."
    )
  );
} finally {
  setCreating(false);
}


};

// ==========================================================
// FILTER JOB ORDERS
// ==========================================================

const filteredJobOrders = useMemo(() => {
const keyword = search
.trim()
.toLowerCase();


if (!keyword) {
  return jobOrders;
}

return jobOrders.filter(
  (jobOrder) => {
    const jobOrderNumber =
      jobOrder?.jobOrderNumber || "";

    const poNumber =
      jobOrder?.poNumber ||
      jobOrder?.purchaseOrderNumber ||
      "";

    const customerName =
      jobOrder?.customer?.name ||
      jobOrder?.customerSnapshot?.name ||
      "";

    const customerCode =
      jobOrder?.customer?.code ||
      jobOrder?.customerSnapshot?.code ||
      "";

    const itemName =
      jobOrder?.customerItem?.name ||
      jobOrder?.customerItemSnapshot?.name ||
      "";

    const itemCode =
      jobOrder?.customerItem?.code ||
      jobOrder?.customerItemSnapshot?.code ||
      "";

    const description =
      jobOrder?.customerItem?.description ||
      jobOrder?.customerItemSnapshot?.description ||
      "";

    const productType =
      jobOrder?.customerItem?.productType ||
      jobOrder?.customerItemSnapshot?.productType ||
      "";

    const status =
      jobOrder?.status || "";

    const priority =
      jobOrder?.priority || "";

    const searchableText = [
      jobOrderNumber,
      poNumber,
      customerName,
      customerCode,
      itemName,
      itemCode,
      description,
      productType,
      status,
      priority,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(
      keyword
    );
  }
);


}, [jobOrders, search]);

// ==========================================================
// DELETE JOB ORDER
// ==========================================================

const handleDeleteJobOrder = async (
jobOrder
) => {
const id = jobOrder?._id;


if (!id) {
  return;
}

const jobOrderNumber =
  jobOrder?.jobOrderNumber ||
  "this Job Order";

const confirmed =
  window.confirm(
    `Are you sure you want to delete ${jobOrderNumber}?`
  );

if (!confirmed) {
  return;
}

try {
  setDeletingId(id);
  setError("");

  const response =
    await axios.delete(
      `${API_URL}/${id}`,
      getAuthConfig()
    );

  if (!response?.data?.success) {
    throw new Error(
      response?.data?.message ||
        "Failed to delete Job Order."
    );
  }

  setJobOrders((previous) =>
    previous.filter(
      (item) =>
        String(item?._id) !==
        String(id)
    )
  );

  setSelectedJobOrder(
    (previous) => {
      if (
        String(previous?._id) ===
        String(id)
      ) {
        return null;
      }

      return previous;
    }
  );
} catch (err) {
  console.error(
    "Failed to delete Job Order:",
    err
  );

  setError(
    getErrorMessage(
      err,
      "Failed to delete Job Order."
    )
  );
} finally {
  setDeletingId(null);
}


};

// ==========================================================
// RENDER
// ==========================================================

return (
<>
{/* ======================================================
MAIN PAGE
====================================================== */}


  <div className="min-h-full w-full bg-gray-50 p-4 md:p-6">
    <div className="mx-auto max-w-[1800px] space-y-5">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="bg-linear-to-r from-slate-800 via-slate-700 to-slate-800 px-5 py-5 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
                <MdWork className="text-2xl" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-white md:text-2xl">
                  Job Order Management
                </h1>

                <p className="mt-1 text-sm text-slate-300">
                  Create and manage customer Job Orders
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 active:scale-[0.98]"
            >
              <MdAdd className="text-xl" />

              <span>
                Create Order
              </span>
            </button>
          </div>
        </div>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="border-t border-gray-100 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search Job Order, P.O Number, customer, item..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-gray-500 sm:inline">
                {filteredJobOrders.length}{" "}
                order
                {filteredJobOrders.length !==
                1
                  ? "s"
                  : ""}
              </span>

              <button
                type="button"
                onClick={loadJobOrders}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MdRefresh
                  className={
                    loading
                      ? "animate-spin text-xl"
                      : "text-xl"
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          PAGE ERROR
      ================================================== */}

      {error && !showCreateModal && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================================================
          TABLE
      ================================================== */}

      <JobOrderTable
        jobOrders={filteredJobOrders}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        onView={setSelectedJobOrder}
        onDelete={handleDeleteJobOrder}
        deletingId={deletingId}
      />
    </div>
  </div>

  {/* ======================================================
      CREATE JOB ORDER MODAL
  ====================================================== */}

  {showCreateModal && (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* =================================================
            MODAL HEADER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-slate-800 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-white">
              Create Job Order
            </h2>

            <p className="mt-1 text-sm text-slate-300">
              Create a new customer Job Order
            </p>
          </div>

          <button
            type="button"
            onClick={closeCreateModal}
            disabled={creating}
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleCreateJobOrder}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* =================================================
              FORM BODY
          ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              {/* =================================================
                  FORM ERROR
              ================================================= */}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* =================================================
                  CUSTOMER
              ================================================= */}

              <div>
                <label
                  htmlFor="customer"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Customer
                </label>

                <select
                  id="customer"
                  name="customer"
                  value={createForm.customer}
                  onChange={
                    handleCustomerChange
                  }
                  disabled={
                    loadingCustomers ||
                    creating
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {loadingCustomers
                      ? "Loading customers..."
                      : "Select Customer"}
                  </option>

                  {customers.map(
                    (customer) => {
                      const customerId =
                        getItemId(customer);

                      if (!customerId) {
                        return null;
                      }

                      return (
                        <option
                          key={customerId}
                          value={customerId}
                        >
                          {customer?.code
                            ? `${customer.code} - ${
                                customer.name ||
                                "Unnamed Customer"
                              }`
                            : customer?.name ||
                              "Unnamed Customer"}
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* =================================================
                  CUSTOMER ITEM
              ================================================= */}

              <div>
                <label
                  htmlFor="customerItem"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Customer Item
                </label>

                <select
                  id="customerItem"
                  name="customerItem"
                  value={
                    createForm.customerItem
                  }
                  onChange={
                    handleCustomerItemChange
                  }
                  disabled={
                    !createForm.customer ||
                    loadingItems ||
                    creating
                  }
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {!createForm.customer
                      ? "Select customer first"
                      : loadingItems
                        ? "Loading Customer Items..."
                        : customerItems.length ===
                            0
                          ? "No Customer Items found"
                          : "Select Customer Item"}
                  </option>

                  {customerItems.map(
                    (item) => {
                      const itemId =
                        getItemId(item);

                      if (!itemId) {
                        return null;
                      }

                      return (
                        <option
                          key={itemId}
                          value={itemId}
                        >
                          {item?.code
                            ? `${item.code} - ${
                                item.name ||
                                "Unnamed Item"
                              }`
                            : item?.name ||
                              "Unnamed Item"}
                        </option>
                      );
                    }
                  )}
                </select>

                {createForm.customer &&
                  loadingItems && (
                    <p className="mt-1.5 text-xs text-slate-500">
                      Loading Customer Items...
                    </p>
                  )}

                {createForm.customer &&
                  !loadingItems &&
                  customerItems.length ===
                    0 && (
                    <p className="mt-1.5 text-xs text-red-500">
                      No Customer Items available
                      for this customer.
                    </p>
                  )}

                {createForm.customer &&
                  !loadingItems &&
                  customerItems.length >
                    0 && (
                    <p className="mt-1.5 text-xs text-gray-400">
                      {customerItems.length} Customer Item
                      {customerItems.length !==
                      1
                        ? "s"
                        : ""}{" "}
                      available.
                    </p>
                  )}
              </div>

              {/* =================================================
                  P.O NUMBER
              ================================================= */}

              <div>
                <label
                  htmlFor="poNumber"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  P.O Number
                </label>

                <input
                  id="poNumber"
                  name="poNumber"
                  type="text"
                  value={createForm.poNumber}
                  onChange={
                    handleCreateFormChange
                  }
                  disabled={creating}
                  placeholder="Enter P.O Number"
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 uppercase outline-none placeholder:normal-case focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Enter the customer's Purchase Order number.
                </p>
              </div>

              {/* =================================================
                  SELECTED CUSTOMER ITEM
              ================================================= */}

              {selectedCustomerItem && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <MdWork className="text-lg text-slate-600" />

                    <h3 className="text-sm font-bold text-slate-800">
                      Selected Customer Item
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-3">
                    {/* CODE */}

                    <div>
                      <p className="text-xs text-gray-400">
                        Code
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.code ||
                          "—"}
                      </p>
                    </div>

                    {/* PRODUCT TYPE */}

                    <div>
                      <p className="text-xs text-gray-400">
                        Product Type
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.productType ||
                          "—"}
                      </p>
                    </div>

                    {/* NAME */}

                    <div>
                      <p className="text-xs text-gray-400">
                        Name
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.name ||
                          "—"}
                      </p>
                    </div>

                    {/* UOM */}

                    <div>
                      <p className="text-xs text-gray-400">
                        UOM
                      </p>

                      <p className="font-semibold uppercase text-gray-700">
                        {selectedCustomerItem.uom ||
                          "—"}
                      </p>
                    </div>

                    {/* WIDTH */}

                    <div>
                      <p className="text-xs text-gray-400">
                        Width
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.widthMM !=
                        null
                          ? `${selectedCustomerItem.widthMM} mm`
                          : "—"}
                      </p>
                    </div>

                    {/* LENGTH */}

                    <div>
                      <p className="text-xs text-gray-400">
                        Length
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.lengthMM !=
                        null
                          ? `${selectedCustomerItem.lengthMM} mm`
                          : "—"}
                      </p>
                    </div>

                    {/* PRINTING TYPE */}

                    <div>
                      <p className="text-xs text-gray-400">
                        Printing Type
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.printingType ||
                          "—"}
                      </p>
                    </div>

                    {/* JOINT TYPE */}

                    <div>
                      <p className="text-xs text-gray-400">
                        Joint Type
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.jointType ||
                          "—"}
                      </p>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-xs text-gray-400">
                        Description
                      </p>

                      <p className="font-semibold text-gray-700">
                        {selectedCustomerItem.description ||
                          "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  ORDER INFORMATION
              ================================================= */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* QUANTITY */}

                <div>
                  <label
                    htmlFor="quantity"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Quantity
                  </label>

                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={
                      createForm.quantity
                    }
                    onChange={
                      handleCreateFormChange
                    }
                    disabled={creating}
                    placeholder="Enter quantity"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                  />
                </div>

                {/* UOM */}

                <div>
                  <label
                    htmlFor="uom"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    UOM
                  </label>

                  <input
                    id="uom"
                    name="uom"
                    type="text"
                    value={
                      createForm.uom
                    }
                    readOnly
                    placeholder="Automatically from Customer Item"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm uppercase text-gray-700 outline-none"
                  />
                </div>

                {/* ORDER DATE */}

                <div>
                  <label
                    htmlFor="orderDate"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Order Date
                  </label>

                  <input
                    id="orderDate"
                    name="orderDate"
                    type="date"
                    value={
                      createForm.orderDate
                    }
                    onChange={
                      handleCreateFormChange
                    }
                    disabled={creating}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                  />
                </div>

                {/* DELIVER DATE */}

                <div>
                  <label
                    htmlFor="dueDate"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Deliver Date
                  </label>

                  <input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    value={
                      createForm.dueDate
                    }
                    onChange={
                      handleCreateFormChange
                    }
                    disabled={creating}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                  />
                </div>

                {/* PRIORITY */}

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Priority
                  </label>

                  <select
                    id="priority"
                    name="priority"
                    value={
                      createForm.priority
                    }
                    onChange={
                      handleCreateFormChange
                    }
                    disabled={creating}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                  >
                    {PRIORITIES.map(
                      (priority) => (
                        <option
                          key={priority}
                          value={priority}
                        >
                          {priority}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* STATUS */}

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Status
                  </label>

                  <select
                    id="status"
                    name="status"
                    value={
                      createForm.status
                    }
                    onChange={
                      handleCreateFormChange
                    }
                    disabled={creating}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                  >
                    {STATUSES.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* =================================================
                  REMARKS
              ================================================= */}

              <div>
                <label
                  htmlFor="remarks"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Remarks
                </label>

                <textarea
                  id="remarks"
                  name="remarks"
                  rows={4}
                  value={
                    createForm.remarks
                  }
                  onChange={
                    handleCreateFormChange
                  }
                  disabled={creating}
                  placeholder="Enter remarks..."
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeCreateModal}
              disabled={creating}
              className="h-11 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <MdAdd className="text-xl" />
                  Create Job Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* ======================================================
      VIEW JOB ORDER MODAL
  ====================================================== */}

  {selectedJobOrder && (
    <ModalJobOrderView
      isOpen={Boolean(
        selectedJobOrder
      )}
      jobOrder={selectedJobOrder}
      onClose={() =>
        setSelectedJobOrder(null)
      }
    />
  )}
</>


);
};

export default JobOrder;
