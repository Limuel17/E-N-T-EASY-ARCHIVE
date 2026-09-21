import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import { useAuth } from "../../../context/AuthContext";
import useAlert from "../../../context/useAlert.jsx";

import MilledRunSheetsTable from "./MilledRunSheetsTable";
import ModalAddMilledRunSheet from "./ModalAddMilledRunSheet";
import ModalStockMovement from "./ModalStockMovement";
import ModalStockHistory from "./ModalStockHistory";

const API_URL = "/api/milled-run-sheets";

const RUN_SHEET_OPTIONS_URL =
  "/api/milled-run-sheet-options";

const getToken = () => {
  return localStorage.getItem("token");
};

const MilledRunSheets = ({ readOnly = false }) => {
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const userRole = String(
    user?.role || ""
  ).toLowerCase();

  const isAdmin =
    userRole === "admin" && !readOnly;

  // ============================================================
  // RUN SHEETS
  // ============================================================

  const [runSheets, setRunSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ============================================================
  // ADD / EDIT MODAL
  // ============================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRunSheet, setEditingRunSheet] =
    useState(null);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // DELETE MODAL
  // ============================================================

  const [deleteModalOpen, setDeleteModalOpen] =
    useState(false);

  const [runSheetToDelete, setRunSheetToDelete] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // RUN SHEET OPTIONS
  // ============================================================

  const [typeOptions, setTypeOptions] = useState([]);

  const [
    paperCombinationOptions,
    setPaperCombinationOptions,
  ] = useState([]);

  const [loadingOptions, setLoadingOptions] =
    useState(false);

  // ============================================================
  // STOCK MOVEMENT MODAL
  // ============================================================

  const [stockModalOpen, setStockModalOpen] =
    useState(false);

  const [selectedRunSheet, setSelectedRunSheet] =
    useState(null);

  const [stockAction, setStockAction] =
    useState("add");

  const [stockSaving, setStockSaving] =
    useState(false);

  // ============================================================
  // STOCK HISTORY MODAL
  // ============================================================

  const [
    stockHistoryModalOpen,
    setStockHistoryModalOpen,
  ] = useState(false);

  // ============================================================
  // FETCH RUN SHEETS
  // ============================================================

  const fetchRunSheets = useCallback(
    async (showRefreshing = false) => {
      const token = getToken();

      if (!token) {
        setRunSheets([]);
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
          setRunSheets(
            Array.isArray(response.data.runSheets)
              ? response.data.runSheets
              : []
          );
        } else {
          setRunSheets([]);
        }
      } catch (error) {
        console.error(
          "FETCH MILLED RUN SHEETS ERROR:",
          error.response?.data || error.message
        );

        showAlert(
          "error",
          "Load Failed",
          error.response?.data?.message ||
            "Failed to fetch milled run sheets."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showAlert]
  );

  // ============================================================
  // FETCH OPTIONS
  // ============================================================

  const fetchOptions = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setTypeOptions([]);
      setPaperCombinationOptions([]);
      return;
    }

    try {
      setLoadingOptions(true);

      const response = await axios.get(
        RUN_SHEET_OPTIONS_URL,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setTypeOptions(
          Array.isArray(response.data.types)
            ? response.data.types
            : []
        );

        setPaperCombinationOptions(
          Array.isArray(
            response.data.paperCombinations
          )
            ? response.data.paperCombinations
            : []
        );
      } else {
        setTypeOptions([]);
        setPaperCombinationOptions([]);
      }
    } catch (error) {
      console.error(
        "FETCH MILLED RUN SHEET OPTIONS ERROR:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Options Load Failed",
        error.response?.data?.message ||
          "Failed to load Type and Paper Combination options."
      );
    } finally {
      setLoadingOptions(false);
    }
  }, [showAlert]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRunSheets(false);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchRunSheets]);

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

  const handleItemsPerPageChange = (event) => {
    const value = Number(event.target.value);

    setItemsPerPage(
      Number.isFinite(value) && value > 0
        ? value
        : 10
    );

    setCurrentPage(1);
  };

  // ============================================================
  // SORT
  // ============================================================

  /*
    First click  = ASC
    Second click = DESC
    Third click  = Remove
  */

  const handleSort = (field) => {
    setCurrentPage(1);

    setSortConfig((previous) => {
      const existingIndex = previous.findIndex(
        (item) => item.field === field
      );

      // Add new sort
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

      // ASC → DESC
      if (existing.direction === "asc") {
        return previous.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                direction: "desc",
              }
            : item
        );
      }

      // DESC → Remove
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
  // SORT VALUE
  // ============================================================

  const getSortValue = (runSheet, field) => {
    switch (field) {
      case "itemCode":
        return runSheet.itemCode || "";

      case "supplier":
        return runSheet.supplier || "";

      case "customer":
        return runSheet.customer || "";

      case "type":
        return runSheet.type || "";

      case "paperCombination":
        return runSheet.paperCombination || "";

      case "specification":
        return runSheet.specification || "";

      case "quantity":
        return Number(runSheet.quantity || 0);

      case "pendingQty":
        return Number(runSheet.pendingQty || 0);

      case "stock":
        return Number(runSheet.stock || 0);

      case "price":
        return Number(runSheet.price || 0);

      case "remarks":
        return runSheet.remarks || "";

      case "createdAt":
        return runSheet.createdAt
          ? new Date(
              runSheet.createdAt
            ).getTime()
          : 0;

      default:
        return "";
    }
  };

  // ============================================================
  // FILTER + SORT
  // ============================================================

  const filteredAndSortedRunSheets = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = runSheets.filter(
      (runSheet) => {
        if (!query) {
          return true;
        }

        const searchableText = [
          runSheet.itemCode,
          runSheet.supplier,
          runSheet.customer,
          runSheet.type,
          runSheet.paperCombination,
          runSheet.specification,
          runSheet.quantity,
          runSheet.pendingQty,
          runSheet.stock,
          runSheet.price,
          runSheet.remarks,
        ]
          .map((value) =>
            String(value ?? "").toLowerCase()
          )
          .join(" ");

        return searchableText.includes(query);
      }
    );

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

        let comparison;

        if (
          typeof aValue === "number" &&
          typeof bValue === "number"
        ) {
          comparison = aValue - bValue;
        } else {
          comparison = String(
            aValue
          ).localeCompare(
            String(bValue),
            undefined,
            {
              numeric: true,
              sensitivity: "base",
            }
          );
        }

        return sort.direction === "asc"
          ? comparison
          : -comparison;
      }

      return 0;
    });
  }, [runSheets, search, sortConfig]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalItems =
    filteredAndSortedRunSheets.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / itemsPerPage)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedRunSheets =
    filteredAndSortedRunSheets.slice(
      (safeCurrentPage - 1) * itemsPerPage,
      safeCurrentPage * itemsPerPage
    );

  // ============================================================
  // ADD RUN SHEET
  // ============================================================

  const handleAdd = () => {
    if (!isAdmin) {
      return;
    }

    setEditingRunSheet(null);
    setModalOpen(true);
    fetchOptions();
  };

  // ============================================================
  // EDIT RUN SHEET
  // ============================================================

  const handleEdit = (runSheet) => {
    if (!isAdmin || !runSheet?._id) {
      return;
    }

    setEditingRunSheet({
      ...runSheet,
    });

    setModalOpen(true);
    fetchOptions();
  };

  // ============================================================
  // CLOSE ADD / EDIT MODAL
  // ============================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setModalOpen(false);
    setEditingRunSheet(null);
  };

  // ============================================================
  // SAVE RUN SHEET
  // ============================================================

  const handleSubmit = async (formData) => {
    if (!isAdmin) {
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

    const editingId =
      editingRunSheet?._id;

    const isEditing = Boolean(editingId);

    try {
      setSaving(true);

      let response;

      if (isEditing) {
        response = await axios.put(
          `${API_URL}/${editingId}`,
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
            "Failed to save milled run sheet."
        );

        return;
      }

      setModalOpen(false);
      setEditingRunSheet(null);

      await fetchRunSheets(true);

      showAlert(
        "success",
        isEditing
          ? "Run Sheet Updated"
          : "Run Sheet Created",
        isEditing
          ? "Milled run sheet updated successfully."
          : "Milled run sheet created successfully."
      );
    } catch (error) {
      console.error(
        "SAVE MILLED RUN SHEET ERROR:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Save Failed",
        error.response?.data?.message ||
          "Failed to save milled run sheet."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ADD STOCK
  // ============================================================

  const handleAddStock = (runSheet) => {
    if (!isAdmin || !runSheet?._id) {
      return;
    }

    setSelectedRunSheet({
      ...runSheet,
    });

    setStockAction("add");
    setStockModalOpen(true);
  };

  // ============================================================
  // REMOVE STOCK
  // ============================================================

  const handleRemoveStock = (runSheet) => {
    if (!isAdmin || !runSheet?._id) {
      return;
    }

    setSelectedRunSheet({
      ...runSheet,
    });

    setStockAction("remove");
    setStockModalOpen(true);
  };

  // ============================================================
  // CLOSE STOCK MODAL
  // ============================================================

  const closeStockModal = () => {
    if (stockSaving) {
      return;
    }

    setStockModalOpen(false);
    setSelectedRunSheet(null);
    setStockAction("add");
  };

  // ============================================================
  // SAVE STOCK MOVEMENT
  // ============================================================

  const handleStockSubmit = async ({
    quantity,
    remarks,
  }) => {
    if (!isAdmin) {
      return;
    }

    if (!selectedRunSheet?._id) {
      throw new Error(
        "Milled run sheet not selected."
      );
    }

    const token = getToken();

    if (!token) {
      throw new Error(
        "Authentication token not found."
      );
    }

    try {
      setStockSaving(true);

      const endpoint =
        stockAction === "add"
          ? `${API_URL}/${selectedRunSheet._id}/stock/add`
          : `${API_URL}/${selectedRunSheet._id}/stock/remove`;

      const response = await axios.post(
        endpoint,
        {
          quantity,
          remarks,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update stock."
        );
      }

      setStockModalOpen(false);
      setSelectedRunSheet(null);
      setStockAction("add");

      await fetchRunSheets(true);

      showAlert(
        "success",
        stockAction === "add"
          ? "Stock Added"
          : "Stock Removed",
        stockAction === "add"
          ? "Stock added successfully."
          : "Stock removed successfully."
      );
    } catch (error) {
      console.error(
        "STOCK MOVEMENT ERROR:",
        error.response?.data || error.message
      );

      throw new Error(
        error.response?.data?.message ||
          "Failed to update stock.",
        {
          cause: error,
        }
      );
    } finally {
      setStockSaving(false);
    }
  };

  // ============================================================
  // STOCK HISTORY
  // ============================================================

  const handleStockHistory = (runSheet) => {
    if (!runSheet?._id) {
      return;
    }

    setSelectedRunSheet({
      ...runSheet,
    });

    setStockHistoryModalOpen(true);
  };

  const closeStockHistory = () => {
    setStockHistoryModalOpen(false);
    setSelectedRunSheet(null);
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDeleteClick = (runSheet) => {
    if (!isAdmin || !runSheet?._id) {
      return;
    }

    setRunSheetToDelete({
      ...runSheet,
    });

    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeleteModalOpen(false);
    setRunSheetToDelete(null);
  };

  const confirmDelete = async () => {
    if (!isAdmin) {
      return;
    }

    if (!runSheetToDelete?._id) {
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
        `${API_URL}/${runSheetToDelete._id}`,
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
            "Failed to delete milled run sheet."
        );

        return;
      }

      setRunSheets((previous) =>
        previous.filter(
          (item) =>
            item._id !== runSheetToDelete._id
        )
      );

      setDeleteModalOpen(false);
      setRunSheetToDelete(null);

      showAlert(
        "success",
        "Run Sheet Deleted",
        "Milled run sheet deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE MILLED RUN SHEET ERROR:",
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Delete Failed",
        error.response?.data?.message ||
          "Failed to delete milled run sheet."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // TABLE SORT INDICATOR
  // ============================================================

  const activeSort = sortConfig[0] || null;

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
                Milled Run Sheets
              </h1>

              <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                Manage and monitor milled run sheet
                inventory.
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <FiPlus className="text-lg" />
            Add Milled Run Sheet
          </button>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search item code, supplier, customer, type, paper combination..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sortConfig.length > 0 && (
              <button
                type="button"
                onClick={clearSorts}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold text-gray-600 transition hover:bg-gray-50"
              >
                Clear Sort
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                fetchRunSheets(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>
        </div>
      </div>

      {/* TABLE */}
      <MilledRunSheetsTable
        runSheets={paginatedRunSheets}
        loading={loading}
        showActions={isAdmin}
        sortField={activeSort?.field || ""}
        sortDirection={
          activeSort?.direction || "asc"
        }
        onSort={handleSort}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={
          handleItemsPerPageChange
        }
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onAddStock={handleAddStock}
        onRemoveStock={handleRemoveStock}
        onStockHistory={handleStockHistory}
      />

      {/* ADD / EDIT MODAL */}
      <ModalAddMilledRunSheet
        key={
          editingRunSheet?._id ||
          "new-milled-run-sheet"
        }
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        editingRunSheet={editingRunSheet}
        saving={saving}
        typeOptions={typeOptions}
        paperCombinationOptions={
          paperCombinationOptions
        }
        loadingOptions={loadingOptions}
        onRefreshOptions={fetchOptions}
      />

      {/* STOCK MOVEMENT MODAL */}
      <ModalStockMovement
        isOpen={stockModalOpen}
        onClose={closeStockModal}
        onSubmit={handleStockSubmit}
        runSheet={selectedRunSheet}
        action={stockAction}
        saving={stockSaving}
      />

      {/* STOCK HISTORY MODAL */}
      <ModalStockHistory
        isOpen={stockHistoryModalOpen}
        onClose={closeStockHistory}
        runSheet={selectedRunSheet}
      />

      {/* DELETE MODAL */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <FiTrash2 className="text-xl" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-gray-900">
                Delete Milled Run Sheet?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Are you sure you want to delete
                this milled run sheet? This action
                cannot be undone.
              </p>

              {runSheetToDelete && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                    Item Code
                  </p>

                  <p className="mt-1 text-sm font-bold text-gray-800">
                    {runSheetToDelete.itemCode}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {runSheetToDelete.supplier}
                  </p>

                  {runSheetToDelete.customer && (
                    <p className="mt-1 text-xs text-gray-500">
                      {runSheetToDelete.customer}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-xs text-gray-500">
                      Quantity
                    </span>

                    <span className="text-sm font-bold text-gray-800">
                      {Number(
                        runSheetToDelete.quantity ||
                          0
                      )}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Current Stock
                    </span>

                    <span className="text-sm font-bold text-indigo-600">
                      {Number(
                        runSheetToDelete.stock ||
                          0
                      )}
                    </span>
                  </div>
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiTrash2 />

                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilledRunSheets;