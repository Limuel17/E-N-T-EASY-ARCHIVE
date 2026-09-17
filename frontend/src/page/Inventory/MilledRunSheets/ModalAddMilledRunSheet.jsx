
import { useEffect, useState } from "react";
import {
  FiX,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiPackage,
  FiLayers,
  FiChevronDown,
} from "react-icons/fi";

const createEmptyForm = () => ({
  itemCode: "",
  supplier: "",
  customer: "",
  type: "",
  paperCombination: "",
  specification: "",
  quantity: "",
  pendingQty: "",
  price: "",
  remarks: "",
});

const createFormFromRunSheet = (runSheet) => {
  if (!runSheet) {
    return createEmptyForm();
  }

  return {
    itemCode: runSheet.itemCode || "",
    supplier: runSheet.supplier || "",
    customer: runSheet.customer || "",
    type: runSheet.type || "",
    paperCombination: runSheet.paperCombination || "",
    specification: runSheet.specification || "",
    quantity:
      runSheet.quantity !== undefined && runSheet.quantity !== null
        ? String(runSheet.quantity)
        : "",
    pendingQty:
      runSheet.pendingQty !== undefined && runSheet.pendingQty !== null
        ? String(runSheet.pendingQty)
        : "",
    price:
      runSheet.price !== undefined && runSheet.price !== null
        ? String(runSheet.price)
        : "",
    remarks: runSheet.remarks || "",
  };
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 pr-10 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500";

const SectionTitle = ({ icon: Icon, title, description }) => (
  <div className="mb-4 flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      <Icon size={17} />
    </div>

    <div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      {description && (
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      )}
    </div>
  </div>
);

const ManagerRow = ({
  option,
  editing,
  editingName,
  onEditNameChange,
  onSave,
  onCancel,
  onStartEdit,
  onDelete,
}) => {
  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-white p-2 shadow-sm">
        <input
          type="text"
          value={editingName}
          onChange={(event) => onEditNameChange(event.target.value)}
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={onSave}
          disabled={!editingName.trim()}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 transition hover:border-gray-200 hover:shadow-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        <FiPackage size={15} />
      </div>

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
        {option.name}
      </span>

      <button
        type="button"
        onClick={onStartEdit}
        className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
        title="Edit"
      >
        <FiEdit2 size={15} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        title="Delete"
      >
        <FiTrash2 size={15} />
      </button>
    </div>
  );
};

const OptionManager = ({
  options,
  placeholder,
  newValue,
  setNewValue,
  editingId,
  editingName,
  setEditingName,
  onAdd,
  onSave,
  onCancelEdit,
  onStartEdit,
  onDelete,
  emptyText,
  loading,
}) => (
  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          placeholder={placeholder}
          disabled={loading}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
        />

        <button
          type="button"
          onClick={onAdd}
          disabled={loading || !newValue.trim()}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiPlus size={15} />
          Add
        </button>
      </div>
    </div>

    <div className="max-h-52 space-y-2 overflow-y-auto p-3">
      {options.map((option) => (
        <ManagerRow
          key={option._id}
          option={option}
          editing={editingId === option._id}
          editingName={editingName}
          onEditNameChange={setEditingName}
          onSave={() => onSave(option._id)}
          onCancel={onCancelEdit}
          onStartEdit={() => onStartEdit(option)}
          onDelete={() => onDelete(option._id)}
        />
      ))}

      {options.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-7 text-center">
          <FiPackage className="mx-auto mb-2 text-gray-300" size={22} />
          <p className="text-xs font-medium text-gray-500">{emptyText}</p>
        </div>
      )}
    </div>
  </div>
);

const ModalAddMilledRunSheet = ({
  isOpen,
  onClose,
  onSubmit,
  editingRunSheet = null,
  saving = false,

  typeOptions = [],
  paperCombinationOptions = [],
  loadingOptions = false,

  onAddType,
  onEditType,
  onDeleteType,

  onAddPaperCombination,
  onEditPaperCombination,
  onDeletePaperCombination,
}) => {
  const [form, setForm] = useState(() =>
    createFormFromRunSheet(editingRunSheet)
  );

  const [showTypeManager, setShowTypeManager] = useState(false);
  const [showPaperCombinationManager, setShowPaperCombinationManager] =
    useState(false);

  const [newType, setNewType] = useState("");
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingTypeName, setEditingTypeName] = useState("");

  const [newPaperCombination, setNewPaperCombination] = useState("");
  const [editingPaperCombinationId, setEditingPaperCombinationId] =
    useState(null);
  const [editingPaperCombinationName, setEditingPaperCombinationName] =
    useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = setTimeout(() => {
      setForm(createFormFromRunSheet(editingRunSheet));
    }, 0);

    return () => clearTimeout(timer);
  }, [editingRunSheet, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isEdit = Boolean(editingRunSheet);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      ...form,
      quantity: Number(form.quantity),
      pendingQty: Number(form.pendingQty),
      price: Number(form.price),
    });
  };

  const handleAddType = async () => {
    const name = newType.trim();

    if (!name) return;

    await onAddType(name);
    setNewType("");
  };

  const handleEditType = async (id) => {
    const name = editingTypeName.trim();

    if (!name) return;

    await onEditType(id, name);

    setEditingTypeId(null);
    setEditingTypeName("");
  };

  const handleDeleteType = async (id) => {
    await onDeleteType(id);
  };

  const handleAddPaperCombination = async () => {
    const name = newPaperCombination.trim();

    if (!name) return;

    await onAddPaperCombination(name);
    setNewPaperCombination("");
  };

  const handleEditPaperCombination = async (id) => {
    const name = editingPaperCombinationName.trim();

    if (!name) return;

    await onEditPaperCombination(id, name);

    setEditingPaperCombinationId(null);
    setEditingPaperCombinationName("");
  };

  const handleDeletePaperCombination = async (id) => {
    await onDeletePaperCombination(id);
  };

  const handleClose = () => {
    if (saving) return;

    setShowTypeManager(false);
    setShowPaperCombinationManager(false);

    setEditingTypeId(null);
    setEditingTypeName("");

    setEditingPaperCombinationId(null);
    setEditingPaperCombinationName("");

    setNewType("");
    setNewPaperCombination("");

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
        {/* Header */}
        <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <FiPackage size={21} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                    {isEdit
                      ? "Edit Milled Run Sheet"
                      : "New Milled Run Sheet"}
                  </h2>

                  <span
                    className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${
                      isEdit
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {isEdit ? "Edit" : "New"}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  {isEdit
                    ? "Update the selected inventory record."
                    : "Create a new inventory record and stock entry."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close"
            >
              <FiX size={21} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >
          <div className="space-y-7 p-5 sm:p-6">
            {/* Basic Information */}
            <section>
              <SectionTitle
                icon={FiPackage}
                title="Basic Information"
                description="Enter the main details of the run sheet."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Item Code</label>
                  <input
                    type="text"
                    name="itemCode"
                    value={form.itemCode}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    placeholder="Enter item code"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    placeholder="Enter supplier"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Customer</label>
                  <input
                    type="text"
                    name="customer"
                    value={form.customer}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Enter customer"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Specification</label>
                  <input
                    type="text"
                    name="specification"
                    value={form.specification}
                    onChange={handleChange}
                    required
                    disabled={saving}
                    placeholder="Enter specification"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Classification */}
            <section>
              <SectionTitle
                icon={FiLayers}
                title="Classification"
                description="Select the type and paper combination."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Type */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>Type</label>

                    <button
                      type="button"
                      onClick={() =>
                        setShowTypeManager((value) => !value)
                      }
                      disabled={saving}
                      className="mb-2 text-xs font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
                    >
                      {showTypeManager ? "Close Manager" : "Manage Types"}
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      disabled={saving || loadingOptions}
                      className={selectClass}
                    >
                      <option value="">
                        {loadingOptions ? "Loading types..." : "Select type"}
                      </option>

                      {typeOptions.map((option) => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>

                    <FiChevronDown
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  </div>

                  {showTypeManager && (
                    <OptionManager
                      options={typeOptions}
                      newValue={newType}
                      setNewValue={setNewType}
                      editingId={editingTypeId}
                      editingName={editingTypeName}
                      setEditingName={setEditingTypeName}
                      onAdd={handleAddType}
                      onSave={handleEditType}
                      onCancelEdit={() => {
                        setEditingTypeId(null);
                        setEditingTypeName("");
                      }}
                      onStartEdit={(option) => {
                        setEditingTypeId(option._id);
                        setEditingTypeName(option.name);
                      }}
                      onDelete={handleDeleteType}
                      placeholder="Add a new type..."
                      emptyText="No types available."
                      loading={saving}
                    />
                  )}
                </div>

                {/* Paper Combination */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>
                      Paper Combination
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        setShowPaperCombinationManager(
                          (value) => !value
                        )
                      }
                      disabled={saving}
                      className="mb-2 text-xs font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
                    >
                      {showPaperCombinationManager
                        ? "Close Manager"
                        : "Manage Combinations"}
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      name="paperCombination"
                      value={form.paperCombination}
                      onChange={handleChange}
                      required
                      disabled={saving || loadingOptions}
                      className={selectClass}
                    >
                      <option value="">
                        {loadingOptions
                          ? "Loading combinations..."
                          : "Select paper combination"}
                      </option>

                      {paperCombinationOptions.map((option) => (
                        <option key={option._id} value={option.name}>
                          {option.name}
                        </option>
                      ))}
                    </select>

                    <FiChevronDown
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  </div>

                  {showPaperCombinationManager && (
                    <OptionManager
                      options={paperCombinationOptions}
                      newValue={newPaperCombination}
                      setNewValue={setNewPaperCombination}
                      editingId={editingPaperCombinationId}
                      editingName={editingPaperCombinationName}
                      setEditingName={setEditingPaperCombinationName}
                      onAdd={handleAddPaperCombination}
                      onSave={handleEditPaperCombination}
                      onCancelEdit={() => {
                        setEditingPaperCombinationId(null);
                        setEditingPaperCombinationName("");
                      }}
                      onStartEdit={(option) => {
                        setEditingPaperCombinationId(option._id);
                        setEditingPaperCombinationName(option.name);
                      }}
                      onDelete={handleDeletePaperCombination}
                      placeholder="Add a paper combination..."
                      emptyText="No paper combinations available."
                      loading={saving}
                    />
                  )}
                </div>
              </div>
            </section>

            {/* Quantity & Pricing */}
            <section>
              <SectionTitle
                icon={FiPackage}
                title="Quantity & Pricing"
                description="Set the initial stock, pending quantity, and price."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="0"
                    step="any"
                    required
                    disabled={saving || isEdit}
                    placeholder="0"
                    className={`${inputClass} ${
                      isEdit ? "bg-gray-100" : ""
                    }`}
                  />

                  {isEdit && (
                    <p className="mt-1.5 text-[11px] text-gray-400">
                      Original quantity cannot be changed here.
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Pending QTY</label>
                  <input
                    type="number"
                    name="pendingQty"
                    value={form.pendingQty}
                    onChange={handleChange}
                    min="0"
                    step="any"
                    required
                    disabled={saving}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Price</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                      ₱
                    </span>

                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      disabled={saving}
                      placeholder="0.00"
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Remarks */}
            <section>
              <label className={labelClass}>Remarks</label>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows={4}
                disabled={saving}
                placeholder="Add any additional notes or remarks..."
                className={`${inputClass} resize-none`}
              />

              <p className="mt-1.5 text-[11px] text-gray-400">
                Optional. Add any information that may be useful when
                reviewing this run sheet.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
            <p className="hidden text-xs text-gray-400 sm:block">
              {isEdit
                ? "Changes will be saved to this run sheet."
                : "Required fields must be completed before saving."}
            </p>

            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <FiRefreshCw className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiPlus size={16} />
                    {isEdit ? "Update Run Sheet" : "Add Run Sheet"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAddMilledRunSheet;

