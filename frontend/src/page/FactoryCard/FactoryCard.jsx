import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import axios from "axios";
import * as XLSX from "xlsx";

import TableFooter from "./TableFooter";
import ModalAddItem from "./ModalAddItem";
import TableThead from "./TableThead";
import TableTbody from "./TableTbody";
import HistoryModal from "./HistoryModal";
import useAlert from "../../context/useAlert.jsx";

const API_URL = "/api/factory-cards";
const OPTIONS_API_URL = "/api/factory-card-options";

const EMPTY_FORM = {
  customer: "",
  partNumber: "",
  jobOrder: "",
  type: "",
  prf: false,
  status: "In",
  note: "",
};

const STATUS_ORDER = {
  in: 0,
  out: 1,
  missing: 2,
};

// =========================================================
// SORT HELPER
// =========================================================

const getSortComparison = (a, b, field) => {
  switch (field) {
    case "customer": {
      const valueA = String(a.customer ?? "")
        .trim()
        .toLowerCase();

      const valueB = String(b.customer ?? "")
        .trim()
        .toLowerCase();

      return valueA.localeCompare(valueB, undefined, {
        sensitivity: "base",
        numeric: true,
      });
    }

    case "createdAt": {
      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      return dateA - dateB;
    }

    case "type": {
      const valueA = String(a.type ?? "")
        .trim()
        .toLowerCase();

      const valueB = String(b.type ?? "")
        .trim()
        .toLowerCase();

      return valueA.localeCompare(valueB, undefined, {
        sensitivity: "base",
        numeric: true,
      });
    }

    case "prf": {
      return (
        Number(Boolean(a.prf)) -
        Number(Boolean(b.prf))
      );
    }

    case "status": {
      const valueA =
        STATUS_ORDER[
          String(a.status ?? "")
            .trim()
            .toLowerCase()
        ] ?? 999;

      const valueB =
        STATUS_ORDER[
          String(b.status ?? "")
            .trim()
            .toLowerCase()
        ] ?? 999;

      return valueA - valueB;
    }

    default:
      return 0;
  }
};

// =========================================================
// COMPONENT
// =========================================================

const FactoryCard = ({ readOnly = false }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // =========================================================
  // STATE
  // =========================================================

  const [items, setItems] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [search, setSearch] = useState("");

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState(EMPTY_FORM);

  // DEFAULT SORT
  // Factory Cards initially display Customer A → Z.
  const [sortRules, setSortRules] = useState([
    {
      field: "customer",
      direction: "asc",
    },
  ]);

  const [saving, setSaving] = useState(false);

  // =========================================================
  // AUTH CONFIG
  // =========================================================

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, []);

  // =========================================================
  // FETCH FACTORY CARDS
  // =========================================================

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get(
        API_URL,
        getAuthConfig()
      );

      setItems(
        Array.isArray(response.data?.factoryCards)
          ? response.data.factoryCards
          : []
      );
    } catch (error) {
      console.error(
        "FAILED TO FETCH FACTORY CARDS:",
        error.response?.data || error.message
      );

      setItems([]);

      showAlert(
        "error",
        "Load Failed",
        error.response?.data?.message ||
          "Failed to load Factory Cards."
      );
    }
  }, [getAuthConfig, showAlert]);

  // =========================================================
  // FETCH TYPE OPTIONS
  // =========================================================

  const fetchTypeOptions = useCallback(async () => {
    setLoadingOptions(true);

    try {
      const response = await axios.get(
        OPTIONS_API_URL,
        getAuthConfig()
      );

      setTypeOptions(
        Array.isArray(response.data?.options)
          ? response.data.options
          : []
      );
    } catch (error) {
      console.error(
        "FAILED TO FETCH FACTORY CARD TYPE OPTIONS:",
        error.response?.data || error.message
      );

      setTypeOptions([]);

      showAlert(
        "error",
        "Load Failed",
        error.response?.data?.message ||
          "Failed to load Factory Card types."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, [getAuthConfig, showAlert]);

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const authConfig = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
        };

        const [
          itemsResponse,
          optionsResponse,
        ] = await Promise.all([
          axios.get(API_URL, authConfig),
          axios.get(OPTIONS_API_URL, authConfig),
        ]);

        if (cancelled) {
          return;
        }

        setItems(
          Array.isArray(
            itemsResponse.data?.factoryCards
          )
            ? itemsResponse.data.factoryCards
            : []
        );

        setTypeOptions(
          Array.isArray(optionsResponse.data?.options)
            ? optionsResponse.data.options
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "FAILED TO LOAD FACTORY CARD DATA:",
          error.response?.data || error.message
        );

        setItems([]);
        setTypeOptions([]);

        showAlert(
          "error",
          "Load Failed",
          error.response?.data?.message ||
            "Failed to load Factory Card data."
        );
      }
    };

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [showAlert]);

  // =========================================================
  // STATUS COUNTS
  // =========================================================

  const statusCounts = useMemo(() => {
    return items.reduce(
      (counts, item) => {
        const status = String(item.status || "")
          .trim()
          .toLowerCase();

        if (status === "in") {
          counts.in += 1;
        } else if (status === "out") {
          counts.out += 1;
        } else if (status === "missing") {
          counts.missing += 1;
        }

        counts.total += 1;

        return counts;
      },
      {
        in: 0,
        out: 0,
        missing: 0,
        total: 0,
      }
    );
  }, [items]);

  // =========================================================
  // ADD TYPE
  // =========================================================

  const handleAddType = async (name) => {
    const cleanName = String(name || "").trim();

    if (!cleanName) {
      showAlert(
        "warning",
        "Missing Type",
        "Type name is required."
      );

      return false;
    }

    try {
      await axios.post(
        OPTIONS_API_URL,
        {
          category: "type",
          name: cleanName,
        },
        getAuthConfig()
      );

      await fetchTypeOptions();

      showAlert(
        "success",
        "Type Added",
        "Factory Card type added successfully."
      );

      return true;
    } catch (error) {
      console.error(
        "FAILED TO ADD FACTORY CARD TYPE:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Add Type Failed",
        error.response?.data?.message ||
          "Failed to add type."
      );

      return false;
    }
  };

  // =========================================================
  // EDIT TYPE
  // =========================================================

  const handleEditType = async (optionId, name) => {
    if (!optionId) {
      showAlert(
        "error",
        "Invalid Type",
        "The selected type is invalid."
      );

      return false;
    }

    const cleanName = String(name || "").trim();

    if (!cleanName) {
      showAlert(
        "warning",
        "Missing Type",
        "Type name is required."
      );

      return false;
    }

    try {
      const existingOption = typeOptions.find(
        (option) => option._id === optionId
      );

      await axios.put(
        `${OPTIONS_API_URL}/${optionId}`,
        {
          name: cleanName,
        },
        getAuthConfig()
      );

      await fetchTypeOptions();

      if (
        existingOption &&
        formData.type === existingOption.name
      ) {
        setFormData((previous) => ({
          ...previous,
          type: cleanName,
        }));
      }

      showAlert(
        "success",
        "Type Updated",
        "Factory Card type updated successfully."
      );

      return true;
    } catch (error) {
      console.error(
        "FAILED TO EDIT FACTORY CARD TYPE:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Update Type Failed",
        error.response?.data?.message ||
          "Failed to update type."
      );

      return false;
    }
  };

  // =========================================================
  // DELETE TYPE
  // =========================================================

  const handleDeleteType = async (optionId) => {
    if (!optionId) {
      showAlert(
        "error",
        "Invalid Type",
        "The selected type is invalid."
      );

      return false;
    }

    try {
      const deletedOption = typeOptions.find(
        (option) => option._id === optionId
      );

      await axios.delete(
        `${OPTIONS_API_URL}/${optionId}`,
        getAuthConfig()
      );

      await fetchTypeOptions();

      if (
        deletedOption &&
        formData.type === deletedOption.name
      ) {
        setFormData((previous) => ({
          ...previous,
          type: "",
        }));
      }

      showAlert(
        "success",
        "Type Deleted",
        "Factory Card type deleted successfully."
      );

      return true;
    } catch (error) {
      console.error(
        "FAILED TO DELETE FACTORY CARD TYPE:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Delete Type Failed",
        error.response?.data?.message ||
          "Failed to delete type."
      );

      return false;
    }
  };

  // =========================================================
  // LOAD HISTORY
  // =========================================================

  const loadHistory = useCallback(
    async (factoryCardId) => {
      if (!factoryCardId) {
        return;
      }

      setSelectedId(factoryCardId);
      setIsHistoryOpen(true);
      setHistoryLoading(true);

      try {
        const response = await axios.get(
          `${API_URL}/${factoryCardId}/history`,
          getAuthConfig()
        );

        setHistory(
          Array.isArray(response.data?.history)
            ? response.data.history
            : []
        );
      } catch (error) {
        console.error(
          "FAILED TO GET HISTORY:",
          error.response?.data || error.message
        );

        setHistory([]);

        showAlert(
          "error",
          "History Failed",
          error.response?.data?.message ||
            "Failed to load Factory Card history."
        );
      } finally {
        setHistoryLoading(false);
      }
    },
    [getAuthConfig, showAlert]
  );

  // =========================================================
  // OPEN HISTORY FROM NOTIFICATION
  // =========================================================

  useEffect(() => {
    const shouldOpenHistory =
      Boolean(id) &&
      Boolean(location.state?.openHistory);

    if (!shouldOpenHistory) {
      return;
    }

    let cancelled = false;

    const openNotificationHistory = async () => {
      const authConfig = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "token"
          )}`,
        },
      };

      setSelectedId(id);
      setIsHistoryOpen(true);
      setHistoryLoading(true);

      try {
        const response = await axios.get(
          `${API_URL}/${id}/history`,
          authConfig
        );

        if (cancelled) {
          return;
        }

        setHistory(
          Array.isArray(response.data?.history)
            ? response.data.history
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "FAILED TO GET HISTORY:",
          error.response?.data || error.message
        );

        setHistory([]);

        showAlert(
          "error",
          "History Failed",
          error.response?.data?.message ||
            "Failed to load Factory Card history."
        );
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }

      if (!cancelled) {
        navigate(location.pathname, {
          replace: true,
          state: {},
        });
      }
    };

    openNotificationHistory();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    location.pathname,
    location.state?.openHistory,
    navigate,
    showAlert,
  ]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredItems = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    if (!searchValue) {
      return items;
    }

    return items.filter((item) => {
      const values = [
        item.customer,
        item.partNumber,
        item.jobOrder,
        item.type,
        item.status,
        item.prf ? "yes" : "no",
      ];

      return values.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [items, search]);

  // =========================================================
  // SORT
  // =========================================================

  const sortedItems = useMemo(() => {
    if (sortRules.length === 0) {
      return filteredItems;
    }

    return [...filteredItems].sort((a, b) => {
      for (const rule of sortRules) {
        const comparison = getSortComparison(
          a,
          b,
          rule.field
        );

        if (comparison !== 0) {
          return rule.direction === "asc"
            ? comparison
            : -comparison;
        }
      }

      return 0;
    });
  }, [filteredItems, sortRules]);

  // =========================================================
  // SORT CHANGE
  // =========================================================

  const handleSortChange = useCallback(
    (field, direction) => {
      setSortRules((currentRules) => {
        const existingIndex =
          currentRules.findIndex(
            (rule) => rule.field === field
          );

        if (existingIndex === -1) {
          return [
            ...currentRules,
            {
              field,
              direction,
            },
          ];
        }

        const existingRule =
          currentRules[existingIndex];

        if (
          existingRule.direction === direction
        ) {
          return currentRules.filter(
            (_, index) =>
              index !== existingIndex
          );
        }

        return currentRules.map(
          (rule, index) =>
            index === existingIndex
              ? {
                  ...rule,
                  direction,
                }
              : rule
        );
      });

      setCurrentPage(1);
    },
    []
  );

  // =========================================================
  // EDIT FACTORY CARD
  // =========================================================

  const handleEdit = useCallback(
    (item) => {
      if (readOnly) {
        return;
      }

      const itemId = item._id || item.id;

      setSelectedId(itemId);

      setFormData({
        customer: item.customer || "",
        partNumber: item.partNumber || "",
        jobOrder: item.jobOrder || "",
        type: String(item.type || "").trim(),
        prf: Boolean(item.prf),
        status: item.status || "In",
        note: item.note || "",
      });

      fetchTypeOptions();

      setIsEdit(true);
      setIsModalOpen(true);
    },
    [fetchTypeOptions, readOnly]
  );

  // =========================================================
  // ADD FACTORY CARD
  // =========================================================

  const handleAddItem = useCallback(() => {
    if (readOnly) {
      return;
    }

    setSelectedId(null);
    setFormData(EMPTY_FORM);

    fetchTypeOptions();

    setIsEdit(false);
    setIsModalOpen(true);
  }, [fetchTypeOptions, readOnly]);

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : name === "customer"
            ? value.toUpperCase()
            : value,
    }));
  };

  // =========================================================
  // CLOSE ADD / EDIT MODAL
  // =========================================================

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setIsEdit(false);
    setSelectedId(null);
    setFormData(EMPTY_FORM);
  }, []);

  // =========================================================
  // SUBMIT FACTORY CARD
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (readOnly) {
      return;
    }

    const payload = {
      customer: formData.customer.trim(),
      partNumber: formData.partNumber.trim(),
      jobOrder: formData.jobOrder.trim(),
      type: formData.type.trim(),
      prf: Boolean(formData.prf),
      status: formData.status,
      note: formData.note.trim(),
    };

    if (!payload.type) {
      showAlert(
        "warning",
        "Missing Type",
        "Please select a type."
      );

      return;
    }

    try {
      setSaving(true);

      const response = isEdit
        ? await axios.put(
            `${API_URL}/${selectedId}`,
            payload,
            getAuthConfig()
          )
        : await axios.post(
            API_URL,
            payload,
            getAuthConfig()
          );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to save factory card."
        );
      }

      await fetchItems();

      showAlert(
        "success",
        isEdit
          ? "Factory Card Updated"
          : "Factory Card Added",
        isEdit
          ? "Factory Card updated successfully."
          : "Factory Card added successfully."
      );

      closeModal();
    } catch (error) {
      console.error(
        "FAILED TO SAVE FACTORY CARD:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        isEdit ? "Update Failed" : "Save Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to save factory card."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // HISTORY
  // =========================================================

  const handleHistory = useCallback(
    (item) => {
      const factoryCardId = item._id || item.id;

      if (factoryCardId) {
        loadHistory(factoryCardId);
      }
    },
    [loadHistory]
  );

  // =========================================================
// EXPORT EXCEL
// =========================================================

const confirmExportExcel = useCallback(() => {
  const exportData = sortedItems.map((item, index) => ({
    "#": index + 1,
    Customer: item.customer || "",
    "Part Number": item.partNumber || "",
    "Job Order": item.jobOrder || "",
    Type: item.type || "",
    PRF: item.prf ? "Yes" : "No",
    Status: item.status || "",
    Note: item.note || "",
    "Created Date": item.createdAt
      ? new Date(item.createdAt).toLocaleString()
      : "",
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(exportData);

  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 35 },
    { wch: 22 },
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Factory Cards"
  );

  const date = new Date()
    .toISOString()
    .slice(0, 10);

  XLSX.writeFile(
    workbook,
    `Factory_Card_${date}.xlsx`
  );

  showAlert(
    "success",
    "Excel Exported",
    "Factory Cards were exported successfully."
  );
}, [showAlert, sortedItems]);

const handleExportExcel = useCallback(() => {
  if (sortedItems.length === 0) {
    showAlert(
      "warning",
      "Nothing to Export",
      "There are no Factory Cards to export."
    );
    return;
  }

  showAlert(
    "confirm",
    "Confirm Excel Export",
    `Are you sure you want to export ${
      sortedItems.length
    } Factory Card${
      sortedItems.length === 1 ? "" : "s"
    } to Excel?\n\nThe current search and sorting results will be exported.`,
    {
      confirmText: "Confirm Export",
      cancelText: "Cancel",
      onConfirm: confirmExportExcel,
    }
  );
}, [
  confirmExportExcel,
  showAlert,
  sortedItems.length,
]);
  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    sortedItems.length > 0
      ? Math.ceil(
          sortedItems.length / itemsPerPage
        )
      : 0;

  const safeCurrentPage =
    totalPages === 0
      ? 1
      : Math.min(currentPage, totalPages);

  const startIndex =
    (safeCurrentPage - 1) * itemsPerPage;

  const paginatedItems = sortedItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // =========================================================
  // CLOSE HISTORY
  // =========================================================

  const closeHistory = useCallback(() => {
    setIsHistoryOpen(false);
    setHistory([]);
    setSelectedId(null);
  }, []);

  // =========================================================
  // SORT LABEL
  // =========================================================

  const getSortLabel = (rule) => {
    const labels = {
      customer: {
        asc: "Customer A → Z",
        desc: "Customer Z → A",
      },
      createdAt: {
        asc: "Created Oldest → Newest",
        desc: "Created Newest → Oldest",
      },
      type: {
        asc: "Type A → Z",
        desc: "Type Z → A",
      },
      prf: {
        asc: "PRF No → Yes",
        desc: "PRF Yes → No",
      },
      status: {
        asc: "Status IN → OUT → MISSING",
        desc: "Status MISSING → OUT → IN",
      },
    };

    return (
      labels[rule.field]?.[rule.direction] || ""
    );
  };

  // =========================================================
  // STATUS CARD DATA
  // =========================================================

  const statusCards = [
    {
      key: "in",
      label: "IN",
      value: statusCounts.in,
      description: "Cards currently inside",
      icon: "✓",
      wrapper:
        "border-emerald-200 bg-emerald-50/70",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-700",
      labelText: "text-emerald-600",
      valueText: "text-emerald-800",
    },
    {
      key: "out",
      label: "OUT",
      value: statusCounts.out,
      description: "Cards currently outside",
      icon: "↑",
      wrapper:
        "border-blue-200 bg-blue-50/70",
      iconBg: "bg-blue-100",
      iconText: "text-blue-700",
      labelText: "text-blue-600",
      valueText: "text-blue-800",
    },
    {
      key: "missing",
      label: "MISSING",
      value: statusCounts.missing,
      description: "Cards needing attention",
      icon: "!",
      wrapper:
        "border-amber-200 bg-amber-50/70",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      labelText: "text-amber-600",
      valueText: "text-amber-800",
    },
    {
      key: "total",
      label: "TOTAL",
      value: statusCounts.total,
      description: "All Factory Cards",
      icon: "#",
      wrapper:
        "border-indigo-200 bg-indigo-50/70",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-700",
      labelText: "text-indigo-600",
      valueText: "text-indigo-800",
    },
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden">
      {/* STATUS COUNTS */}

      <div className="grid w-full grid-cols-2 gap-3 xl:grid-cols-4">
        {statusCards.map((card) => (
          <div
            key={card.key}
            className={`group rounded-2xl border p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.wrapper}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.14em] ${card.labelText}`}
                >
                  {card.label}
                </p>

                <p
                  className={`mt-1 text-2xl font-extrabold tracking-tight ${card.valueText}`}
                >
                  {card.value}
                </p>

                <p className="mt-1 truncate text-[11px] text-gray-500">
                  {card.description}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-sm ${card.iconBg} ${card.iconText}`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}

      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* SEARCH */}

          <div className="relative w-full min-w-0 xl:max-w-xl">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search customer, part number, job order..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          {/* ACTIONS */}

          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={sortedItems.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-green-300 hover:bg-green-50 hover:text-green-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <span className="text-base">
                📊
              </span>

              Export Excel
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={handleAddItem}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
              >
                <span className="text-lg leading-none">
                  +
                </span>

                Add Item
              </button>
            )}
          </div>
        </div>

        {/* SEARCH RESULT INFO */}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span>
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {sortedItems.length}
            </span>{" "}
            {sortedItems.length === 1
              ? "card"
              : "cards"}
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

      {/* READ ONLY NOTICE */}

      {readOnly && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3.5 text-sm text-blue-700 shadow-sm">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700">
            i
          </div>

          <div className="min-w-0">
            <p className="font-semibold">
              Read-only access
            </p>

            <p className="mt-0.5 text-xs text-blue-600">
              You can search Factory Cards, view records,
              and check history.
            </p>
          </div>
        </div>
      )}

      {/* ACTIVE SORTS */}

      {sortRules.length > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 px-4 py-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-indigo-700">
              Sorted by
            </span>

            {sortRules.map((rule, index) => (
              <span
                key={`${rule.field}-${index}`}
                className="max-w-full rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[11px] font-medium text-indigo-700 shadow-sm"
              >
                <span className="mr-1 font-bold">
                  {index + 1}.
                </span>

                {getSortLabel(rule)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TABLE */}

      <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* TABLE HEADER */}

        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="hidden rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 sm:block">
            {items.length} total
          </div>
        </div>

        {/* TABLE SCROLL */}

        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-275 table-auto text-left text-sm">
            <TableThead
              sortRules={sortRules}
              onSortChange={handleSortChange}
            />

            <TableTbody
              filteredItems={paginatedItems}
              onEdit={
                readOnly
                  ? undefined
                  : handleEdit
              }
              onHistory={handleHistory}
              readOnly={readOnly}
            />
          </table>
        </div>

        {/* FOOTER */}

        <div className="w-full border-t border-gray-200 bg-gray-50/50">
          <TableFooter
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={sortedItems.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(value) => {
              const newValue = Number(value);

              setItemsPerPage(newValue);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ADD / EDIT MODAL */}

      {!readOnly && (
        <ModalAddItem
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
          isEdit={isEdit}
          typeOptions={typeOptions}
          loadingOptions={loadingOptions}
          saving={saving}
          isAdmin={true}
          onAddType={handleAddType}
          onEditType={handleEditType}
          onDeleteType={handleDeleteType}
        />
      )}

      {/* HISTORY MODAL */}

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        history={history}
        loading={historyLoading}
        factoryCardId={selectedId}
      />
    </div>
  );
};

export default FactoryCard;