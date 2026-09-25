import { useCallback, useState } from "react";

import Alert from "../components/Alert"
import AlertContext from "../context/AlertContext";

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    duration: 4000,
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    onCancel: null,
  });

  const showAlert = useCallback(
    (
      type = "info",
      title = "",
      message = "",
      options = {}
    ) => {
      const duration =
        typeof options === "number"
          ? options
          : options.duration ?? 4000;

      setAlert({
        show: true,
        type,
        title,
        message,
        duration,
        confirmText:
          typeof options === "object"
            ? options.confirmText || "Confirm"
            : "Confirm",
        cancelText:
          typeof options === "object"
            ? options.cancelText || "Cancel"
            : "Cancel",
        onConfirm:
          typeof options === "object"
            ? options.onConfirm || null
            : null,
        onCancel:
          typeof options === "object"
            ? options.onCancel || null
            : null,
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlert((previous) => ({
      ...previous,
      show: false,
      onConfirm: null,
      onCancel: null,
    }));
  }, []);

  const handleConfirm = useCallback(() => {
    const callback = alert.onConfirm;

    closeAlert();

    callback?.();
  }, [alert.onConfirm, closeAlert]);

  const handleCancel = useCallback(() => {
    const callback = alert.onCancel;

    closeAlert();

    callback?.();
  }, [alert.onCancel, closeAlert]);

  return (
    <AlertContext.Provider
      value={{
        alert,
        showAlert,
        closeAlert,
      }}
    >
      {children}

      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        duration={alert.duration}
        onClose={closeAlert}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};

export default AlertProvider;