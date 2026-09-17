
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import axios from "axios";
import {
  FiCamera,
  FiLock,
  FiLogOut,
  FiSave,
  FiSettings,
  FiUser,
  FiX,
} from "react-icons/fi";
import Notifications from "./Notification";

const USERS_URL = "/api/users";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// ============================================================
// HELPERS
// ============================================================

const getStoredUser = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error("FAILED TO READ USER:", error);
    return null;
  }
};

const createProfileForm = (user) => ({
  name: user?.name || "",
  email: user?.email || "",
  address: user?.address || "",
  position: user?.position || "",
  role: String(user?.role || "employee").toLowerCase(),
});

const getProfileImageUrl = (profileImage) => {
  if (!profileImage) {
    return "";
  }

  const image = String(profileImage);

  // Keep full external URLs unchanged.
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Local IIS paths.
  return image.startsWith("/") ? image : `/${image}`;
};

// ============================================================
// HEADER
// ============================================================

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ==========================================================
  // USER
  // ==========================================================

  const [user, setUser] = useState(() => getStoredUser());

  // ==========================================================
  // PROFILE
  // ==========================================================

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const [profileForm, setProfileForm] = useState(() =>
    createProfileForm(getStoredUser())
  );

  const [profilePreview, setProfilePreview] = useState(() => {
    const storedUser = getStoredUser();

    return getProfileImageUrl(storedUser?.profileImage);
  });

  // ==========================================================
  // ROLE
  // ==========================================================

  const userRole = String(
    user?.role || profileForm.role || ""
  ).toLowerCase();

  const isAdmin = userRole === "admin";
  const isEmployee = userRole === "employee";

  // ==========================================================
  // FETCH CURRENT USER
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser?._id) {
          return;
        }

        const response = await axios.get(
          `${USERS_URL}/${parsedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          cancelled ||
          !response.data?.success ||
          !response.data?.user
        ) {
          return;
        }

        const currentUser = response.data.user;

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

        setProfileForm(createProfileForm(currentUser));

        setProfilePreview(
          getProfileImageUrl(currentUser.profileImage)
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "FAILED TO FETCH CURRENT USER:",
            error.response?.data || error.message
          );
        }
      }
    };

    fetchCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // PROFILE FORM CHANGE
  // ==========================================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // OPEN PROFILE MODAL
  // ==========================================================

  const openProfileModal = () => {
    setProfileOpen(false);

    setProfileForm(createProfileForm(user));

    setProfilePicture(null);

    setProfilePreview(
      getProfileImageUrl(user?.profileImage)
    );

    setProfileModalOpen(true);
  };

  // ==========================================================
  // PROFILE IMAGE CHANGE
  // ==========================================================

  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert(
        "Only JPG, PNG, and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      alert(
        "Profile image must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setProfilePicture(file);

    const previewUrl = URL.createObjectURL(file);

    setProfilePreview(previewUrl);
  };

  // ==========================================================
  // CLEAN PROFILE PREVIEW URL
  // ==========================================================

  useEffect(() => {
    return () => {
      if (profilePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("No authentication token found.");
      return;
    }

    if (!user?._id) {
      alert("Invalid user ID.");
      return;
    }

    if (!profileForm.name.trim()) {
      alert("Name is required.");
      return;
    }

    if (!profileForm.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (isAdmin && !profileForm.position.trim()) {
      alert("Position is required.");
      return;
    }

    const formData = new FormData();

    formData.append(
      "name",
      profileForm.name.trim()
    );

    formData.append(
      "email",
      profileForm.email.trim()
    );

    formData.append(
      "address",
      profileForm.address?.trim() || ""
    );

    // Employees cannot change their position or role.
    if (isAdmin) {
      formData.append(
        "position",
        profileForm.position.trim()
      );

      formData.append(
        "role",
        String(profileForm.role).toLowerCase()
      );
    }

    if (profilePicture) {
      formData.append(
        "profilePicture",
        profilePicture
      );
    }

    try {
      setSavingProfile(true);

      const response = await axios.put(
        `${USERS_URL}/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        alert(
          response.data?.message ||
            "Failed to update profile."
        );
        return;
      }

      const updatedUser = response.data.user;

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setProfileForm(
        createProfileForm(updatedUser)
      );

      setProfilePreview(
        getProfileImageUrl(
          updatedUser.profileImage
        )
      );

      setProfilePicture(null);

      setProfileModalOpen(false);

      alert("Profile updated successfully.");
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const handleChangePassword = () => {
    setProfileOpen(false);

    if (isEmployee) {
      navigate("/employee/change-password");
      return;
    }

    if (isAdmin) {
      navigate("/admin/change-password");
    }
  };

  // ==========================================================
  // SETTINGS
  // ==========================================================

  const handleSettings = () => {
    setProfileOpen(false);

    if (isEmployee) {
      navigate("/employee/settings");
      return;
    }

    if (isAdmin) {
      navigate("/admin/settings");
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  // ==========================================================
  // PAGE TITLE
  // ==========================================================

  const getPageTitle = () => {
    const path = location.pathname;

    if (path.includes("machine-operation-log")) {
      return "Machine Operation Log";
    }

    if (path.includes("factorycard")) {
      return "Factory Card";
    }

    if (path.includes("management")) {
      return "User Management";
    }

    if (path.includes("change-password")) {
      return "Change Password";
    }

    if (path.includes("ticket")) {
      return "Ticket";
    }

    if (path.includes("settings")) {
      return "Settings";
    }

    if (
      path.includes("/admin/dashboard") ||
      path.includes("/employee/dashboard")
    ) {
      return "Dashboard";
    }

    return isEmployee ? "Employee" : "Admin";
  };

  // ==========================================================
  // USER INITIAL
  // ==========================================================

  const getInitial = () => {
    return (
      user?.name?.charAt(0)?.toUpperCase() || "U"
    );
  };

  // ==========================================================
  // PROFILE IMAGE
  // ==========================================================

  const profileImageUrl = getProfileImageUrl(
    user?.profileImage
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-30 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md lg:left-64">
        <div className="flex h-18 items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ==================================================
              LEFT SIDE
          ================================================== */}

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden h-9 w-1 rounded-full bg-indigo-600 sm:block" />

            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-500">
                E-N-T EASY ARCHIVE
              </p>

              <h2 className="truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDE
          ================================================== */}

          <div className="flex items-center gap-1.5 sm:gap-3">

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <Notifications user={user} />

            {/* =================================================
                DIVIDER
            ================================================= */}

            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

            {/* =================================================
                PROFILE
            ================================================= */}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(
                    (previous) => !previous
                  );
                }}
                className={`group flex items-center gap-2 rounded-xl border px-2 py-1.5 transition-all sm:px-2.5 ${
                  profileOpen
                    ? "border-indigo-200 bg-indigo-50"
                    : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* PROFILE IMAGE */}

                <div className="relative">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt="Profile"
                      className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-gray-200"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-sm font-bold text-white shadow-sm">
                      {getInitial()}
                    </div>
                  )}

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                {/* USER INFO */}

                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-32 truncate text-sm font-bold text-gray-800">
                    {user?.name || "User"}
                  </p>

                  <p className="text-[11px] font-medium capitalize text-gray-500">
                    {userRole}
                  </p>
                </div>

                <span
                  className={`hidden text-[10px] text-gray-400 transition-transform sm:block ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {/* =================================================
                  PROFILE DROPDOWN
              ================================================= */}

              {profileOpen && (
                <>
                  {/* BACKDROP */}

                  <button
                    type="button"
                    aria-label="Close profile menu"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  {/* DROPDOWN */}

                  <div className="absolute right-0 z-50 mt-3 w-70 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

                    {/* USER INFO */}

                    <div className="bg-linear-to-br from-indigo-600 to-indigo-700 px-5 py-5">
                      <div className="flex items-center gap-3">
                        {profileImageUrl ? (
                          <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="h-12 w-12 rounded-full border-2 border-white/80 object-cover shadow-md"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-lg font-bold text-white">
                            {getInitial()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">
                            {user?.name || "User"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-indigo-100">
                            {user?.email || ""}
                          </p>

                          <span className="mt-1.5 inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold capitalize text-white">
                            {userRole}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MENU */}

                    <div className="p-2">

                      {/* EDIT PROFILE */}

                      <button
                        type="button"
                        onClick={openProfileModal}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-indigo-100">
                          <FiUser className="text-lg" />
                        </span>

                        <span>
                          Edit Profile
                        </span>
                      </button>

                      {/* SETTINGS */}

                      <button
                        type="button"
                        onClick={handleSettings}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-indigo-100">
                          <FiSettings className="text-lg" />
                        </span>

                        <span>
                          Settings
                        </span>
                      </button>

                      {/* CHANGE PASSWORD */}

                      <button
                        type="button"
                        onClick={handleChangePassword}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition group-hover:bg-indigo-100">
                          <FiLock className="text-lg" />
                        </span>

                        <span>
                          Change Password
                        </span>
                      </button>

                      <div className="my-2 border-t border-gray-100" />

                      {/* LOGOUT */}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition group-hover:bg-red-100">
                          <FiLogOut className="text-lg" />
                        </span>

                        <span>
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          EDIT PROFILE MODAL
      ======================================================== */}

      {profileModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.25)]">

            {/* ==================================================
                MODAL HEADER
            ================================================== */}

            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FiUser className="text-xl" />
                </div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-gray-900">
                    Edit Profile
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Update your account information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setProfileModalOpen(false)
                }
                disabled={savingProfile}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close edit profile"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSaveProfile}
              className="overflow-y-auto"
            >
              <div className="space-y-6 p-5 sm:p-7">

                {/* ==================================================
                    PROFILE PICTURE
                ================================================== */}

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg ring-1 ring-gray-200"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-indigo-700 text-4xl font-bold text-white shadow-lg">
                          {profileForm.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </div>
                      )}

                      <label
                        htmlFor="profilePicture"
                        className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-white shadow-lg transition hover:scale-105 hover:bg-indigo-700"
                      >
                        <FiCamera className="text-base" />

                        <input
                          id="profilePicture"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleProfilePictureChange
                          }
                          className="hidden"
                        />
                      </label>
                    </div>

                    <p className="mt-3 text-xs font-medium text-gray-500">
                      JPG, PNG or WEBP · Maximum 5 MB
                    </p>
                  </div>
                </div>

                {/* ==================================================
                    PERSONAL INFORMATION
                ================================================== */}

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-indigo-600" />

                    <h3 className="text-sm font-bold text-gray-800">
                      Personal Information
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* NAME */}

                    <div>
                      <label
                        htmlFor="profileName"
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                      >
                        Name
                      </label>

                      <input
                        id="profileName"
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        placeholder="Enter name"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                      />
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label
                        htmlFor="profileEmail"
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                      >
                        Email
                      </label>

                      <input
                        id="profileEmail"
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        placeholder="Enter email"
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                      />
                    </div>

                    {/* ADDRESS */}

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="profileAddress"
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                      >
                        Address
                      </label>

                      <textarea
                        id="profileAddress"
                        name="address"
                        value={profileForm.address}
                        onChange={handleProfileChange}
                        placeholder="Enter address"
                        rows={3}
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                      />
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    WORK INFORMATION
                ================================================== */}

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-5 w-1 rounded-full bg-indigo-600" />

                    <h3 className="text-sm font-bold text-gray-800">
                      Work Information
                    </h3>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    {/* POSITION */}

                    <div>
                      <label
                        htmlFor="profilePosition"
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                      >
                        Position
                      </label>

                      {isEmployee ? (
                        <>
                          <input
                            id="profilePosition"
                            type="text"
                            value={profileForm.position}
                            disabled
                            readOnly
                            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                          />

                          <p className="mt-2 text-[11px] text-gray-400">
                            Only an administrator can change your position.
                          </p>
                        </>
                      ) : (
                        <input
                          id="profilePosition"
                          type="text"
                          name="position"
                          value={profileForm.position}
                          onChange={handleProfileChange}
                          placeholder="Enter position"
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      )}
                    </div>

                    {/* ROLE */}

                    <div>
                      <label
                        htmlFor="profileRole"
                        className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500"
                      >
                        Role
                      </label>

                      {isEmployee ? (
                        <>
                          <input
                            id="profileRole"
                            type="text"
                            value="Employee"
                            disabled
                            readOnly
                            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500 outline-none"
                          />

                          <p className="mt-2 text-[11px] text-gray-400">
                            Only an administrator can change your role.
                          </p>
                        </>
                      ) : (
                        <select
                          id="profileRole"
                          name="role"
                          value={profileForm.role}
                          onChange={handleProfileChange}
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        >
                          <option value="employee">
                            Employee
                          </option>

                          <option value="admin">
                            Admin
                          </option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  MODAL FOOTER
              ================================================== */}

              <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-7">

                <button
                  type="button"
                  onClick={() =>
                    setProfileModalOpen(false)
                  }
                  disabled={savingProfile}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingProfile ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

