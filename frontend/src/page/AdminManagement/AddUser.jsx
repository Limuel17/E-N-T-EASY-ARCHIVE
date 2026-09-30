import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import ModalUserEdit from "../AdminManagement/ModalUserEdit.jsx";
import ResetPasswordModal from "../AdminManagement/ResetPasswordModal.jsx";

import { useAuth } from "../../context/AuthContext";
import useAlert from "../../context/useAlert.jsx";

import {
  FiPlus,
  FiSearch,
  FiUsers,
  FiEdit2,
  FiTrash2,
  FiKey,
  FiMail,
  FiMapPin,
  FiBriefcase,
  FiShield,
} from "react-icons/fi";

const USERS_URL = "/api/users";
const REGISTER_URL = "/api/auth/register";

// ============================================================
// DEFAULT PERMISSIONS
// ============================================================

const defaultPermissions = {
  factoryCard: {
    view: true,
    add: false,
    edit: false,
    delete: false,
  },

  machineOperationLog: {
    view: true,
    add: false,
    edit: false,
    delete: false,
  },

  ticket: {
    view: true,
    add: false,
    edit: false,
    delete: false,
  },

  milledRunSheet: {
    view: true,
    add: false,
    edit: false,
    delete: false,
  },
};

// ============================================================
// HELPERS
// ============================================================

const createDefaultPermissions = () =>
  structuredClone(defaultPermissions);

const createEmptyForm = () => ({
  name: "",
  email: "",
  password: "",
  address: "",
  position: "",
  role: "employee",
  profileImage: null,
  permissions: createDefaultPermissions(),
});

// ============================================================
// COMPONENT
// ============================================================

const AddUser = () => {
  const { user: currentUser } = useAuth();
  const { showAlert } = useAlert();

  // ==========================================================
  // USER STATE
  // ==========================================================

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(
    createEmptyForm()
  );

  // ==========================================================
  // RESET PASSWORD STATE
  // ==========================================================

  const [resetPasswordOpen, setResetPasswordOpen] =
    useState(false);

  const [resetPasswordUser, setResetPasswordUser] =
    useState(null);

  const [temporaryPassword, setTemporaryPassword] =
    useState("");

  const [resetPasswordLoading, setResetPasswordLoading] =
    useState(false);

  // ==========================================================
  // CURRENT USER ROLE
  // ==========================================================

  const currentUserRole = String(
    currentUser?.role || ""
  ).toLowerCase();

  const isAdmin = currentUserRole === "admin";

  // ==========================================================
  // AUTH CONFIG
  // ==========================================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==========================================================
  // PROFILE IMAGE URL
  // ==========================================================

  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) {
      return "";
    }

    const image = String(profileImage);

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return image.startsWith("/")
      ? image
      : `/${image}`;
  };

  // ==========================================================
  // NORMALIZE PERMISSIONS
  // ==========================================================

  const normalizePermissions = (permissions = {}) => {
    const defaults = createDefaultPermissions();

    return {
      factoryCard: {
        ...defaults.factoryCard,
        ...(permissions.factoryCard || {}),
      },

      machineOperationLog: {
        ...defaults.machineOperationLog,
        ...(permissions.machineOperationLog || {}),
      },

      ticket: {
        ...defaults.ticket,
        ...(permissions.ticket || {}),
      },

      milledRunSheet: {
        ...defaults.milledRunSheet,
        ...(permissions.milledRunSheet || {}),
      },
    };
  };

  // ==========================================================
  // FETCH USERS
  // ==========================================================

  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found.");
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          USERS_URL,
          getAuthConfig()
        );

        console.log("USERS RESPONSE:", response.data);

        if (!ignore) {
          setUsers(response.data.users || []);
        }
      } catch (error) {
        if (!ignore) {
          console.error(
            "FAILED TO FETCH USERS:",
            error.response?.data || error.message
          );

          showAlert(
            "error",
            "Users Failed",
            error.response?.data?.message ||
              "Failed to load users."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      ignore = true;
    };
  }, [showAlert]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================================
  // OPEN ADD MODAL
  // ==========================================================

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedId(null);
    setFormData(createEmptyForm());
    setIsModalOpen(true);
  };

  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const handleEdit = (user) => {
    const userId = user._id || user.id;

    if (!userId) {
      showAlert(
        "error",
        "Invalid User",
        "The selected user is invalid."
      );

      return;
    }

    console.log("EDIT USER:", user);
    console.log("SELECTED USER ID:", userId);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      address: user.address || "",
      position: user.position || "",
      role: String(
        user.role || "employee"
      ).toLowerCase(),
      profileImage: user.profileImage || null,
      permissions: normalizePermissions(
        user.permissions
      ),
    });

    setSelectedId(userId);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  // ==========================================================
  // CLOSE USER MODAL
  // ==========================================================

  const handleClose = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setSelectedId(null);
    setFormData(createEmptyForm());
  };

  // ==========================================================
  // ADD / UPDATE USER
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEdit && !selectedId) {
      showAlert(
        "warning",
        "No User Selected",
        "Please select a user before updating."
      );

      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      // ========================================================
      // BASIC INFORMATION
      // ========================================================

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "email",
        formData.email.trim()
      );

      data.append(
        "address",
        formData.address.trim()
      );

      // ========================================================
      // POSITION + ROLE
      // ========================================================

      if (
        !isEdit ||
        currentUserRole === "admin"
      ) {
        data.append(
          "position",
          formData.position.trim()
        );

        data.append(
          "role",
          formData.role
        );
      }

      // ========================================================
      // PERMISSIONS
      // ========================================================

      if (isAdmin) {
        data.append(
          "permissions",
          JSON.stringify(
            formData.permissions ||
              createDefaultPermissions()
          )
        );
      }

      // ========================================================
      // PASSWORD
      // ========================================================

      if (!isEdit) {
        data.append(
          "password",
          formData.password
        );
      }

      // ========================================================
      // PROFILE IMAGE
      // ========================================================

      if (
        formData.profileImage instanceof File
      ) {
        data.append(
          "profilePicture",
          formData.profileImage
        );
      }

      // ========================================================
      // UPDATE USER
      // ========================================================

      if (isEdit) {
        const response = await axios.put(
          `${USERS_URL}/${selectedId}`,
          data,
          getAuthConfig()
        );

        console.log(
          "USER UPDATED:",
          response.data
        );

        const updatedUser =
          response.data.user;

        if (!updatedUser) {
          throw new Error(
            "Updated user data was not returned by the server."
          );
        }

        setUsers((prev) =>
          prev.map((user) =>
            String(
              user._id || user.id
            ) === String(selectedId)
              ? updatedUser
              : user
          )
        );

        // ======================================================
        // UPDATE CURRENT USER
        // ======================================================

        const storedUser = JSON.parse(
          localStorage.getItem("user") ||
            "{}"
        );

        const loggedInUserId =
          storedUser._id ||
          storedUser.id;

        if (
          String(loggedInUserId) ===
          String(updatedUser._id)
        ) {
          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );

          window.dispatchEvent(
            new Event("userUpdated")
          );
        }

        showAlert(
          "success",
          "User Updated",
          "The user profile was updated successfully."
        );
      }

      // ========================================================
      // CREATE USER
      // ========================================================

      else {
        const response = await axios.post(
          REGISTER_URL,
          data,
          getAuthConfig()
        );

        console.log(
          "USER ADDED:",
          response.data
        );

        const newUser =
          response.data.user;

        if (!newUser) {
          throw new Error(
            "New user data was not returned by the server."
          );
        }

        setUsers((prev) => [
          newUser,
          ...prev,
        ]);

        showAlert(
          "success",
          "User Added",
          "The new user was added successfully."
        );
      }

      handleClose();
    } catch (error) {
      console.error(
        "FAILED TO SAVE USER:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",
        "Save Failed",
        error.response?.data?.message ||
          "Failed to save user."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DELETE USER
  // ==========================================================

  const handleDelete = async (userId) => {
    if (!userId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await axios.delete(
        `${USERS_URL}/${userId}`,
        getAuthConfig()
      );

      setUsers((prev) =>
        prev.filter(
          (user) =>
            String(
              user._id || user.id
            ) !== String(userId)
        )
      );

      showAlert(
        "success",
        "User Deleted",
        "The user was deleted successfully."
      );
    } catch (error) {
      console.error(
        "FAILED TO DELETE USER:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",
        "Delete Failed",
        error.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // OPEN RESET PASSWORD
  // ==========================================================

  const openResetPassword = (user) => {
    if (!isAdmin) {
      showAlert(
        "warning",
        "Access Denied",
        "Only administrators can reset passwords."
      );

      return;
    }

    setResetPasswordUser(user);
    setTemporaryPassword("");
    setResetPasswordOpen(true);
  };

  // ==========================================================
  // CLOSE RESET PASSWORD
  // ==========================================================

  const closeResetPassword = () => {
    if (resetPasswordLoading) {
      return;
    }

    setResetPasswordOpen(false);
    setResetPasswordUser(null);
    setTemporaryPassword("");
    setResetPasswordLoading(false);
  };

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const handleResetPassword = async () => {
    if (!resetPasswordUser?._id) {
      showAlert(
        "error",
        "Invalid User",
        "The selected user is invalid."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );

      return;
    }

    setResetPasswordLoading(true);

    try {
      const response = await axios.post(
        `${USERS_URL}/${resetPasswordUser._id}/reset-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "RESET PASSWORD RESPONSE:",
        response.data
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message ||
            "Failed to reset password."
        );
      }

      const generatedPassword =
        response.data.temporaryPassword;

      if (!generatedPassword) {
        throw new Error(
          "The server did not return a temporary password."
        );
      }

      setTemporaryPassword(
        generatedPassword
      );
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error.response?.data ||
          error.message
      );

      showAlert(
        "error",
        "Reset Password Failed",
        error.response?.data?.message ||
          error.message ||
          "Failed to reset password."
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  // ==========================================================
  // FILTER USERS
  // ==========================================================

  const filteredUsers = useMemo(() => {
    const value = String(search || "")
      .trim()
      .toLowerCase();

    if (!value) {
      return users;
    }

    return users.filter((user) => {
      return (
        String(user.name || "")
          .toLowerCase()
          .includes(value) ||
        String(user.email || "")
          .toLowerCase()
          .includes(value) ||
        String(user.position || "")
          .toLowerCase()
          .includes(value) ||
        String(user.role || "")
          .toLowerCase()
          .includes(value)
      );
    });
  }, [users, search]);

  // ==========================================================
  // USER COUNTS
  // ==========================================================

  const employeeCount = users.filter(
    (user) =>
      String(user.role || "").toLowerCase() ===
      "employee"
  ).length;

  const adminCount = users.filter(
    (user) =>
      String(user.role || "").toLowerCase() ===
      "admin"
  ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-5">
      <div className="mx-auto max-w-7xl">

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FiUsers className="text-xl" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  User Management
                </h1>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Manage users, accounts, and permissions.
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:bg-indigo-800"
              >
                <FiPlus className="text-base" />
                Add User
              </button>
            )}
          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Total Users
              </p>

              <p className="mt-1 text-xl font-bold text-gray-800">
                {users.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Employees
              </p>

              <p className="mt-1 text-xl font-bold text-gray-800">
                {employeeCount}
              </p>
            </div>

            <div className="col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Administrators
              </p>

              <p className="mt-1 text-xl font-bold text-gray-800">
                {adminCount}
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, email, position, or role..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {search.trim() && (
            <p className="mt-2 px-1 text-[11px] text-gray-400">
              Showing {filteredUsers.length} of{" "}
              {users.length} users
            </p>
          )}
        </div>

        {/* ====================================================
            USERS
        ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          {loading && users.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

              <p className="mt-3 text-sm text-gray-500">
                Loading users...
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-60 flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                <FiUsers className="text-2xl" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-700">
                No users found
              </h3>

              <p className="mt-1 max-w-sm text-xs text-gray-400">
                {search.trim()
                  ? "Try a different search term."
                  : "There are currently no users to display."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUsers.map((user) => {
                const userId =
                  user._id || user.id;

                const role = String(
                  user.role || "employee"
                ).toLowerCase();

                const isUserAdmin =
                  role === "admin";

                const initial =
                  user.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U";

                return (
                  <div
                    key={userId}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md"
                  >
                    {/* ==================================================
                        CARD CONTENT
                    ================================================== */}

                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl ${
                            isUserAdmin
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {user.profileImage ? (
                            <img
                              src={getProfileImageUrl(
                                user.profileImage
                              )}
                              alt={user.name || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {initial}
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                            isUserAdmin
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isUserAdmin
                                ? "bg-indigo-500"
                                : "bg-gray-400"
                            }`}
                          />

                          {role}
                        </span>
                      </div>

                      {/* ==================================================
                          NAME
                      ================================================== */}

                      <div className="mt-4 min-w-0">
                        <h2 className="truncate text-base font-bold text-gray-900">
                          {user.name || "Unnamed User"}
                        </h2>

                        <p className="mt-1 truncate text-xs font-semibold text-indigo-600">
                          {user.position ||
                            "No position"}
                        </p>
                      </div>

                      {/* ==================================================
                          DETAILS
                      ================================================== */}

                      <div className="mt-4 space-y-2.5">
                        <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
                          <FiMail className="shrink-0 text-gray-400" />

                          <span className="truncate">
                            {user.email ||
                              "No email"}
                          </span>
                        </div>

                        <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
                          <FiBriefcase className="shrink-0 text-gray-400" />

                          <span className="truncate">
                            {user.position ||
                              "No position"}
                          </span>
                        </div>

                        {user.address && (
                          <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
                            <FiMapPin className="shrink-0 text-gray-400" />

                            <span className="truncate">
                              {user.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="border-t border-gray-100 bg-gray-50/70 p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(user)
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-indigo-50 hover:ring-indigo-100"
                        >
                          <FiEdit2 />
                          Edit
                        </button>

                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(userId)
                            }
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-red-50 hover:ring-red-100"
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>

                      {/* ==================================================
                          RESET PASSWORD
                      ================================================== */}

                      {isAdmin &&
                        role === "employee" && (
                          <button
                            type="button"
                            onClick={() =>
                              openResetPassword(
                                user
                              )
                            }
                            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                          >
                            <FiKey />
                            Reset Password
                          </button>
                        )}

                      {/* ==================================================
                          PERMISSION INDICATOR
                      ================================================== */}

                      {isUserAdmin ? (
                        <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2 text-[10px] font-semibold text-indigo-600">
                          <FiShield />
                          Administrator Access
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-[10px] font-semibold text-gray-500">
                          <FiShield />
                          Custom Permissions
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ======================================================
            EDIT / ADD USER MODAL
        ====================================================== */}

        <ModalUserEdit
          isOpen={isModalOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
          isEdit={isEdit}
          currentUserRole={currentUserRole}
        />

        {/* ======================================================
            RESET PASSWORD MODAL
        ====================================================== */}

        <ResetPasswordModal
          isOpen={resetPasswordOpen}
          onClose={closeResetPassword}
          user={resetPasswordUser}
          temporaryPassword={temporaryPassword}
          onReset={handleResetPassword}
          resetting={resetPasswordLoading}
        />
      </div>
    </div>
  );
};

export default AddUser;