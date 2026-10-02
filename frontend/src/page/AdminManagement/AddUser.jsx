import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBriefcase,
  FiEdit2,
  FiKey,
  FiMail,
  FiMapPin,
  FiPlus,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import ModalUserEdit from "./ModalUserEdit.jsx";
import ResetPasswordModal from "./ResetPasswordModal.jsx";
import { useAuth } from "../../context/AuthContext";
import useAlert from "../../context/useAlert.jsx";

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

  customer: {
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

const normalizePermissions = (permissions = {}) => {
  const defaults = createDefaultPermissions();

  return {
    factoryCard: {
      ...defaults.factoryCard,
      ...(permissions.factoryCard || {}),
    },

    customer: {
      ...defaults.customer,
      ...(permissions.customer || {}),
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

const getUserId = (user) => user?._id || user?.id || "";

const getRole = (user) =>
  String(user?.role || "employee").toLowerCase();

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

  return image.startsWith("/") ? image : `/${image}`;
};

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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
  // CURRENT USER
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

        if (!ignore) {
          setUsers(response.data?.users || []);
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

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
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
    const userId = getUserId(user);

    if (!userId) {
      showAlert(
        "error",
        "Invalid User",
        "The selected user is invalid."
      );
      return;
    }

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      address: user.address || "",
      position: user.position || "",
      role: getRole(user),
      profileImage: user.profileImage || null,
      permissions: normalizePermissions(user.permissions),
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
  // SAVE USER
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isEdit && !selectedId) {
      showAlert(
        "warning",
        "No User Selected",
        "Please select a user before updating."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert(
        "error",
        "Authentication Error",
        "Authentication token not found."
      );
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      // --------------------------------------------------------
      // BASIC INFORMATION
      // --------------------------------------------------------

      data.append("name", formData.name.trim());
      data.append("email", formData.email.trim());
      data.append("address", formData.address.trim());

      // --------------------------------------------------------
      // POSITION + ROLE
      // --------------------------------------------------------

      if (!isEdit || currentUserRole === "admin") {
        data.append(
          "position",
          formData.position.trim()
        );

        data.append("role", formData.role);
      }

      // --------------------------------------------------------
      // PERMISSIONS
      // --------------------------------------------------------

      if (isAdmin) {
        data.append(
          "permissions",
          JSON.stringify(
            formData.permissions ||
              createDefaultPermissions()
          )
        );
      }

      // --------------------------------------------------------
      // PASSWORD
      // --------------------------------------------------------

      if (!isEdit) {
        data.append("password", formData.password);
      }

      // --------------------------------------------------------
      // PROFILE IMAGE
      // --------------------------------------------------------

      if (formData.profileImage instanceof File) {
        data.append(
          "profilePicture",
          formData.profileImage
        );
      }

      // --------------------------------------------------------
      // UPDATE USER
      // --------------------------------------------------------

      if (isEdit) {
        const response = await axios.put(
          `${USERS_URL}/${selectedId}`,
          data,
          getAuthConfig()
        );

        const updatedUser = response.data?.user;

        if (!updatedUser) {
          throw new Error(
            "Updated user data was not returned by the server."
          );
        }

        setUsers((previous) =>
          previous.map((user) =>
            String(getUserId(user)) ===
            String(selectedId)
              ? updatedUser
              : user
          )
        );

        // ------------------------------------------------------
        // UPDATE CURRENT USER IN LOCAL STORAGE
        // ------------------------------------------------------

        const storedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const loggedInUserId =
          storedUser?._id || storedUser?.id;

        if (
          String(loggedInUserId) ===
          String(getUserId(updatedUser))
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

      // --------------------------------------------------------
      // CREATE USER
      // --------------------------------------------------------

      else {
        const response = await axios.post(
          REGISTER_URL,
          data,
          getAuthConfig()
        );

        const newUser = response.data?.user;

        if (!newUser) {
          throw new Error(
            "New user data was not returned by the server."
          );
        }

        setUsers((previous) => [
          newUser,
          ...previous,
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
        error.response?.data || error.message
      );

      showAlert(
        "error",
        "Save Failed",
        error.response?.data?.message ||
          error.message ||
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

      setUsers((previous) =>
        previous.filter(
          (user) =>
            String(getUserId(user)) !==
            String(userId)
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
        error.response?.data || error.message
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
  };

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const handleResetPassword = async () => {
    const userId = getUserId(resetPasswordUser);

    if (!userId) {
      showAlert(
        "error",
        "Invalid User",
        "The selected user is invalid."
      );
      return;
    }

    const token = localStorage.getItem("token");

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
        `${USERS_URL}/${userId}/reset-password`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to reset password."
        );
      }

      const generatedPassword =
        response.data?.temporaryPassword;

      if (!generatedPassword) {
        throw new Error(
          "The server did not return a temporary password."
        );
      }

      setTemporaryPassword(generatedPassword);
    } catch (error) {
      console.error(
        "RESET PASSWORD ERROR:",
        error.response?.data || error.message
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

  const employeeCount = useMemo(
    () =>
      users.filter(
        (user) => getRole(user) === "employee"
      ).length,
    [users]
  );

  const adminCount = useMemo(
    () =>
      users.filter(
        (user) => getRole(user) === "admin"
      ).length,
    [users]
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full min-w-0 space-y-5 overflow-x-hidden p-4 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-7xl space-y-5">

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-600 via-indigo-600 to-violet-600 px-5 py-5 text-white shadow-sm">
          <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-20 right-28 h-32 w-32 rounded-full bg-violet-300/10 blur-3xl" />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl shadow-inner ring-1 ring-white/20 backdrop-blur-sm">
                <FiUsers />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-100 ring-1 ring-white/10">
                    Administration
                  </span>

                  <span className="rounded-md bg-white px-2 py-1 text-[10px] font-extrabold tracking-wider text-indigo-700 shadow-sm">
                    {users.length} USERS
                  </span>
                </div>

                <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                  User Management
                </h1>

                <p className="mt-0.5 text-xs text-indigo-100 sm:text-sm">
                  Manage users, accounts, roles, and permissions.
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 hover:shadow-md"
              >
                <FiPlus className="text-lg" />
                Add User
              </button>
            )}
          </div>

          {/* SUMMARY */}

          <div className="relative mt-5 grid grid-cols-3 gap-2.5">
            <SummaryCard
              label="Total Users"
              value={users.length}
            />

            <SummaryCard
              label="Employees"
              value={employeeCount}
            />

            <SummaryCard
              label="Administrators"
              value={adminCount}
            />
          </div>
        </div>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, position, or role..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          {search.trim() && (
            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[11px] text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-600">
                  {users.length}
                </span>{" "}
                users
              </p>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-[11px] font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ====================================================
            USER LIST
        ==================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          {loading && users.length === 0 ? (
            <LoadingState />
          ) : filteredUsers.length === 0 ? (
            <EmptyState searching={Boolean(search.trim())} />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-800">
                    Users
                  </h2>

                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {filteredUsers.length}{" "}
                    {filteredUsers.length === 1
                      ? "account"
                      : "accounts"}{" "}
                    displayed
                  </p>
                </div>

                {loading && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredUsers.map((user) => {
                  const userId = getUserId(user);
                  const role = getRole(user);
                  const isUserAdmin = role === "admin";

                  const initial =
                    user.name
                      ?.trim()
                      ?.charAt(0)
                      ?.toUpperCase() || "U";

                  return (
                    <UserCard
                      key={userId}
                      user={user}
                      role={role}
                      isUserAdmin={isUserAdmin}
                      initial={initial}
                      isAdmin={isAdmin}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onResetPassword={openResetPassword}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ====================================================
            EDIT / ADD USER MODAL
        ==================================================== */}

        <ModalUserEdit
          isOpen={isModalOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
          isEdit={isEdit}
          currentUserRole={currentUserRole}
        />

        {/* ====================================================
            RESET PASSWORD MODAL
        ==================================================== */}

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

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-sm">
    <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-100">
      {label}
    </p>

    <p className="mt-0.5 text-lg font-extrabold text-white">
      {value}
    </p>
  </div>
);

// ============================================================
// USER CARD
// ============================================================

const UserCard = ({
  user,
  role,
  isUserAdmin,
  initial,
  isAdmin,
  onEdit,
  onDelete,
  onResetPassword,
}) => (
  <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md">

    {/* CARD CONTENT */}

    <div className="p-5">
      <div className="flex items-start justify-between gap-3">

        {/* PROFILE */}

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl ${
            isUserAdmin
              ? "bg-indigo-100 text-indigo-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {user.profileImage ? (
            <img
              src={getProfileImageUrl(user.profileImage)}
              alt={user.name || "User"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold">
              {initial}
            </span>
          )}
        </div>

        {/* ROLE */}

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

      {/* NAME */}

      <div className="mt-4 min-w-0">
        <h2 className="truncate text-base font-bold text-gray-900">
          {user.name || "Unnamed User"}
        </h2>

        <p className="mt-1 truncate text-xs font-semibold text-indigo-600">
          {user.position || "No position"}
        </p>
      </div>

      {/* DETAILS */}

      <div className="mt-4 space-y-2.5">
        <DetailRow
          icon={<FiMail />}
          value={user.email || "No email"}
        />

        <DetailRow
          icon={<FiBriefcase />}
          value={user.position || "No position"}
        />

        {user.address && (
          <DetailRow
            icon={<FiMapPin />}
            value={user.address}
          />
        )}
      </div>
    </div>

    {/* ACTIONS */}

    <div className="border-t border-gray-100 bg-gray-50/70 p-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEdit(user)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-indigo-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-indigo-50 hover:ring-indigo-100"
        >
          <FiEdit2 />
          Edit
        </button>

        {isAdmin ? (
          <button
            type="button"
            onClick={() =>
              onDelete(getUserId(user))
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

      {/* RESET PASSWORD */}

      {isAdmin && role === "employee" && (
        <button
          type="button"
          onClick={() => onResetPassword(user)}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
        >
          <FiKey />
          Reset Password
        </button>
      )}

      {/* ACCESS INDICATOR */}

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

// ============================================================
// DETAIL ROW
// ============================================================

const DetailRow = ({ icon, value }) => (
  <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
    <span className="shrink-0 text-gray-400">
      {icon}
    </span>

    <span className="truncate">
      {value}
    </span>
  </div>
);

// ============================================================
// LOADING STATE
// ============================================================

const LoadingState = () => (
  <div className="flex min-h-60 flex-col items-center justify-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
    </div>

    <p className="mt-4 text-sm font-semibold text-gray-700">
      Loading users...
    </p>

    <p className="mt-1 text-xs text-gray-400">
      Please wait a moment.
    </p>
  </div>
);

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({ searching }) => (
  <div className="flex min-h-60 flex-col items-center justify-center text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
      <FiUsers className="text-2xl" />
    </div>

    <h3 className="mt-4 text-sm font-semibold text-gray-700">
      No users found
    </h3>

    <p className="mt-1 max-w-sm text-xs leading-5 text-gray-400">
      {searching
        ? "Try a different search term."
        : "There are currently no users to display."}
    </p>
  </div>
);

export default AddUser;