import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiFilter,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext";
import useAlert from "../../context/useAlert.jsx";

import MachineOperationLogTable from "./MachineOperationLogTable";
import ModalAddMachineOperationLog from "./ModalAddMachineOperationLog";
import MachineOperationLogDetailsModal from "./MachineOperationLogDetailsModal";

const API_URL = "/api/machine-operation-logs";

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50];

const SORT_LABELS = {
  customer: "Customer",
  itemDescription: "Item Description",
  dimension: "Dimension",
  flute: "Flute",
  joint: "Joint",
  boxType: "Box Type",
  code: "Code",
  requestedBy: "Requested By",
  date: "Date",
};

const normalize = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim();
};

const getSortValue = (log, field) => {
  switch (field) {
    case "customer":
      return normalize(log.customer);

    case "itemDescription":
      return normalize(log.itemDescription);

    case "dimension":
      return normalize(log.dimension);

    case "flute":
      return normalize(log.flute);

    case "joint":
      return normalize(log.joint);

    case "boxType":
      return normalize(log.boxType);

    case "code":
      return normalize(log.code);

    case "requestedBy":
      return normalize(log.requestedBy?.name);

    case "date":
      return new Date(log.date || 0).getTime();

    default:
      return "";
  }
};

const SortOption = ({
  field,
  label,
  sortConfig,
  onSort,
}) => {
  const index = sortConfig.findIndex(
    (item) => item.field === field
  );

  const active = index >= 0;

  const current = active
    ? sortConfig[index]
    : null;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${
        active
          ? "bg-indigo-50 text-indigo-700"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <span className="flex items-center gap-2">
        {active && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
            {index + 1}
          </span>
        )}

        <span>{label}</span>
      </span>

      {active && (
        <span>
          {current.direction === "asc" ? (
            <FiChevronUp />
          ) : (
            <FiChevronDown />
          )}
        </span>
      )}
    </button>
  );
};

const MachineOperationLog = ({
  readOnly = false,
}) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const userRole = String(
    user?.role || ""
  ).toLowerCase();

  const isAdmin =
    userRole === "admin" && !readOnly;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] =
    useState([]);

  const [sortOpen, setSortOpen] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  const [addModalOpen, setAddModalOpen] =
    useState(false);

  const [editingLog, setEditingLog] =
    useState(null);

  const [selectedLog, setSelectedLog] =
    useState(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [logToDelete, setLogToDelete] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // ============================================================
  // FETCH LOGS
  // ============================================================

  const fetchLogs = useCallback(
    async (showRefreshing = false) => {
      const token = getToken();

      if (!token) {
        setLogs([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        if (showRefreshing) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await axios.get(
          API_URL,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          setLogs(response.data.logs || []);
        } else {
          setLogs([]);
        }
      } catch (error) {
        console.error(
          "FETCH MACHINE OPERATION LOGS ERROR:",
          error.response?.data ||
            error.message
        );

        showAlert(
          "error",
          "Load Failed",
          error.response?.data?.message ||
            "Failed to fetch machine operation logs."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showAlert]
  );

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchLogs]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  // ============================================================
  // ITEMS PER PAGE
  // ============================================================

  const handleItemsPerPageChange = (
    event
  ) => {
    setItemsPerPage(
      Number(event.target.value)
    );

    setCurrentPage(1);
  };

  // ============================================================
  // SORT
  // ============================================================

  const handleSort = (field) => {
    setCurrentPage(1);

    setSortConfig((previous) => {
      const existingIndex =
        previous.findIndex(
          (item) => item.field === field
        );

      if (existingIndex === -1) {
        return [
          ...previous,
          {
            field,
            direction: "asc",
          },
        ];
      }

      const existing =
        previous[existingIndex];

      if (existing.direction === "asc") {
        return previous.map(
          (item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  direction: "desc",
                }
              : item
        );
      }

      return previous.filter(
        (item) => item.field !== field
      );
    });
  };

  const clearSorts = () => {
    setSortConfig([]);
    setCurrentPage(1);
  };

  // ============================================================
  // FILTER + SORT
  // ============================================================

  const filteredAndSortedLogs = useMemo(() => {
    const query = normalize(search);

    const filtered = logs.filter((log) => {
      if (!query) {
        return true;
      }

      const searchableText = [
        log.customer,
        log.itemDescription,
        log.dimension,
        log.flute,
        log.joint,
        log.boxType,
        log.code,
        log.requestedBy?.name,
        log.requestedBy?.position,
        log.requestedBy?.email,
        log.remarks,
      ]
        .map(normalize)
        .join(" ");

      return searchableText.includes(query);
    });

    if (sortConfig.length === 0) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      for (const sort of sortConfig) {
        const aValue = getSortValue(
          a,
          sort.field
        );

        const bValue = getSortValue(
          b,
          sort.field
        );

        if (aValue === bValue) {
          continue;
        }

        const comparison =
          typeof aValue === "number" &&
          typeof bValue === "number"
            ? aValue - bValue
            : String(aValue).localeCompare(
                String(bValue),
                undefined,
                {
                  numeric: true,
                  sensitivity: "base",
                }
              );

        return sort.direction === "asc"
          ? comparison
          : -comparison;
      }

      return 0;
    });
  }, [logs, search, sortConfig]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalItems =
    filteredAndSortedLogs.length;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedLogs = useMemo(() => {
    const start =
      (safeCurrentPage - 1) *
      itemsPerPage;

    return filteredAndSortedLogs.slice(
      start,
      start + itemsPerPage
    );
  }, [
    filteredAndSortedLogs,
    safeCurrentPage,
    itemsPerPage,
  ]);

  const pageStart =
    totalItems === 0
      ? 0
      : (safeCurrentPage - 1) *
          itemsPerPage +
        1;

  const pageEnd =
    totalItems === 0
      ? 0
      : Math.min(
          safeCurrentPage * itemsPerPage,
          totalItems
        );

  // ============================================================
  // ADD
  // ============================================================

  const handleAdd = () => {
    setEditingLog(null);
    setAddModalOpen(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (log) => {
    setEditingLog(log);
    setAddModalOpen(true);
  };

  // ============================================================
  // VIEW
  // ============================================================

  const handleView = (log) => {
    setSelectedLog(log);
    setDetailsOpen(true);
  };

  // ============================================================
  // CLOSE ADD / EDIT MODAL
  // ============================================================

  const closeAddModal = () => {
    if (saving) {
      return;
    }

    setAddModalOpen(false);
    setEditingLog(null);
  };

  // ============================================================
  // SAVE LOG
  // ============================================================

  const handleSubmit = async (formData) => {
    const token = getToken();

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );

      return;
    }

    try {
      setSaving(true);

      let response;

      if (editingLog?._id) {
        response = await axios.put(
          `${API_URL}/${editingLog._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          API_URL,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      if (!response.data?.success) {
        showAlert(
          "error",
          "Save Failed",
          response.data?.message ||
            "Failed to save machine operation log."
        );

        return;
      }

      showAlert(
        "success",
        editingLog
          ? "Log Updated"
          : "Log Created",
        editingLog
          ? "Machine operation log updated successfully."
          : "Machine operation log created successfully."
      );

      setAddModalOpen(false);
      setEditingLog(null);

      await fetchLogs(true);
    } catch (error) {
      console.error(
        "SAVE MACHINE OPERATION LOG ERROR:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",
        "Save Failed",
        error.response?.data?.message ||
          "Failed to save machine operation log."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDeleteClick = (log) => {
    setLogToDelete(log);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteModalOpen(false);
    setLogToDelete(null);
  };

  const confirmDelete = async () => {
    if (!logToDelete?._id) {
      return;
    }

    const token = getToken();

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );

      return;
    }

    try {
      setDeleting(true);

      const response = await axios.delete(
        `${API_URL}/${logToDelete._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        showAlert(
          "error",
          "Delete Failed",
          response.data?.message ||
            "Failed to delete machine operation log."
        );

        return;
      }

      setLogs((previous) =>
        previous.filter(
          (log) =>
            log._id !== logToDelete._id
        )
      );

      setDeleteModalOpen(false);
      setLogToDelete(null);

      showAlert(
        "success",
        "Log Deleted",
        "Machine operation log deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE MACHINE OPERATION LOG ERROR:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",
        "Delete Failed",
        error.response?.data?.message ||
          "Failed to delete machine operation log."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-5">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FiFileText className="text-xl" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Machine Operation Log
              </h1>

              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Record and monitor machine
                operation information.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md"
            >
              <FiPlus />
              New Log
            </button>
          )}
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search customer, item, dimension, code, requester..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setSortOpen(
                  (previous) => !previous
                )
              }
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition lg:w-auto ${
                sortConfig.length > 0
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiFilter />

              Sort

              {sortConfig.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                  {sortConfig.length}
                </span>
              )}

              {sortOpen ? (
                <FiChevronUp />
              ) : (
                <FiChevronDown />
              )}
            </button>

            {sortOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close sort menu"
                  onClick={() =>
                    setSortOpen(false)
                  }
                  className="fixed inset-0 z-40 cursor-default"
                />

                <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        Sort Records
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400">
                        Select multiple columns in
                        priority order
                      </p>
                    </div>

                    {sortConfig.length > 0 && (
                      <button
                        type="button"
                        onClick={clearSorts}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-105 overflow-y-auto">
                    {Object.entries(
                      SORT_LABELS
                    ).map(
                      ([field, label]) => (
                        <SortOption
                          key={field}
                          field={field}
                          label={label}
                          sortConfig={
                            sortConfig
                          }
                          onSort={handleSort}
                        />
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {sortConfig.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
              Active Sort:
            </span>

            {sortConfig.map(
              (sort, index) => (
                <span
                  key={sort.field}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-[10px] font-bold text-indigo-700"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100">
                    {index + 1}
                  </span>

                  {SORT_LABELS[sort.field]}

                  {sort.direction === "asc"
                    ? "↑"
                    : "↓"}
                </span>
              )
            )}
          </div>
        )}
      </div>

      {/* SUMMARY */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Showing{" "}
          <span className="font-bold text-gray-700">
            {pageStart}
          </span>{" "}
          to{" "}
          <span className="font-bold text-gray-700">
            {pageEnd}
          </span>{" "}
          of{" "}
          <span className="font-bold text-gray-700">
            {totalItems}
          </span>{" "}
          records
        </p>

        <div className="flex items-center gap-2">
          <label
            htmlFor="machineLogItemsPerPage"
            className="text-xs font-medium text-gray-500"
          >
            Rows:
          </label>

          <select
            id="machineLogItemsPerPage"
            value={itemsPerPage}
            onChange={
              handleItemsPerPageChange
            }
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-indigo-500"
          >
            {ITEMS_PER_PAGE_OPTIONS.map(
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

      {/* TABLE */}
      {loading ? (
        <div className="flex min-h-80 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-center">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-gray-200 border-t-indigo-600" />

            <p className="mt-3 text-sm font-semibold text-gray-600">
              Loading machine operation logs...
            </p>
          </div>
        </div>
      ) : (
        <MachineOperationLogTable
          logs={paginatedLogs}
          sortConfig={sortConfig}
          onSort={handleSort}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          readOnly={!isAdmin}
        />
      )}

      {/* PAGINATION */}
      {!loading && totalItems > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Page{" "}
            <span className="font-bold text-gray-700">
              {safeCurrentPage}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-700">
              {totalPages}
            </span>
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={
                safeCurrentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  safeCurrentPage - 1
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {Array.from(
              {
                length: Math.min(
                  totalPages,
                  5
                ),
              },
              (_, index) => {
                let page = index + 1;

                if (totalPages > 5) {
                  if (
                    safeCurrentPage <= 3
                  ) {
                    page = index + 1;
                  } else if (
                    safeCurrentPage >=
                    totalPages - 2
                  ) {
                    page =
                      totalPages -
                      4 +
                      index;
                  } else {
                    page =
                      safeCurrentPage -
                      2 +
                      index;
                  }
                }

                return (
                  <button
                    type="button"
                    key={page}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold transition ${
                      page ===
                      safeCurrentPage
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              }
            )}

            <button
              type="button"
              disabled={
                safeCurrentPage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  safeCurrentPage + 1
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT */}
      <ModalAddMachineOperationLog
        key={editingLog?._id || "new"}
        isOpen={addModalOpen}
        onClose={closeAddModal}
        onSubmit={handleSubmit}
        editingLog={editingLog}
        saving={saving}
      />

      {/* DETAILS */}
      <MachineOperationLogDetailsModal
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedLog(null);
        }}
        log={selectedLog}
      />

      {/* DELETE CONFIRMATION */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <FiX className="text-xl" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-gray-900">
                Delete Machine Operation Log?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Are you sure you want to delete
                this machine operation record?
                This action cannot be undone.
              </p>

              {logToDelete && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Customer
                  </p>

                  <p className="mt-1 text-sm font-bold uppercase text-gray-800">
                    {logToDelete.customer}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {
                      logToDelete.itemDescription
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  "Delete Log"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineOperationLog;