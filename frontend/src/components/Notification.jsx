
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { IoNotificationsOutline } from "react-icons/io5";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
  FiTool,
  FiTrash2,
  FiX,
} from "react-icons/fi";

// ============================================================
// CONFIGURATION
// ============================================================

const NOTIFICATIONS_URL = "/api/notifications";

const NOTIFICATION_REFRESH_INTERVAL = 5000;

// ============================================================
// HELPERS
// ============================================================

const normalizeNotificationType = (type) => {
  return String(type || "")
    .toLowerCase()
    .replace(/[_\s]/g, "-");
};

const getNotificationRelatedId = (notification) => {
  return (
    notification?.relatedId ||
    notification?.factoryCard?._id ||
    notification?.factoryCard?.id ||
    notification?.factoryCardId ||
    notification?.ticket?._id ||
    notification?.ticket?.id ||
    notification?.ticketId ||
    notification?.machineOperationLog?._id ||
    notification?.machineOperationLog?.id ||
    notification?.machineOperationLogId ||
    null
  );
};

const formatNotificationTime = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const now = new Date();

  const difference =
    now.getTime() - parsedDate.getTime();

  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return parsedDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ============================================================
// NOTIFICATION ICON
// ============================================================

const getNotificationIcon = (type) => {
  if (
    type === "factory-card" ||
    type === "factorycard"
  ) {
    return <FiFileText />;
  }

  if (
    type === "machine-operation-log" ||
    type === "machineoperationlog"
  ) {
    return <FiTool />;
  }

  if (type === "ticket") {
    return <FiCheckCircle />;
  }

  return <IoNotificationsOutline />;
};

// ============================================================
// NOTIFICATION ICON STYLE
// ============================================================

const getNotificationIconStyle = (type) => {
  if (
    type === "factory-card" ||
    type === "factorycard"
  ) {
    return {
      wrapper:
        "bg-indigo-50 text-indigo-600 ring-indigo-100",
    };
  }

  if (
    type === "machine-operation-log" ||
    type === "machineoperationlog"
  ) {
    return {
      wrapper:
        "bg-purple-50 text-purple-600 ring-purple-100",
    };
  }

  if (type === "ticket") {
    return {
      wrapper:
        "bg-emerald-50 text-emerald-600 ring-emerald-100",
    };
  }

  return {
    wrapper:
      "bg-gray-100 text-gray-600 ring-gray-200",
  };
};

// ============================================================
// COMPONENT
// ============================================================

const Notifications = ({ user }) => {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState([]);

  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const [clearModalOpen, setClearModalOpen] =
    useState(false);

  const [clearingNotifications, setClearingNotifications] =
    useState(false);

  // ==========================================================
  // USER ROLE
  // ==========================================================

  const userRole = String(
    user?.role || ""
  ).toLowerCase();

  const isEmployee = userRole === "employee";

  // ==========================================================
  // FETCH NOTIFICATIONS
  // ==========================================================

  const fetchNotifications = useCallback(
    async (showLoading = false) => {
      const token = localStorage.getItem("token");

      if (!token) {
        setNotifications([]);
        return;
      }

      try {
        if (showLoading) {
          setLoadingNotifications(true);
        }

        const response = await axios.get(
          NOTIFICATIONS_URL,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          setNotifications(
            response.data.notifications || []
          );
        }
      } catch (error) {
        console.error(
          "FETCH NOTIFICATIONS ERROR:",
          error.response?.data ||
            error.message
        );
      } finally {
        if (showLoading) {
          setLoadingNotifications(false);
        }
      }
    },
    []
  );

  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {
    if (!user?._id) {
      return undefined;
    }

    /*
     * Delay the initial fetch to avoid the
     * react-hooks/set-state-in-effect ESLint warning.
     */

    const initialFetchId = setTimeout(() => {
      fetchNotifications(false);
    }, 0);

    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, NOTIFICATION_REFRESH_INTERVAL);

    return () => {
      clearTimeout(initialFetchId);
      clearInterval(intervalId);
    };
  }, [
    user?._id,
    fetchNotifications,
  ]);

  // ==========================================================
  // MARK ONE NOTIFICATION AS READ
  // ==========================================================

  const markNotificationAsRead = async (
    notificationId
  ) => {
    const token = localStorage.getItem("token");

    if (!token || !notificationId) {
      return false;
    }

    try {
      await axios.put(
        `${NOTIFICATIONS_URL}/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      return true;
    } catch (error) {
      console.error(
        "MARK NOTIFICATION READ ERROR:",
        error.response?.data ||
          error.message
      );

      return false;
    }
  };

  // ==========================================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================================

  const markAllNotificationsAsRead = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      await axios.put(
        `${NOTIFICATIONS_URL}/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "MARK ALL NOTIFICATIONS READ ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  // ==========================================================
  // CLEAR NOTIFICATIONS
  // ==========================================================

  const openClearConfirmation = () => {
    if (notifications.length === 0) {
      return;
    }

    setClearModalOpen(true);
  };

  const closeClearConfirmation = () => {
    if (clearingNotifications) {
      return;
    }

    setClearModalOpen(false);
  };

  const clearAllNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      return;
    }

    try {
      setClearingNotifications(true);

      await axios.delete(
        `${NOTIFICATIONS_URL}/clear-all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotifications([]);
      setClearModalOpen(false);
    } catch (error) {
      console.error(
        "CLEAR ALL NOTIFICATIONS ERROR:",
        error.response?.data ||
          error.message
      );
    } finally {
      setClearingNotifications(false);
    }
  };

  // ==========================================================
  // HANDLE NOTIFICATION CLICK
  // ==========================================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification) {
      return;
    }

    setNotificationOpen(false);

    // Mark notification as read.
    if (
      !notification.isRead &&
      notification._id
    ) {
      await markNotificationAsRead(
        notification._id
      );
    }

    const notificationType =
      normalizeNotificationType(
        notification.type
      );

    const relatedId =
      getNotificationRelatedId(
        notification
      );

    // ========================================================
    // FACTORY CARD
    // ========================================================

    if (
      notificationType === "factory-card" ||
      notificationType === "factorycard"
    ) {
      const basePath = isEmployee
        ? "/employee/development/factorycard"
        : "/admin/development/factorycard";

      if (relatedId) {
        navigate(
          `${basePath}/${relatedId}`,
          {
            state: {
              openHistory: true,
            },
          }
        );
      } else {
        navigate(basePath);
      }

      return;
    }

    // ========================================================
    // MACHINE OPERATION LOG
    // ========================================================

    if (
      notificationType ===
        "machine-operation-log" ||
      notificationType ===
        "machineoperationlog"
    ) {
      const basePath = isEmployee
        ? "/employee/development/machine-operation-log"
        : "/admin/development/machine-operation-log";

      if (relatedId) {
        navigate(
          `${basePath}?log=${relatedId}`
        );
      } else {
        navigate(basePath);
      }

      return;
    }

    // ========================================================
    // TICKET
    // ========================================================

    if (notificationType === "ticket") {
      const basePath = isEmployee
        ? "/employee/ticket"
        : "/admin/ticket";

      if (relatedId) {
        navigate(
          `${basePath}?ticket=${relatedId}`
        );
      } else {
        navigate(basePath);
      }
    }
  };

  // ==========================================================
  // UNREAD COUNT
  // ==========================================================

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
      {/* ======================================================
          NOTIFICATION BUTTON
      ====================================================== */}

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            const nextState =
              !notificationOpen;

            setNotificationOpen(
              nextState
            );

            if (nextState) {
              fetchNotifications(true);
            }
          }}
          className="
            relative flex h-10 w-10
            items-center justify-center
            rounded-xl
            text-gray-500
            transition-all duration-200
            hover:bg-gray-100
            hover:text-gray-900
            active:scale-95
          "
          aria-label="Notifications"
        >
          <IoNotificationsOutline className="text-[24px]" />

          {unreadCount > 0 && (
            <span
              className="
                absolute -right-0.5 -top-0.5
                flex h-4.5 min-w-4.5
                items-center justify-center
                rounded-full
                bg-red-500
                px-1
                text-[9px]
                font-bold
                text-white
                ring-2 ring-white
              "
            >
              {unreadCount > 99
                ? "99+"
                : unreadCount}
            </span>
          )}
        </button>

        {/* ====================================================
            BACKDROP
        ==================================================== */}

        {notificationOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() =>
              setNotificationOpen(false)
            }
            aria-hidden="true"
          />
        )}

        {/* ====================================================
            NOTIFICATION PANEL
        ==================================================== */}

        {notificationOpen && (
          <div
            className="
              absolute right-0 z-50 mt-3
              w-[calc(100vw-2rem)]
              max-w-105
              overflow-hidden
              rounded-2xl
              border border-gray-200
              bg-white
              shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            "
          >
            {/* PANEL HEADER */}

            <div
              className="
                flex items-center justify-between
                border-b border-gray-100
                bg-white
                px-5 py-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-indigo-50
                    text-indigo-600
                  "
                >
                  <IoNotificationsOutline className="text-xl" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount > 1
                            ? "s"
                            : ""
                        }`
                      : notifications.length > 0
                        ? "You're all caught up"
                        : "Stay updated with recent activity"}
                  </p>
                </div>
              </div>

              {/* HEADER ACTIONS */}

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={
                      markAllNotificationsAsRead
                    }
                    className="
                      rounded-lg
                      px-2.5 py-2
                      text-[11px]
                      font-semibold
                      text-indigo-600
                      transition
                      hover:bg-indigo-50
                    "
                  >
                    Mark all read
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={
                      openClearConfirmation
                    }
                    className="
                      flex items-center gap-1.5
                      rounded-lg
                      px-2.5 py-2
                      text-[11px]
                      font-semibold
                      text-red-500
                      transition
                      hover:bg-red-50
                      hover:text-red-600
                    "
                  >
                    <FiTrash2 className="text-sm" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* ==================================================
                NOTIFICATION LIST
            ================================================== */}

            <div className="max-h-115 overflow-y-auto">
              {loadingNotifications ? (
                <div
                  className="
                    flex min-h-70
                    flex-col
                    items-center
                    justify-center
                    px-6
                  "
                >
                  <span
                    className="
                      h-8 w-8
                      animate-spin
                      rounded-full
                      border-[3px]
                      border-gray-200
                      border-t-indigo-600
                    "
                  />

                  <p className="mt-4 text-xs font-medium text-gray-400">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div
                  className="
                    flex min-h-75
                    flex-col
                    items-center
                    justify-center
                    px-8
                    text-center
                  "
                >
                  <div
                    className="
                      flex h-16 w-16
                      items-center justify-center
                      rounded-2xl
                      bg-gray-100
                      text-gray-400
                    "
                  >
                    <IoNotificationsOutline className="text-3xl" />
                  </div>

                  <p className="mt-4 text-sm font-bold text-gray-800">
                    No notifications
                  </p>

                  <p className="mt-1 max-w-60 text-xs leading-5 text-gray-400">
                    You're all caught up. New
                    activity and updates will
                    appear here.
                  </p>
                </div>
              ) : (
                notifications.map(
                  (notification) => {
                    const type =
                      normalizeNotificationType(
                        notification.type
                      );

                    const iconStyle =
                      getNotificationIconStyle(
                        type
                      );

                    const isUnread =
                      !notification.isRead;

                    return (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`
                          group
                          relative
                          flex w-full
                          gap-3.5
                          border-b
                          border-gray-100
                          px-5 py-4
                          text-left
                          transition-all
                          duration-200
                          ${
                            isUnread
                              ? "bg-indigo-50/40 hover:bg-indigo-50"
                              : "bg-white hover:bg-gray-50"
                          }
                        `}
                      >
                        {/* UNREAD ACCENT */}

                        {isUnread && (
                          <span
                            className="
                              absolute
                              bottom-0 left-0 top-0
                              w-1
                              bg-indigo-600
                            "
                          />
                        )}

                        {/* ICON */}

                        <div
                          className={`
                            flex h-11 w-11
                            shrink-0
                            items-center justify-center
                            rounded-xl
                            ring-1
                            ${iconStyle.wrapper}
                            transition-transform
                            duration-200
                            group-hover:scale-105
                          `}
                        >
                          <span className="text-lg">
                            {getNotificationIcon(
                              type
                            )}
                          </span>
                        </div>

                        {/* CONTENT */}

                        <div className="min-w-0 flex-1">
                          <div
                            className="
                              flex items-start
                              justify-between
                              gap-3
                            "
                          >
                            <p
                              className={`
                                line-clamp-1
                                text-[13px]
                                ${
                                  isUnread
                                    ? "font-bold text-gray-900"
                                    : "font-semibold text-gray-700"
                                }
                              `}
                            >
                              {notification.title ||
                                "Notification"}
                            </p>

                            {isUnread && (
                              <span
                                className="
                                  mt-1
                                  h-2 w-2
                                  shrink-0
                                  rounded-full
                                  bg-indigo-600
                                "
                              />
                            )}
                          </div>

                          <p
                            className="
                              mt-1
                              line-clamp-2
                              text-xs
                              leading-5
                              text-gray-500
                            "
                          >
                            {notification.message ||
                              ""}
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className="
                                text-[10px]
                                font-medium
                                text-gray-400
                              "
                            >
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </span>

                            {isUnread && (
                              <>
                                <span className="h-1 w-1 rounded-full bg-gray-300" />

                                <span className="text-[10px] font-semibold text-indigo-500">
                                  New
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  }
                )
              )}
            </div>

            {/* FOOTER */}

            <div
              className="
                border-t border-gray-100
                bg-gray-50/80
                px-5 py-3
              "
            >
              <p
                className="
                  text-center
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-gray-400
                "
              >
                E-N-T Easy Archive
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          CLEAR CONFIRMATION MODAL
      ======================================================== */}

      {clearModalOpen && (
        <div
          className="
            fixed inset-0
            z-9999
            flex
            min-h-screen
            items-center
            justify-center
            overflow-y-auto
            bg-slate-950/50
            p-4
            backdrop-blur-[2px]
          "
          onClick={closeClearConfirmation}
        >
          <div
            className="
              relative
              mx-auto
              my-auto
              w-full
              max-w-97.5
              overflow-hidden
              rounded-3xl
              border
              border-white/20
              bg-white
              shadow-[0_25px_80px_rgba(0,0,0,0.25)]
            "
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {/* HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-6
                py-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    text-red-500
                  "
                >
                  <FiTrash2 className="text-lg" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Clear notifications
                  </h3>

                  <p className="mt-0.5 text-[10px] text-gray-400">
                    Remove notification history
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeClearConfirmation}
                disabled={clearingNotifications}
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  text-gray-400
                  transition
                  hover:bg-gray-100
                  hover:text-gray-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* BODY */}

            <div className="px-6 py-8">
              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-50
                  text-red-500
                "
              >
                <FiAlertTriangle className="text-2xl" />
              </div>

              <h4
                className="
                  mt-5
                  text-center
                  text-base
                  font-bold
                  text-gray-900
                "
              >
                Clear all notifications?
              </h4>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-72.5
                  text-center
                  text-xs
                  leading-5
                  text-gray-500
                "
              >
                This will permanently delete all
                notifications from your account.
                This action cannot be undone.
              </p>
            </div>

            {/* ACTIONS */}

            <div
              className="
                flex
                gap-3
                border-t
                border-gray-100
                bg-gray-50
                px-6
                py-4
              "
            >
              <button
                type="button"
                onClick={closeClearConfirmation}
                disabled={clearingNotifications}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-gray-700
                  transition
                  hover:bg-gray-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={clearAllNotifications}
                disabled={clearingNotifications}
                className="
                  flex-1
                  rounded-xl
                  bg-red-500
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-600
                  hover:shadow-md
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {clearingNotifications ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/40
                        border-t-white
                      "
                    />
                    Clearing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <FiTrash2 />
                    Clear all
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Notifications;

