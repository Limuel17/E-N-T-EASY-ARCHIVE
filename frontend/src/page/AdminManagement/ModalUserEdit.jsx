
import { useEffect, useMemo } from "react";
import { IoClose } from "react-icons/io5";
import { FiUpload, FiUser } from "react-icons/fi";

const ModalUserEdit = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onChange,
  isEdit = false,
  currentUserRole = "",
}) => {
  // ========================================
  // LOGGED-IN USER ROLE
  // ========================================

  const loggedInRole = String(
    currentUserRole || ""
  ).toLowerCase();

  // Employees cannot edit Position or Role
  // when editing an existing user.
  const isEmployeeEditing =
    isEdit && loggedInRole === "employee";

  // ========================================
  // PROFILE IMAGE PREVIEW
  // ========================================

  const preview = useMemo(() => {
    const image = formData?.profileImage;

    if (!image) {
      return null;
    }

    // New uploaded image
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    // Existing image
    const imagePath = String(image);

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    // Use IIS same-origin URL.
    return imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;
  }, [formData?.profileImage]);

  // ========================================
  // CLEAN OBJECT URL
  // ========================================

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

  // ========================================
  // DO NOT RENDER WHEN CLOSED
  // ========================================

  if (!isOpen) {
    return null;
  }

  // ========================================
  // IMAGE CHANGE
  // ========================================

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
      alert(
        "Please select a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
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

  // ========================================
  // INPUT STYLES
  // ========================================

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  const lockedInputClass =
    "w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-500 outline-none";

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "Edit User" : "Add User"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {isEdit
                ? "Update the user's information."
                : "Create a new user account."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <IoClose className="text-xl" />
          </button>
        </div>

        {/* ========================================
            FORM
        ======================================== */}

        <form
          onSubmit={onSubmit}
          className="overflow-y-auto px-5 py-5 sm:px-6"
        >
          <div className="space-y-5">

            {/* ========================================
                PROFILE IMAGE
            ======================================== */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Profile Image
              </label>

              <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-5 sm:flex-row">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="h-24 w-24 rounded-full border-4 border-white object-cover shadow"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-gray-400 shadow">
                    <FiUser className="text-4xl" />
                  </div>
                )}

                <div className="flex-1 text-center sm:text-left">
                  <label
                    htmlFor="profileImage"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                  >
                    <FiUpload />
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

                  <p className="mt-2 text-xs text-gray-500">
                    JPG, JPEG, PNG or WEBP.
                    Maximum 5 MB.
                  </p>
                </div>
              </div>
            </div>

            {/* ========================================
                NAME
            ======================================== */}

            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
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

            {/* ========================================
                EMAIL
            ======================================== */}

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
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

            {/* ========================================
                ADDRESS
            ======================================== */}

            <div>
              <label
                htmlFor="address"
                className="mb-1 block text-sm font-medium text-gray-700"
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

            {/* ========================================
                POSITION
            ======================================== */}

            <div>
              <label
                htmlFor="position"
                className="mb-1 block text-sm font-medium text-gray-700"
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
                <p className="mt-1.5 text-xs text-gray-500">
                  Employees cannot change their
                  position.
                </p>
              )}
            </div>

            {/* ========================================
                ROLE
            ======================================== */}

            <div>
              <label
                htmlFor="role"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Role
              </label>

              <select
                id="role"
                name="role"
                value={
                  formData?.role || "employee"
                }
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
                <p className="mt-1.5 text-xs text-gray-500">
                  Employees cannot change their role.
                </p>
              )}
            </div>

            {/* ========================================
                PASSWORD - ADD ONLY
            ======================================== */}

            {!isEdit && (
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={
                    formData?.password || ""
                  }
                  onChange={onChange}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Enter password"
                  className={inputClass}
                />

                <p className="mt-1.5 text-xs text-gray-500">
                  Password must contain at least
                  6 characters.
                </p>
              </div>
            )}
          </div>

          {/* ========================================
              BUTTONS
          ======================================== */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 sm:w-auto"
            >
              {isEdit
                ? "Save Changes"
                : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUserEdit;