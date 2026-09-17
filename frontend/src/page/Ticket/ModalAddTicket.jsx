import { FiX } from "react-icons/fi";

const DEPARTMENTS = [
  "Production",
  "Warehouse",
  "Quality",
  "Maintenance",
  "Engineering",
  "IT",
  "HR",
  "Accounting",
  "Purchasing",
  "Other",
];

const PRIORITIES = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

const STATUSES = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

const ModalAddTicket = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isEdit = false,
  submitting = false,
  user,
  isAdmin = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit
                ? "Edit Ticket"
                : "Submit Request Ticket"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {isEdit
                ? "Update the employee ticket request."
                : "Submit your request to the administrator."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={onSubmit}
          className="overflow-y-auto px-6 py-5"
        >
          {/* Requester Information */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Requester Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Name
                </label>

                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Position
                </label>

                <input
                  type="text"
                  value={user?.position || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Email
                </label>

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>

            {!isEdit && (
              <p className="mt-2 text-xs text-gray-400">
                Your name, position, and email are automatically
                attached to this request.
              </p>
            )}
          </div>

          {/* Ticket Details */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Ticket Details
            </h3>

            <div className="space-y-4">
              {/* Department */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Department
                  <span className="text-red-500"> *</span>
                </label>

                <select
                  name="department"
                  value={formData.department}
                  onChange={onChange}
                  required
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                >
                  <option value="">
                    Select department
                  </option>

                  {DEPARTMENTS.map((department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Priority
                  <span className="text-red-500"> *</span>
                </label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={onChange}
                  required
                  disabled={submitting}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                >
                  {PRIORITIES.map((priority) => (
                    <option
                      key={priority}
                      value={priority}
                    >
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status - Admin only */}
              {isEdit && isAdmin && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={onChange}
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                  >
                    {STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Concern */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Concern
                  <span className="text-red-500"> *</span>
                </label>

                <input
                  type="text"
                  name="concern"
                  value={formData.concern}
                  onChange={onChange}
                  maxLength={200}
                  required
                  disabled={submitting}
                  placeholder="Briefly describe your concern"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                />

                <div className="mt-1 text-right text-xs text-gray-400">
                  {formData.concern?.length || 0}/200
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Note
                </label>

                <textarea
                  name="note"
                  value={formData.note}
                  onChange={onChange}
                  maxLength={2000}
                  rows={5}
                  disabled={submitting}
                  placeholder="Provide additional details..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
                />

                <div className="mt-1 text-right text-xs text-gray-400">
                  {formData.note?.length || 0}/2000
                </div>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : isEdit
                ? "Update Ticket"
                : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAddTicket;