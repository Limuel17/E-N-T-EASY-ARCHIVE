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
  confirm: <FiAlertTriangle />,
};

const Alert = ({
  show,
  type = "info",
  title,
  message,
  duration = 4000,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const isConfirm = type === "confirm";

  useEffect(() => {
    if (
      !show ||
      isConfirm ||
      type === "loading" ||
      !duration
    ) {
      return undefined;
    }

    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [
    show,
    type,
    duration,
    onClose,
    isConfirm,
  ]);

  if (!show) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose?.();
  };

  return (
    <div
      className={`ent-alert ent-alert-${type}`}
      role={isConfirm ? "dialog" : "alert"}
      aria-modal={isConfirm ? "true" : undefined}
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

        {isConfirm && (
          <div className="ent-alert-actions">
            <button
              type="button"
              className="ent-alert-button ent-alert-button-cancel"
              onClick={handleCancel}
            >
              {cancelText}
            </button>

            <button
              type="button"
              className="ent-alert-button ent-alert-button-confirm"
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>

      {!isConfirm && type !== "loading" && (
        <button
          type="button"
          className="ent-alert-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          <FiX />
        </button>
      )}

      {isConfirm && (
        <button
          type="button"
          className="ent-alert-close"
          onClick={handleCancel}
          aria-label="Close confirmation"
        >
          <FiX />
        </button>
      )}
    </div>
  );
};

export default Alert;