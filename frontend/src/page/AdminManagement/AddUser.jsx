import { useEffect, useState } from "react";

import axios from "axios";

import ModalUserEdit from "../AdminManagement/ModalUserEdit.jsx";
import ResetPasswordModal from "../AdminManagement/ResetPasswordModal.jsx";

import { useAuth } from "../../context/AuthContext";
import useAlert from "../../context/useAlert.jsx";

const USERS_URL = "/api/users";
const REGISTER_URL = "/api/auth/register";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  address: "",
  position: "",
  role: "employee",
  profileImage: null,
};

const AddUser = () => {
  const { user: currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    ...emptyForm,
  });

  const [loading, setLoading] = useState(false);

  // ========================================
  // RESET PASSWORD STATE
  // ========================================

  const [resetPasswordOpen, setResetPasswordOpen] =
    useState(false);

  const [resetPasswordUser, setResetPasswordUser] =
    useState(null);

  const [temporaryPassword, setTemporaryPassword] =
    useState("");

  const [resetPasswordLoading, setResetPasswordLoading] =
    useState(false);

  // ========================================
  // LOGGED-IN USER ROLE
  // ========================================

  const currentUserRole = String(
    currentUser?.role || ""
  ).toLowerCase();

  const isAdmin = currentUserRole === "admin";

  // ========================================
  // AUTH CONFIG
  // ========================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ========================================
  // PROFILE IMAGE URL
  // ========================================

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

  // ========================================
  // FETCH USERS
  // ========================================

  useEffect(() => {
    let ignore = false;

    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error(
            "No authentication token found."
          );
          return;
        }

        setLoading(true);

        const response = await axios.get(
          USERS_URL,
          getAuthConfig()
        );

        console.log(
          "USERS RESPONSE:",
          response.data
        );

        if (!ignore) {
          setUsers(
            response.data.users || []
          );
        }
      } catch (error) {
        if (!ignore) {
          console.error(
            "FAILED TO FETCH USERS:",
            error.response?.data ||
              error.message
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
  }, []);

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // OPEN ADD MODAL
  // ========================================

  const handleAdd = () => {
    setIsEdit(false);
    setSelectedId(null);

    setFormData({
      ...emptyForm,
    });

    setIsModalOpen(true);
  };

  // ========================================
  // OPEN EDIT MODAL
  // ========================================

  const handleEdit = (user) => {
    const userId = user._id || user.id;

    console.log("EDIT USER:", user);
    console.log(
      "SELECTED USER ID:",
      userId
    );

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      address: user.address || "",
      position: user.position || "",
      role: String(
        user.role || "employee"
      ).toLowerCase(),
      profileImage: null,
    });

    setSelectedId(userId);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  // ========================================
  // CLOSE USER MODAL
  // ========================================

  const handleClose = () => {
    setIsModalOpen(false);
    setIsEdit(false);
    setSelectedId(null);

    setFormData({
      ...emptyForm,
    });
  };

  // ========================================
  // ADD / UPDATE USER
  // ========================================

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

      // ========================================
      // BASIC INFORMATION
      // ========================================

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

      // ========================================
      // POSITION + ROLE
      // ========================================

      /*
        Admin:
        Can change position and role.

        Employee:
        Cannot change position or role while editing.

        Creating:
        Admin creates the user.
      */

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

      // ========================================
      // PASSWORD
      // ========================================

      if (!isEdit) {
        data.append(
          "password",
          formData.password
        );
      }

      // ========================================
      // PROFILE IMAGE
      // ========================================

      if (formData.profileImage) {
        data.append(
          "profilePicture",
          formData.profileImage
        );
      }

      // ========================================
      // UPDATE USER
      // ========================================

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

        // Update user list

        setUsers((prev) =>
          prev.map((user) =>
            String(
              user._id || user.id
            ) === String(selectedId)
              ? updatedUser
              : user
          )
        );

        // ========================================
        // UPDATE LOGGED-IN USER
        // ========================================

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

      // ========================================
      // CREATE USER
      // ========================================

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

  // ========================================
  // DELETE USER
  // ========================================

  const handleDelete = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user?"
      )
    ) {
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

  // ========================================
  // OPEN RESET PASSWORD
  // ========================================

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

  // ========================================
  // CLOSE RESET PASSWORD MODAL
  // ========================================

  const closeResetPassword = () => {
    if (resetPasswordLoading) {
      return;
    }

    setResetPasswordOpen(false);
    setResetPasswordUser(null);
    setTemporaryPassword("");
    setResetPasswordLoading(false);
  };

  // ========================================
  // RESET PASSWORD
  // ========================================

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

  // ========================================
  // SEARCH
  // ========================================

  const filteredUsers = users.filter(
    (user) => {
      const value = String(
        search || ""
      )
        .trim()
        .toLowerCase();

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
    }
  );

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen bg-gray-100 p-1">
      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              User Management
            </h1>

            <p className="text-sm text-gray-500">
              Manage system users
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              + Add User
            </button>
          )}
        </div>

        {/* SEARCH */}

        <div className="mb-5">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search users..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* USERS */}

        <div className="overflow-hidden rounded-xl bg-white p-6 shadow">
          {loading && users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUsers.map(
                (user) => {
                  const userId =
                    user._id || user.id;

                  return (
                    <div
                      key={userId}
                      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >
                      {/* PROFILE */}

                      <div className="flex flex-col items-center text-center">
                        {user.profileImage ? (
                          <img
                            src={getProfileImageUrl(
                              user.profileImage
                            )}
                            alt={user.name}
                            className="h-20 w-20 rounded-full object-cover ring-4 ring-indigo-50"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "U"}
                          </div>
                        )}

                        <h2 className="mt-4 text-lg font-semibold text-gray-800">
                          {user.name}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-indigo-600">
                          {user.position}
                        </p>

                        <p className="mt-2 w-full truncate text-sm text-gray-500">
                          {user.email}
                        </p>

                        <span className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize text-gray-700">
                          {user.role}
                        </span>
                      </div>

                      {/* ACTIONS */}

                      <div className="mt-5 flex flex-col gap-2 border-t border-gray-100 pt-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(user)
                            }
                            className="flex-1 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100"
                          >
                            Edit Profile
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  userId
                                )
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        {/* RESET PASSWORD */}

                        {isAdmin &&
                          String(
                            user.role || ""
                          ).toLowerCase() ===
                            "employee" && (
                            <button
                              type="button"
                              onClick={() =>
                                openResetPassword(
                                  user
                                )
                              }
                              className="w-full rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
                            >
                              Reset Password
                            </button>
                          )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* EDIT / ADD USER MODAL */}

        <ModalUserEdit
          isOpen={isModalOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          formData={formData}
          onChange={handleChange}
          isEdit={isEdit}
          currentUserRole={currentUserRole}
        />

        {/* RESET PASSWORD MODAL */}

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