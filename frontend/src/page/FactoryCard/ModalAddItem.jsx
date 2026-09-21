import { useState } from "react";

import {
  IoClose,
  IoCubeOutline,
  IoSettingsOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";

import {
  MdAdd,
  MdCheck,
  MdDelete,
  MdEdit,
} from "react-icons/md";

import useAlert from "../../context/useAlert.jsx";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

const selectClass =
  "w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-gray-800 outline-none transition-all hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

const labelClass =
  "mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500";

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="mb-4 flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
      <Icon size={18} />
    </div>

    <div>
      <h3 className="text-sm font-bold text-gray-800">
        {title}
      </h3>

      {description && (
        <p className="mt-0.5 text-xs text-gray-500">
          {description}
        </p>
      )}
    </div>
  </div>
);

const ModalAddItem = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isEdit = false,
  typeOptions = [],
  loadingOptions = false,
  saving = false,
  isAdmin = false,
  onAddType,
  onEditType,
  onDeleteType,
}) => {
  const { showAlert } = useAlert();

  const [editingTypeId, setEditingTypeId] =
    useState(null);

  const [editingTypeName, setEditingTypeName] =
    useState("");

  const [newTypeName, setNewTypeName] =
    useState("");

  const [showAddType, setShowAddType] =
    useState(false);

  if (!isOpen) {
    return null;
  }

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    setEditingTypeId(null);
    setEditingTypeName("");
    setNewTypeName("");
    setShowAddType(false);

    onClose();
  };

  // ==========================================================
  // ADD TYPE
  // ==========================================================

  const handleAddType = async () => {
    const name = newTypeName.trim();

    if (!name) {
      showAlert(
        "warning",
        "Missing Type",
        "Please enter a type name."
      );

      return;
    }

    if (!onAddType) {
      return;
    }

    const success = await onAddType(name);

    if (success !== false) {
      setNewTypeName("");
      setShowAddType(false);
    }
  };

  // ==========================================================
  // START EDIT TYPE
  // ==========================================================

  const startEditType = (option) => {
    setEditingTypeId(option._id);
    setEditingTypeName(option.name || "");
  };

  // ==========================================================
  // CANCEL EDIT TYPE
  // ==========================================================

  const cancelEditType = () => {
    setEditingTypeId(null);
    setEditingTypeName("");
  };

  // ==========================================================
  // SAVE EDIT TYPE
  // ==========================================================

  const handleEditType = async () => {
    const name = editingTypeName.trim();

    if (!name) {
      showAlert(
        "warning",
        "Missing Type",
        "Please enter a type name."
      );

      return;
    }

    if (!editingTypeId || !onEditType) {
      return;
    }

    const success = await onEditType(
      editingTypeId,
      name
    );

    if (success !== false) {
      cancelEditType();
    }
  };

  // ==========================================================
  // DELETE TYPE
  // ==========================================================

  const handleDeleteType = async (option) => {
    if (!option?._id || !onDeleteType) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${option.name}"?`
    );

    if (!confirmed) {
      return;
    }

    await onDeleteType(option._id);
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    onChange({
      target: {
        name,
        value,
        type,
        checked,
      },
    });
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="shrink-0 border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <IoCubeOutline className="text-xl" />
              </div>

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                    {isEdit
                      ? "Edit Factory Card"
                      : "Add Factory Card"}
                  </h2>

                  <span
                    className={`hidden rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider sm:inline-flex ${
                      isEdit
                        ? "bg-amber-50 text-amber-700"
                        : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {isEdit ? "Edit" : "New"}
                  </span>

                </div>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  {isEdit
                    ? "Update the selected factory card information."
                    : "Enter the factory card information below."}
                </p>

              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <IoClose className="text-2xl" />
            </button>

          </div>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto"
        >

          <div className="space-y-7 p-5 sm:p-6">

            {/* ==================================================
                BASIC INFORMATION
            ================================================== */}

            <section>

              <SectionHeader
                icon={IoCubeOutline}
                title="Basic Information"
                description="Enter the main factory card details."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Customer */}

                <div>
                  <label
                    htmlFor="customer"
                    className={labelClass}
                  >
                    Customer
                  </label>

                  <input
                    id="customer"
                    name="customer"
                    type="text"
                    value={formData.customer || ""}
                    onChange={handleFormChange}
                    placeholder="Enter customer"
                    disabled={saving}
                    required
                    className={`${inputClass} uppercase`}
                  />
                </div>

                {/* Part Number */}

                <div>
                  <label
                    htmlFor="partNumber"
                    className={labelClass}
                  >
                    Part Number
                  </label>

                  <input
                    id="partNumber"
                    name="partNumber"
                    type="text"
                    value={formData.partNumber || ""}
                    onChange={handleFormChange}
                    placeholder="Enter part number"
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                {/* Job Order */}

                <div>
                  <label
                    htmlFor="jobOrder"
                    className={labelClass}
                  >
                    Job Order
                  </label>

                  <input
                    id="jobOrder"
                    name="jobOrder"
                    type="text"
                    value={formData.jobOrder || ""}
                    onChange={handleFormChange}
                    placeholder="Enter job order"
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                {/* Type */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="type"
                      className={`${labelClass} mb-0`}
                    >
                      Type
                    </label>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAddType(
                            (value) => !value
                          )
                        }
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <IoSettingsOutline size={14} />

                        {showAddType
                          ? "Close"
                          : "Manage Types"}
                      </button>
                    )}

                  </div>

                  <div className="relative">

                    <select
                      id="type"
                      name="type"
                      value={formData.type || ""}
                      onChange={handleFormChange}
                      disabled={
                        saving ||
                        loadingOptions
                      }
                      required
                      className={selectClass}
                    >
                      <option value="">
                        {loadingOptions
                          ? "Loading types..."
                          : "Select type"}
                      </option>

                      {typeOptions.map(
                        (option) => (
                          <option
                            key={option._id}
                            value={option.name}
                          >
                            {option.name}
                          </option>
                        )
                      )}
                    </select>

                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      ▼
                    </span>

                  </div>
                </div>

              </div>
            </section>

            {/* ==================================================
                TYPE MANAGEMENT
            ================================================== */}

            {isAdmin && showAddType && (
              <section className="overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/50">

                <div className="border-b border-indigo-100 bg-white/70 px-4 py-4 sm:px-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                      <IoSettingsOutline size={18} />
                    </div>

                    <div>

                      <h3 className="text-sm font-bold text-gray-800">
                        Type Management
                      </h3>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Add, edit, or remove Factory Card
                        types stored in the database.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="space-y-4 p-4 sm:p-5">

                  {/* Add Type */}

                  <div className="flex gap-2">

                    <input
                      type="text"
                      value={newTypeName}
                      onChange={(event) =>
                        setNewTypeName(
                          event.target.value
                        )
                      }
                      placeholder="Enter a new type..."
                      disabled={saving}
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />

                    <button
                      type="button"
                      onClick={handleAddType}
                      disabled={
                        saving ||
                        !newTypeName.trim()
                      }
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MdAdd className="text-lg" />
                      Add
                    </button>

                  </div>

                  {/* Type List */}

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        Available Types
                      </p>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-gray-500 shadow-sm">
                        {typeOptions.length}{" "}
                        {typeOptions.length === 1
                          ? "type"
                          : "types"}
                      </span>

                    </div>

                    {loadingOptions ? (

                      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-6 text-center">

                        <div className="mx-auto mb-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

                        <p className="text-xs text-gray-500">
                          Loading types...
                        </p>

                      </div>

                    ) : typeOptions.length === 0 ? (

                      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-7 text-center">

                        <IoCubeOutline
                          className="mx-auto mb-2 text-gray-300"
                          size={24}
                        />

                        <p className="text-xs font-medium text-gray-500">
                          No types found.
                        </p>

                        <p className="mt-1 text-[11px] text-gray-400">
                          Add your first Factory Card type above.
                        </p>

                      </div>

                    ) : (

                      <div className="max-h-56 space-y-2 overflow-y-auto pr-1">

                        {typeOptions.map(
                          (option) => {
                            const isEditing =
                              editingTypeId ===
                              option._id;

                            return (
                              <div
                                key={option._id}
                                className={`flex items-center gap-2 rounded-xl border bg-white p-2.5 transition ${
                                  isEditing
                                    ? "border-indigo-200 shadow-sm"
                                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                                }`}
                              >

                                {isEditing ? (
                                  <>
                                    <input
                                      type="text"
                                      value={
                                        editingTypeName
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        setEditingTypeName(
                                          event.target.value
                                        )
                                      }
                                      disabled={saving}
                                      autoFocus
                                      className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10"
                                    />

                                    <button
                                      type="button"
                                      onClick={
                                        handleEditType
                                      }
                                      disabled={
                                        saving ||
                                        !editingTypeName.trim()
                                      }
                                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                      title="Save type"
                                    >
                                      <MdCheck className="text-xl" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={
                                        cancelEditType
                                      }
                                      disabled={saving}
                                      className="rounded-lg px-2.5 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                                      <IoCubeOutline size={15} />
                                    </div>

                                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700">
                                      {option.name}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        startEditType(
                                          option
                                        )
                                      }
                                      disabled={saving}
                                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-50 disabled:opacity-50"
                                      title="Edit type"
                                    >
                                      <MdEdit className="text-lg" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteType(
                                          option
                                        )
                                      }
                                      disabled={saving}
                                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                      title="Delete type"
                                    >
                                      <MdDelete className="text-lg" />
                                    </button>
                                  </>
                                )}

                              </div>
                            );
                          }
                        )}

                      </div>
                    )}

                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                STATUS & PRF
            ================================================== */}

            <section>

              <SectionHeader
                icon={IoCheckmarkCircleOutline}
                title="Card Status"
                description="Set the current status and PRF information."
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* PRF */}

                <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 transition hover:border-gray-300">

                  <label className="flex cursor-pointer items-center gap-3">

                    <input
                      type="checkbox"
                      name="prf"
                      checked={Boolean(formData.prf)}
                      onChange={handleFormChange}
                      disabled={saving}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />

                    <div>

                      <span className="block text-sm font-bold text-gray-700">
                        PRF
                      </span>

                      <span className="text-xs text-gray-500">
                        Mark this factory card as PRF.
                      </span>

                    </div>

                  </label>
                </div>

                {/* Status */}

                <div>

                  <label
                    htmlFor="status"
                    className={labelClass}
                  >
                    Status
                  </label>

                  <div className="relative">

                    <select
                      id="status"
                      name="status"
                      value={
                        formData.status || "In"
                      }
                      onChange={handleFormChange}
                      disabled={saving}
                      className={selectClass}
                    >
                      <option value="In">
                        In
                      </option>

                      <option value="Out">
                        Out
                      </option>

                      <option value="Missing">
                        Missing
                      </option>
                    </select>

                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      ▼
                    </span>

                  </div>
                </div>

              </div>
            </section>

            {/* ==================================================
                NOTE
            ================================================== */}

            <section>

              <label
                htmlFor="note"
                className={labelClass}
              >
                Note
              </label>

              <textarea
                id="note"
                name="note"
                value={formData.note || ""}
                onChange={handleFormChange}
                placeholder="Add any additional notes..."
                rows={4}
                disabled={saving}
                className={`${inputClass} resize-none`}
              />

              <p className="mt-1.5 text-[11px] text-gray-400">
                Optional. Add any information that may
                be useful when reviewing this factory card.
              </p>

            </section>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="sticky bottom-0 flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">

            <p className="hidden text-xs text-gray-400 sm:block">
              {isEdit
                ? "Changes will be saved to this factory card."
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
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {saving
                  ? "Saving..."
                  : isEdit
                    ? "Update Factory Card"
                    : "Add Factory Card"}

              </button>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalAddItem;