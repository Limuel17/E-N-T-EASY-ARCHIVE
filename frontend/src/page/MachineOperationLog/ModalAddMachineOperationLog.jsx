import { useState } from "react";

import {
  FiCalendar,
  FiFileText,
  FiSave,
  FiUser,
  FiX,
} from "react-icons/fi";

const createFormFromLog = (log) => ({
  customer: String(log?.customer ?? ""),
  itemDescription: String(log?.itemDescription ?? ""),
  dimension: String(log?.dimension ?? ""),
  flute: String(log?.flute ?? ""),
  joint: String(log?.joint ?? ""),
  boxType: String(log?.boxType ?? ""),
  code: String(log?.code ?? ""),
  requestedBy: String(
    log?.requestedBy?.name ??
      log?.requestedBy ??
      ""
  ),
  remarks: String(log?.remarks ?? ""),
});

const ModalAddMachineOperationLog = ({
  isOpen,
  onClose,
  onSubmit,
  editingLog = null,
  saving = false,
}) => {
  const [form, setForm] = useState(() =>
    createFormFromLog(editingLog)
  );

  const isEditing = Boolean(editingLog);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = [
      "requestedBy",
      "customer",
      "itemDescription",
      "dimension",
      "flute",
      "joint",
      "boxType",
      "code",
    ];

    const hasMissingField = requiredFields.some(
      (field) => !String(form[field] ?? "").trim()
    );

    if (hasMissingField) {
      alert("Please complete all required fields.");
      return;
    }

    await onSubmit({
      requestedBy: form.requestedBy.trim(),
      customer: form.customer.trim(),
      itemDescription: form.itemDescription.trim(),
      dimension: form.dimension.trim(),
      flute: form.flute.trim(),
      joint: form.joint.trim(),
      boxType: form.boxType.trim(),
      code: form.code.trim(),
      remarks: form.remarks.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FiFileText className="text-xl" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900">
                {isEditing
                  ? "Edit Machine Operation Log"
                  : "New Machine Operation Log"}
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                {isEditing
                  ? "Update the machine operation record"
                  : "Create a new machine operation record"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="space-y-6 p-5 sm:p-7">
            {/* REQUEST INFORMATION */}
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                  <FiUser />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">
                    Request Information
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-600">
                    Enter the name of the person who requested
                    this machine operation.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="machineRequestedBy"
                  className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                >
                  Requested By *
                </label>

                <input
                  id="machineRequestedBy"
                  name="requestedBy"
                  type="text"
                  value={form.requestedBy}
                  onChange={handleChange}
                  placeholder="Enter requester name"
                  required
                  autoComplete="off"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                />
              </div>
            </div>

            {/* MACHINE INFORMATION */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="h-5 w-1 rounded-full bg-indigo-600" />

                <h3 className="text-sm font-bold text-gray-800">
                  Machine Information
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* CUSTOMER */}
                <div>
                  <label
                    htmlFor="machineCustomer"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Customer *
                  </label>

                  <input
                    id="machineCustomer"
                    name="customer"
                    type="text"
                    value={form.customer}
                    onChange={handleChange}
                    placeholder="Enter customer"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium uppercase text-gray-800 shadow-sm outline-none transition placeholder:normal-case placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* ITEM DESCRIPTION */}
                <div>
                  <label
                    htmlFor="machineItemDescription"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Item Description *
                  </label>

                  <input
                    id="machineItemDescription"
                    name="itemDescription"
                    type="text"
                    value={form.itemDescription}
                    onChange={handleChange}
                    placeholder="Enter item description"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* DIMENSION */}
                <div>
                  <label
                    htmlFor="machineDimension"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Dimension *
                  </label>

                  <input
                    id="machineDimension"
                    name="dimension"
                    type="text"
                    value={form.dimension}
                    onChange={handleChange}
                    placeholder="e.g. 12 x 8 x 6"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* FLUTE */}
                <div>
                  <label
                    htmlFor="machineFlute"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Flute *
                  </label>

                  <input
                    id="machineFlute"
                    name="flute"
                    type="text"
                    value={form.flute}
                    onChange={handleChange}
                    placeholder="e.g. B, C, E, BC"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* JOINT */}
                <div>
                  <label
                    htmlFor="machineJoint"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Joint *
                  </label>

                  <input
                    id="machineJoint"
                    name="joint"
                    type="text"
                    value={form.joint}
                    onChange={handleChange}
                    placeholder="Enter joint"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* BOX TYPE */}
                <div>
                  <label
                    htmlFor="machineBoxType"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Box Type *
                  </label>

                  <input
                    id="machineBoxType"
                    name="boxType"
                    type="text"
                    value={form.boxType}
                    onChange={handleChange}
                    placeholder="Enter box type"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* CODE */}
                <div>
                  <label
                    htmlFor="machineCode"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Code *
                  </label>

                  <input
                    id="machineCode"
                    name="code"
                    type="text"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="Enter code"
                    required
                    autoComplete="off"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm outline-none transition placeholder:font-normal placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                {/* DATE */}
                <div>
                  <label
                    htmlFor="machineAutoDate"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Date
                  </label>

                  <div
                    id="machineAutoDate"
                    className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                  >
                    <FiCalendar className="shrink-0" />

                    <span>
                      {isEditing
                        ? "Original request date"
                        : "Automatically recorded"}
                    </span>
                  </div>
                </div>

                {/* REMARKS */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="machineRemarks"
                    className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                  >
                    Remarks
                  </label>

                  <textarea
                    id="machineRemarks"
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    placeholder="Enter remarks or additional information"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <FiSave />
                  {isEditing ? "Save Changes" : "Create Log"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAddMachineOperationLog;