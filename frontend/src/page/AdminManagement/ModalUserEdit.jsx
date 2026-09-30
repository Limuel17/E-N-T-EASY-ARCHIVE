import { useEffect, useMemo } from "react";

import { IoClose } from "react-icons/io5";
import {
  FiCheck,
  FiLock,
  FiShield,
  FiUpload,
  FiUser,
} from "react-icons/fi";

import useAlert from "../../context/useAlert.jsx";

// ============================================================
// PERMISSION CONFIGURATION
// ============================================================

const PERMISSION_MODULES = [
  {
    key: "factoryCard",
    label: "Factory Card",
    description: "Manage factory card records",
  },
  {
    key: "machineOperationLog",
    label: "Machine Operation Log",
    description: "Manage machine operation records",
  },
  {
    key: "ticket",
    label: "Ticket",
    description: "Manage support tickets",
  },
  {
    key: "milledRunSheet",
    label: "Milled Run Sheet",
    description: "Manage milled run sheet records",
  },
];

const PERMISSION_ACTIONS = [
  {
    key: "view",
    label: "View",
  },
  {
    key: "add",
    label: "Add",
  },
  {
    key: "edit",
    label: "Edit",
  },
  {
    key: "delete",
    label: "Delete",
  },
];

// ============================================================
// DEFAULT PERMISSIONS
// ============================================================

const createDefaultPermissions = () => {
  const permissions = {};

  PERMISSION_MODULES.forEach(({ key }) => {
    permissions[key] = {
      view: true,
      add: false,
      edit: false,
      delete: false,
    };
  });

  return permissions;
};

// ============================================================
// COMPONENT
// ============================================================

const ModalUserEdit = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isEdit = false,
  currentUserRole = "",
}) => {
  // ==========================================================
  // ALERT
  // ==========================================================

  const { showAlert } = useAlert();

  // ==========================================================
  // LOGGED-IN USER ROLE
  // ==========================================================

  const loggedInRole = String(
    currentUserRole || ""
  ).toLowerCase();

  const isEmployeeEditing =
    isEdit && loggedInRole === "employee";

  const canManagePermissions =
    loggedInRole === "admin";

  // ==========================================================
  // PROFILE IMAGE PREVIEW
  // ==========================================================

  const preview = useMemo(() => {
    const image = formData?.profileImage;

    if (!image) {
      return null;
    }

    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    const imagePath = String(image);

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
  }, [formData?.profileImage]);

  // ==========================================================
  // CLEAN OBJECT URL
  // ==========================================================

  useEffect(() => {
    const image = formData?.profileImage;

    if (!(image instanceof File)) {
      return undefined;
    }

    const objectUrl = URL.createObjectURL(image);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData?.profileImage]);

  // ==========================================================
  // IMAGE CHANGE
  // ==========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      showAlert(
        "error",
        "Invalid Image",
        "Please select a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert(
        "error",
        "Image Too Large",
        "Profile image must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    onChange({
      target: {
        name: "profileImage",
        value: file,
        type: "file",
      },
    });
  };

  // ==========================================================
  // PERMISSION CHANGE
  // ==========================================================

  const handlePermissionChange = (
    moduleKey,
    actionKey
  ) => {
    const currentPermissions =
      formData?.permissions ||
      createDefaultPermissions();

    const currentModulePermissions =
      currentPermissions[moduleKey] || {
        view: true,
        add: false,
        edit: false,
        delete: false,
      };

    const updatedPermissions = {
      ...currentPermissions,
      [moduleKey]: {
        ...currentModulePermissions,
        [actionKey]:
          !currentModulePermissions[actionKey],
      },
    };

    onChange({
      target: {
        name: "permissions",
        value: updatedPermissions,
      },
    });
  };

  // ==========================================================
  // PERMISSION CHECK
  // ==========================================================

  const hasPermission = (
    moduleKey,
    actionKey
  ) => {
    return Boolean(
      formData?.permissions?.[moduleKey]?.[actionKey]
    );
  };

  // ==========================================================
  // INPUT STYLES
  // ==========================================================

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10";

  const lockedInputClass =
    "w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-500 outline-none";

  // ==========================================================
  // DO NOT RENDER WHEN CLOSED
  // ==========================================================

  if (!isOpen) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              {isEdit ? (
                <FiUser className="text-lg" />
              ) : (
                <FiUser className="text-lg" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-gray-900 sm:text-lg">
                {isEdit ? "Edit User" : "Add User"}
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                {isEdit
                  ? "Update account information and permissions."
                  : "Create a new user account and set permissions."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* ======================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={onSubmit}
          className="min-h-0 overflow-y-auto"
        >
          <div className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
            {/* ==================================================
                PROFILE
            ================================================== */}

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Profile
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Basic account and profile information.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 sm:p-5">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  {/* Avatar */}

                  <div className="relative shrink-0">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gray-200 text-gray-400 shadow-md">
                        <FiUser className="text-4xl" />
                      </div>
                    )}
                  </div>

                  {/* Upload */}

                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      Profile Image
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Upload a clear profile photo.
                    </p>

                    <label
                      htmlFor="profileImage"
                      className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <FiUpload className="text-base" />
                      Choose Image
                    </label>

                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <p className="mt-2 text-[11px] text-gray-400">
                      JPG, JPEG, PNG or WEBP • Maximum 5 MB
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                ACCOUNT INFORMATION
            ================================================== */}

            <section>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Account Information
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Enter the user's account details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Full Name */}

                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-xs font-semibold text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData?.name || ""}
                    onChange={onChange}
                    required
                    placeholder="Enter full name"
                    className={inputClass}
                  />
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-semibold text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData?.email || ""}
                    onChange={onChange}
                    required
                    placeholder="Enter email address"
                    className={inputClass}
                  />
                </div>

                {/* Address */}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="address"
                    className="mb-1.5 block text-xs font-semibold text-gray-700"
                  >
                    Address
                  </label>

                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData?.address || ""}
                    onChange={onChange}
                    placeholder="Enter address"
                    className={inputClass}
                  />
                </div>

                {/* Position */}

                <div>
                  <label
                    htmlFor="position"
                    className="mb-1.5 block text-xs font-semibold text-gray-700"
                  >
                    Position
                  </label>

                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={formData?.position || ""}
                    onChange={onChange}
                    required
                    disabled={isEmployeeEditing}
                    placeholder="Enter position"
                    className={
                      isEmployeeEditing
                        ? lockedInputClass
                        : inputClass
                    }
                  />

                  {isEmployeeEditing && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <FiLock />
                      Employees cannot change their position.
                    </div>
                  )}
                </div>

                {/* Role */}

                <div>
                  <label
                    htmlFor="role"
                    className="mb-1.5 block text-xs font-semibold text-gray-700"
                  >
                    Role
                  </label>

                  <select
                    id="role"
                    name="role"
                    value={formData?.role || "employee"}
                    onChange={onChange}
                    disabled={isEmployeeEditing}
                    className={
                      isEmployeeEditing
                        ? lockedInputClass
                        : inputClass
                    }
                  >
                    <option value="employee">
                      Employee
                    </option>

                    <option value="admin">
                      Admin
                    </option>
                  </select>

                  {isEmployeeEditing && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <FiLock />
                      Employees cannot change their role.
                    </div>
                  )}
                </div>

                {/* Password */}

                {!isEdit && (
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-xs font-semibold text-gray-700"
                    >
                      Password
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData?.password || ""}
                      onChange={onChange}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Enter password"
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-[11px] text-gray-400">
                      Password must contain at least 6
                      characters.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ==================================================
                PERMISSIONS
            ================================================== */}

            {canManagePermissions && (
              <section>
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FiShield className="text-lg" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Permissions
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Choose which modules and actions this
                      user can access.
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* Desktop Table */}

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-162.5">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                            Module
                          </th>

                          {PERMISSION_ACTIONS.map(
                            ({ key, label }) => (
                              <th
                                key={key}
                                className="px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-gray-500"
                              >
                                {label}
                              </th>
                            )
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {PERMISSION_MODULES.map(
                          ({
                            key,
                            label,
                            description,
                          }) => (
                            <tr
                              key={key}
                              className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70"
                            >
                              <td className="px-5 py-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {label}
                                  </p>

                                  <p className="mt-0.5 text-[11px] text-gray-400">
                                    {description}
                                  </p>
                                </div>
                              </td>

                              {PERMISSION_ACTIONS.map(
                                ({
                                  key: actionKey,
                                }) => {
                                  const checked =
                                    hasPermission(
                                      key,
                                      actionKey
                                    );

                                  return (
                                    <td
                                      key={actionKey}
                                      className="px-4 py-4 text-center"
                                    >
                                      <label
                                        className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition ${
                                          checked
                                            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                                            : "border-gray-200 bg-gray-50 text-gray-300 hover:border-gray-300 hover:bg-gray-100"
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() =>
                                            handlePermissionChange(
                                              key,
                                              actionKey
                                            )
                                          }
                                          className="sr-only"
                                        />

                                        {checked && (
                                          <FiCheck className="text-base" />
                                        )}
                                      </label>
                                    </td>
                                  );
                                }
                              )}
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Permission Cards */}

                  <div className="divide-y divide-gray-100 md:hidden">
                    {PERMISSION_MODULES.map(
                      ({
                        key,
                        label,
                        description,
                      }) => (
                        <div
                          key={key}
                          className="p-4"
                        >
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-800">
                              {label}
                            </p>

                            <p className="mt-0.5 text-[11px] text-gray-400">
                              {description}
                            </p>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            {PERMISSION_ACTIONS.map(
                              ({
                                key: actionKey,
                                label: actionLabel,
                              }) => {
                                const checked =
                                  hasPermission(
                                    key,
                                    actionKey
                                  );

                                return (
                                  <label
                                    key={actionKey}
                                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 transition ${
                                      checked
                                        ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                                        : "border-gray-200 bg-gray-50 text-gray-400"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() =>
                                        handlePermissionChange(
                                          key,
                                          actionKey
                                        )
                                      }
                                      className="sr-only"
                                    />

                                    <span
                                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                        checked
                                          ? "bg-indigo-600 text-white"
                                          : "bg-gray-200 text-gray-400"
                                      }`}
                                    >
                                      {checked && (
                                        <FiCheck className="text-sm" />
                                      )}
                                    </span>

                                    <span className="text-[10px] font-semibold">
                                      {actionLabel}
                                    </span>
                                  </label>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 px-3.5 py-3">
                  <FiShield className="mt-0.5 shrink-0 text-xs text-gray-400" />

                  <p className="text-[11px] leading-relaxed text-gray-400">
                    View controls access to the module.
                    Add, Edit, and Delete control the
                    corresponding actions.
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* ======================================================
              FOOTER
          ====================================================== */}

          <div className="sticky bottom-0 flex shrink-0 flex-col-reverse gap-3 border-t border-gray-200 bg-white/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800 sm:w-auto"
            >
              {isEdit ? "Save Changes" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUserEdit;