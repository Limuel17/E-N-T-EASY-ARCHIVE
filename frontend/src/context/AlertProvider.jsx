import {
  useCallback,
  useState,
} from "react";

import AlertContext from "./AlertContext";

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    show: false,
    type: "info",
    title: "",
    message: "",
    duration: 4000,
  });

  const showAlert = useCallback(
    (
      type = "info",
      title = "",
      message = "",
      duration = 4000
    ) => {
      setAlert({
        show: true,
        type,
        title,
        message,
        duration,
      });
    },
    []
  );

  const closeAlert = useCallback(() => {
    setAlert((prev) => ({
      ...prev,
      show: false,
    }));
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alert,
        showAlert,
        closeAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export default AlertProvider;