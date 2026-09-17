
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import axios from "axios";

import TableFooter from "./TableFooter";
import ModalAddItem from "./ModalAddItem";
import TableThead from "./TableThead";
import TableTbody from "./TableTbody";
import HistoryModal from "./HistoryModal";

const API_URL = "/api/factory-cards";
const OPTIONS_API_URL = "/api/factory-card-options";

const emptyForm = {
  customer: "",
  partNumber: "",
  jobOrder: "",
  type: "RSC",
  prf: false,
  status: "In",
  note: "",
};

const FactoryCard = ({ readOnly = false }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

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

  const [formData, setFormData] = useState(emptyForm);
  const [sortRules, setSortRules] = useState([]);
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
    }
  }, [getAuthConfig]);

  // =========================================================
  // FETCH FACTORY CARD TYPE OPTIONS
  // =========================================================

  const fetchTypeOptions = useCallback(async () => {
    setLoadingOptions(true);

    try {
      const response = await axios.get(
        OPTIONS_API_URL,
        getAuthConfig()
      );

      const options = Array.isArray(response.data?.options)
        ? response.data.options
        : [];

      setTypeOptions(options);
    } catch (error) {
      console.error(
        "FAILED TO FETCH FACTORY CARD TYPE OPTIONS:",
        error.response?.data || error.message
      );

      setTypeOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  }, [getAuthConfig]);

  // =========================================================
  // ADD TYPE
  // =========================================================

  const handleAddType = async (name) => {
    try {
      const cleanName = String(name || "").trim();

      if (!cleanName) {
        alert("Type name is required.");
        return false;
      }

      await axios.post(
        OPTIONS_API_URL,
        {
          category: "type",
          name: cleanName,
        },
        getAuthConfig()
      );

      await fetchTypeOptions();

      alert("Type added successfully.");
      return true;
    } catch (error) {
      console.error(
        "FAILED TO ADD FACTORY CARD TYPE:",
        error.response?.data || error.message
      );

      alert(
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
    try {
      if (!optionId) {
        alert("Invalid type.");
        return false;
      }

      const cleanName = String(name || "").trim();

      if (!cleanName) {
        alert("Type name is required.");
        return false;
      }

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

      alert("Type updated successfully.");
      return true;
    } catch (error) {
      console.error(
        "FAILED TO EDIT FACTORY CARD TYPE:",
        error.response?.data || error.message
      );

      alert(
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
    try {
      if (!optionId) {
        alert("Invalid type.");
        return false;
      }

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

      alert("Type deleted successfully.");
      return true;
    } catch (error) {
      console.error(
        "FAILED TO DELETE FACTORY CARD TYPE:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete type."
      );

      return false;
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
      fetchTypeOptions();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchItems, fetchTypeOptions]);

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
      } finally {
        setHistoryLoading(false);
      }
    },
    [getAuthConfig]
  );

  // =========================================================
  // OPEN HISTORY FROM NOTIFICATION
  // =========================================================

  useEffect(() => {
    if (
      !id ||
      !location.state?.openHistory
    ) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      loadHistory(id);
    }, 0);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    id,
    location.state?.openHistory,
    location.pathname,
    navigate,
    loadHistory,
  ]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredItems = items.filter((item) => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return (
      String(item.customer ?? "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.partNumber ?? "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.jobOrder ?? "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.type ?? "")
        .toLowerCase()
        .includes(searchValue) ||
      String(item.status ?? "")
        .toLowerCase()
        .includes(searchValue) ||
      (item.prf ? "yes" : "no").includes(searchValue)
    );
  });

  // =========================================================
  // STATUS SORT ORDER
  // =========================================================

  const statusOrder = {
    in: 0,
    out: 1,
    missing: 2,
  };

  // =========================================================
  // MULTI SORT
  // =========================================================

  const sortedItems = [...filteredItems].sort((a, b) => {
    for (const rule of sortRules) {
      let comparison = 0;

      // CUSTOMER
      if (rule.field === "customer") {
        const valueA = String(a.customer ?? "")
          .trim()
          .toLowerCase();

        const valueB = String(b.customer ?? "")
          .trim()
          .toLowerCase();

        comparison = valueA.localeCompare(valueB);
      }

      // CREATED DATE
      else if (rule.field === "createdAt") {
        const dateA = new Date(
          a.createdAt || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || 0
        ).getTime();

        comparison = dateA - dateB;
      }

      // TYPE
      else if (rule.field === "type") {
        const valueA = String(a.type ?? "")
          .trim()
          .toLowerCase();

        const valueB = String(b.type ?? "")
          .trim()
          .toLowerCase();

        comparison = valueA.localeCompare(valueB);
      }

      // PRF
      else if (rule.field === "prf") {
        comparison =
          Number(Boolean(a.prf)) -
          Number(Boolean(b.prf));
      }

      // STATUS
      else if (rule.field === "status") {
        const valueA =
          statusOrder[
            String(a.status ?? "")
              .trim()
              .toLowerCase()
          ] ?? 999;

        const valueB =
          statusOrder[
            String(b.status ?? "")
              .trim()
              .toLowerCase()
          ] ?? 999;

        comparison = valueA - valueB;
      }

      if (comparison !== 0) {
        return rule.direction === "asc"
          ? comparison
          : -comparison;
      }
    }

    return 0;
  });

  // =========================================================
  // SORT CHANGE
  // =========================================================

  const handleSortChange = (field, direction) => {
    setSortRules((currentRules) => {
      const existingIndex = currentRules.findIndex(
        (rule) => rule.field === field
      );

      // Add new sort
      if (existingIndex === -1) {
        return [
          ...currentRules,
          {
            field,
            direction,
          },
        ];
      }

      // Remove sort
      if (
        currentRules[existingIndex].direction ===
        direction
      ) {
        return currentRules.filter(
          (_, index) => index !== existingIndex
        );
      }

      // Change direction
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
  };

  // =========================================================
  // EDIT FACTORY CARD
  // =========================================================

  const handleEdit = (item) => {
    if (readOnly) {
      return;
    }

    const itemId = item._id || item.id;

    const existingType = String(
      item.type || ""
    ).trim();

    setSelectedId(itemId);

    setFormData({
      customer: item.customer || "",
      partNumber: item.partNumber || "",
      jobOrder: item.jobOrder || "",
      type: existingType,
      prf: Boolean(item.prf),
      status: item.status || "In",
      note: item.note || "",
    });

    fetchTypeOptions();

    setIsEdit(true);
    setIsModalOpen(true);
  };

  // =========================================================
  // ADD FACTORY CARD
  // =========================================================

  const handleAddItem = () => {
    if (readOnly) {
      return;
    }

    setSelectedId(null);

    setFormData({
      ...emptyForm,
      type: "",
    });

    fetchTypeOptions();

    setIsEdit(false);
    setIsModalOpen(true);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

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
  // SUBMIT FACTORY CARD
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (readOnly) {
      return;
    }

    try {
      setSaving(true);

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
        alert("Please select a type.");
        return;
      }

      let response;

      if (isEdit) {
        response = await axios.put(
          `${API_URL}/${selectedId}`,
          payload,
          getAuthConfig()
        );
      } else {
        response = await axios.post(
          API_URL,
          payload,
          getAuthConfig()
        );
      }

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to save factory card."
        );
      }

      await fetchItems();
      closeModal();
    } catch (error) {
      console.error(
        "FAILED TO SAVE FACTORY CARD:",
        error.response?.data || error.message
      );

      alert(
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

  const handleHistory = (item) => {
    const factoryCardId = item._id || item.id;

    loadHistory(factoryCardId);
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    sortedItems.length === 0
      ? 0
      : Math.ceil(
          sortedItems.length / itemsPerPage
        );

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
  // CLOSE ADD / EDIT MODAL
  // =========================================================

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setSelectedId(null);

    setFormData({
      ...emptyForm,
      type: "",
    });
  };

  // =========================================================
  // CLOSE HISTORY
  // =========================================================

  const closeHistory = () => {
    setIsHistoryOpen(false);
    setHistory([]);
    setSelectedId(null);
  };

  // =========================================================
  // SORT LABEL
  // =========================================================

  const getSortLabel = (rule) => {
    if (rule.field === "customer") {
      return rule.direction === "asc"
        ? "Customer A → Z"
        : "Customer Z → A";
    }

    if (rule.field === "createdAt") {
      return rule.direction === "desc"
        ? "Created Newest → Oldest"
        : "Created Oldest → Newest";
    }

    if (rule.field === "type") {
      return rule.direction === "asc"
        ? "Type A → Z"
        : "Type Z → A";
    }

    if (rule.field === "prf") {
      return rule.direction === "desc"
        ? "PRF Yes → No"
        : "PRF No → Yes";
    }

    if (rule.field === "status") {
      return rule.direction === "asc"
        ? "Status IN → OUT → MISSING"
        : "Status MISSING → OUT → IN";
    }

    return "";
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-4">
      {/* SEARCH + ADD */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search customer, part number, job order..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />

          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleAddItem}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            <span className="text-lg">+</span>
            TRY LANG BOSS
          </button>
        )}
      </div>

      {/* READ ONLY */}

      {readOnly && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Factory Card is read-only. You can search,
          view, and check history.
        </div>
      )}

      {/* ACTIVE SORTS */}

      {sortRules.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-500">
            Sorted by:
          </span>

          {sortRules.map((rule, index) => (
            <span
              key={`${rule.field}-${index}`}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
            >
              {index + 1}. {getSortLabel(rule)}
            </span>
          ))}
        </div>
      )}

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left text-sm">
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

        <TableFooter
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedItems.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(Number(value));
            setCurrentPage(1);
          }}
        />
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

      {/* HISTORY */}

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