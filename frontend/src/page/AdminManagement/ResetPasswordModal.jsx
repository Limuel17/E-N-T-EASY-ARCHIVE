import { useState } from "react";

import {
  FiX,
  FiLock,
  FiCopy,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";

import useAlert from "../../context/useAlert.jsx";

const ResetPasswordModal = ({
  isOpen,
  onClose,
  user,
  temporaryPassword,
  onReset,
  resetting = false,
}) => {
  const [copied, setCopied] = useState(false);

  const { showAlert } = useAlert();

  if (!isOpen || !user) {
    return null;
  }

  const handleCopy = async () => {
    if (!temporaryPassword) {
      showAlert(
        "warning",
        "Nothing to Copy",
        "There is no temporary password to copy."
      );
      return;
    }

    try {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(
          temporaryPassword
        );
      } else {
        const textarea =
          document.createElement("textarea");

        textarea.value = temporaryPassword;

        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "0";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(
          0,
          textarea.value.length
        );

        const copiedSuccessfully =
          document.execCommand("copy");

        document.body.removeChild(textarea);

        if (!copiedSuccessfully) {
          throw new Error(
            "Clipboard copy command failed."
          );
        }
      }

      setCopied(true);

      showAlert(
        "success",
        "Password Copied",
        "The temporary password has been copied to your clipboard."
      );

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY PASSWORD ERROR:",
        error
      );

      showAlert(
        "error",
        "Copy Failed",
        "Unable to copy the temporary password. Please copy it manually."
      );
    }
  };

  const handleClose = () => {
    if (resetting) {
      return;
    }

    setCopied(false);
    onClose();
  };

  const hasTemporaryPassword =
    Boolean(temporaryPassword);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={handleClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <FiLock size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Reset Password
              </h2>

              <p className="text-sm text-gray-500">
                Admin password reset
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={resetting}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6">
          {/* USER */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Employee
            </p>

            <p className="mt-1 text-base font-bold text-gray-800">
              {user.name || "-"}
            </p>

            <p className="mt-1 break-all text-sm text-gray-500">
              {user.email || "-"}
            </p>
          </div>

          {!hasTemporaryPassword ? (
            <>
              {/* RESET CONFIRMATION */}
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <FiLock
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Reset this employee's password?
                    </p>

                    <p className="mt-1 text-sm leading-5 text-amber-700">
                      A new temporary password will be
                      generated automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={resetting}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onReset}
                  disabled={resetting}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetting ? (
                    <>
                      <FiRefreshCw
                        size={16}
                        className="animate-spin"
                      />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <FiLock size={16} />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* SUCCESS */}
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FiCheck size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Password reset successfully
                    </p>

                    <p className="mt-1 text-sm leading-5 text-green-700">
                      Give the temporary password below to
                      the employee.
                    </p>
                  </div>
                </div>
              </div>

              {/* TEMPORARY PASSWORD */}
              <div className="mt-5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Temporary Password
                </label>

                <div className="mt-2 flex items-center gap-2 rounded-xl border border-gray-300 bg-gray-50 p-2">
                  <div className="min-w-0 flex-1 px-3">
                    <p className="break-all font-mono text-lg font-bold tracking-wider text-gray-800">
                      {temporaryPassword}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {copied ? (
                      <>
                        <FiCheck size={16} />
                        Copied
                      </>
                    ) : (
                      <>
                        <FiCopy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* WARNING */}
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm leading-5 text-blue-800">
                  Please provide this temporary password
                  securely to the employee. The employee
                  should change the password after signing in.
                </p>
              </div>

              {/* DONE */}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;