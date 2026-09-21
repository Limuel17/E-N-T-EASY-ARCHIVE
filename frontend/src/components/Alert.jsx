import { useEffect } from "react";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiInfo,
  FiLoader,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import "./Alert.css";

const alertIcons = {
  success: <FiCheckCircle />,
  error: <FiXCircle />,
  warning: <FiAlertTriangle />,
  info: <FiInfo />,
  loading: <FiLoader className="ent-alert-spinner" />,
};

const Alert = ({
  show,
  type = "info",
  title,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    if (!show || type === "loading" || !duration) {
      return;
    }

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, type, duration, onClose]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={`ent-alert ent-alert-${type}`}
      role="alert"
    >
      <div className="ent-alert-icon">
        {alertIcons[type] || alertIcons.info}
      </div>

      <div className="ent-alert-content">
        {title && (
          <div className="ent-alert-title">
            {title}
          </div>
        )}

        {message && (
          <div className="ent-alert-message">
            {message}
          </div>
        )}
      </div>

      {type !== "loading" && (
        <button
          type="button"
          className="ent-alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default Alert;