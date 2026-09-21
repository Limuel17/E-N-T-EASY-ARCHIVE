import { useState } from "react";

import { useNavigate } from "react-router";

import axios from "axios";

import {
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import useAlert from "../../context/useAlert.jsx";

const API_URL = "/api/users";

/* =========================================================
   PASSWORD FIELD
   Keep this OUTSIDE ChangePassword so the input does not
   remount every time the user types.
========================================================= */

const PasswordField = ({
  label,
  name,
  value,
  show,
  setShow,
  placeholder,
  onChange,
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      <div className="relative">
        <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-11 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <button
          type="button"
          onClick={() =>
            setShow((previous) => !previous)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
          aria-label={
            show
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >
          {show ? (
            <FiEyeOff size={18} />
          ) : (
            <FiEye size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   CHANGE PASSWORD
========================================================= */

const ChangePassword = () => {
  const navigate = useNavigate();

  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = formData;

    /* -----------------------------------------
       FRONTEND VALIDATION
    ----------------------------------------- */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      const alertMessage =
        "Please fill in all password fields.";

      setError(alertMessage);

      showAlert(
        "warning",
        "Missing Password",
        alertMessage
      );

      return;
    }

    if (newPassword.length < 6) {
      const alertMessage =
        "New password must be at least 6 characters.";

      setError(alertMessage);

      showAlert(
        "warning",
        "Password Too Short",
        alertMessage
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      const alertMessage =
        "New passwords do not match.";

      setError(alertMessage);

      showAlert(
        "warning",
        "Passwords Do Not Match",
        alertMessage
      );

      return;
    }

    if (currentPassword === newPassword) {
      const alertMessage =
        "New password must be different from your current password.";

      setError(alertMessage);

      showAlert(
        "warning",
        "Password Unchanged",
        alertMessage
      );

      return;
    }

    /* -----------------------------------------
       GET TOKEN
    ----------------------------------------- */

    const token = localStorage.getItem("token");

    if (!token) {
      const alertMessage =
        "Your session has expired. Please login again.";

      setError(alertMessage);

      showAlert(
        "error",
        "Session Expired",
        alertMessage
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);

      return;
    }

    /* -----------------------------------------
       API REQUEST
    ----------------------------------------- */

    try {
      setLoading(true);

      const response = await axios.put(
        `${API_URL}/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.success) {
        const successMessage =
          response.data.message ||
          "Password changed successfully.";

        setMessage(successMessage);

        showAlert(
          "success",
          "Password Changed",
          successMessage
        );

        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
      } else {
        const errorMessage =
          response.data?.message ||
          "Failed to change password.";

        setError(errorMessage);

        showAlert(
          "error",
          "Change Password Failed",
          errorMessage
        );
      }
    } catch (err) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        err
      );

      if (err.response?.status === 401) {
        const alertMessage =
          "Your session has expired. Please login again.";

        setError(alertMessage);

        showAlert(
          "error",
          "Session Expired",
          alertMessage
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        const errorMessage =
          err.response?.data?.message ||
          "Failed to change password. Please try again.";

        setError(errorMessage);

        showAlert(
          "error",
          "Change Password Failed",
          errorMessage
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     BACK BUTTON
  ========================================================= */

  const handleBack = () => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    const role = String(
      user?.role || ""
    ).toLowerCase();

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/employee/dashboard");
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-6 sm:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-2xl">

        {/* -----------------------------------------
            BACK BUTTON
        ----------------------------------------- */}

        <button
          type="button"
          onClick={handleBack}
          className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-indigo-600"
        >
          <FiArrowLeft />
          Back to Dashboard
        </button>

        {/* -----------------------------------------
            CARD
        ----------------------------------------- */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {/* -----------------------------------------
              HEADER
          ----------------------------------------- */}

          <div className="border-b border-gray-200 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FiLock size={21} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Change Password
                </h1>

                <p className="mt-0.5 text-sm text-gray-500">
                  Update your account password.
                </p>
              </div>
            </div>
          </div>

          {/* -----------------------------------------
              FORM
          ----------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5 px-5 py-6 sm:px-7"
          >

            {/* SUCCESS MESSAGE */}

            {message && (
              <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <FiCheckCircle className="mt-0.5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <FiAlertCircle className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* CURRENT PASSWORD */}

            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              show={showCurrent}
              setShow={setShowCurrent}
              placeholder="Enter current password"
              onChange={handleChange}
            />

            {/* NEW PASSWORD */}

            <PasswordField
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              show={showNew}
              setShow={setShowNew}
              placeholder="Enter new password"
              onChange={handleChange}
            />

            {/* PASSWORD REQUIREMENT */}

            <p className="-mt-3 text-xs text-gray-500">
              Password must be at least 6 characters.
            </p>

            {/* CONFIRM PASSWORD */}

            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              show={showConfirm}
              setShow={setShowConfirm}
              placeholder="Confirm new password"
              onChange={handleChange}
            />

            {/* -----------------------------------------
                BUTTONS
            ----------------------------------------- */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;