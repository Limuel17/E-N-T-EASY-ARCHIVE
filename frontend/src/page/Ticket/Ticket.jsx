
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiPlus,
  FiFileText,
  FiCheckCircle,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import TicketTable from "./TicketTable";
import ModalAddTicket from "./ModalAddTicket";
import TicketDetailsModal from "./TicketDetailsModal";

const API_URL = "/api/tickets";
const EMPLOYEE_REFRESH_INTERVAL = 10000;

const formatDateTime = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString();
};

const Ticket = () => {
  const { user } = useAuth();

  const currentUserRole = String(user?.role || "").toLowerCase();
  const isAdmin = currentUserRole === "admin";

  // =========================
  // TICKETS
  // =========================
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // EMPLOYEE CREATE MODAL
  // =========================
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    department: "",
    priority: "Medium",
    concern: "",
    note: "",
  });

  // =========================
  // ADMIN SOLVE MODAL
  // =========================
  const [solveModalOpen, setSolveModalOpen] = useState(false);
  const [ticketToSolve, setTicketToSolve] = useState(null);
  const [solving, setSolving] = useState(false);

  // =========================
  // ADMIN DETAILS MODAL
  // =========================
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // =========================
  // TOKEN
  // =========================
  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // FETCH TICKETS
  // =========================
  const fetchTickets = useCallback(async (showLoading = true) => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.success) {
        setTickets(response.data.tickets || []);
      } else {
        throw new Error(
          response.data?.message || "Failed to load tickets."
        );
      }
    } catch (error) {
      console.error(
        "FETCH TICKETS ERROR:",
        error.response?.data || error.message
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTickets(true);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchTickets]);

  // =========================
  // EMPLOYEE AUTO REFRESH
  // =========================
  useEffect(() => {
    if (isAdmin) {
      return undefined;
    }

    const interval = setInterval(() => {
      fetchTickets(false);
    }, EMPLOYEE_REFRESH_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [isAdmin, fetchTickets]);

  // =========================
  // RESET FORM
  // =========================
  const resetForm = () => {
    setFormData({
      department: "",
      priority: "Medium",
      concern: "",
      note: "",
    });
  };

  // =========================
  // OPEN CREATE REQUEST MODAL
  // =========================
  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  // =========================
  // CLOSE CREATE REQUEST MODAL
  // =========================
  const closeModal = () => {
    if (submitting) {
      return;
    }

    setModalOpen(false);
    resetForm();
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================
  // EMPLOYEE SUBMIT REQUEST
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      console.error("Authentication token not found.");
      return;
    }

    if (!formData.department.trim()) {
      console.error("Please select a department.");
      return;
    }

    if (!formData.concern.trim()) {
      console.error("Please enter your concern.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        API_URL,
        {
          department: formData.department,
          priority: formData.priority,
          concern: formData.concern,
          note: formData.note,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to submit ticket."
        );
      }

      setModalOpen(false);
      resetForm();

      await fetchTickets(true);
    } catch (error) {
      console.error(
        "SUBMIT TICKET ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // ADMIN OPEN SOLVE MODAL
  // =========================
  const handleSolve = (ticket) => {
    if (!ticket?._id) {
      return;
    }

    if (
      ticket.status === "Resolved" ||
      ticket.status === "Closed"
    ) {
      return;
    }

    setTicketToSolve(ticket);
    setSolveModalOpen(true);
  };

  // =========================
  // CLOSE SOLVE MODAL
  // =========================
  const closeSolveModal = () => {
    if (solving) {
      return;
    }

    setSolveModalOpen(false);
    setTicketToSolve(null);
  };

  // =========================
  // CONFIRM SOLVE
  // =========================
  const confirmSolve = async () => {
    if (!ticketToSolve?._id) {
      return;
    }

    const token = getToken();

    if (!token) {
      console.error("Authentication token not found.");
      return;
    }

    try {
      setSolving(true);

      await axios.put(
        `${API_URL}/${ticketToSolve._id}`,
        {
          status: "Resolved",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSolveModalOpen(false);
      setTicketToSolve(null);

      await fetchTickets(true);
    } catch (error) {
      console.error(
        "SOLVE TICKET ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setSolving(false);
    }
  };

  // =========================
  // ADMIN DELETE
  // =========================
  const handleDelete = async (ticket) => {
    if (!isAdmin || !ticket?._id) {
      return;
    }

    const requesterName =
      ticket.name ||
      ticket.createdBy?.name ||
      "this requester";

    const confirmed = window.confirm(
      `Are you sure you want to delete this ticket from ${requesterName}?`
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      console.error("Authentication token not found.");
      return;
    }

    try {
      await axios.delete(`${API_URL}/${ticket._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchTickets(true);
    } catch (error) {
      console.error(
        "DELETE TICKET ERROR:",
        error.response?.data || error.message
      );
    }
  };

  // =========================
  // ADMIN VIEW
  // =========================
  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedTicket(null);
  };

  // =========================================================
  // ADMIN PAGE
  // =========================================================
  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FiFileText size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Ticket Management
                </h1>

                <p className="text-sm text-gray-500">
                  Manage employee ticket requests.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchTickets(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <FiRefreshCw size={16} />
            Refresh
          </button>
        </div>

        {/* TICKET TABLE */}
        <TicketTable
          tickets={tickets}
          loading={loading}
          isAdmin
          onView={handleView}
          onSolve={handleSolve}
          onDelete={handleDelete}
        />

        {/* TICKET DETAILS MODAL */}
        <TicketDetailsModal
          isOpen={detailsModalOpen}
          onClose={closeDetailsModal}
          ticket={selectedTicket}
        />

        {/* SOLVE CONFIRMATION MODAL */}
        {solveModalOpen && ticketToSolve && (
          <div
            className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onMouseDown={closeSolveModal}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <FiCheckCircle size={22} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Resolve Ticket
                    </h2>

                    <p className="text-sm text-gray-500">
                      Confirm ticket resolution
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={solving}
                  onClick={closeSolveModal}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Close"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* BODY */}
              <div className="px-6 py-6">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Requester
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-800">
                    {ticketToSolve.name ||
                      ticketToSolve.createdBy?.name ||
                      "-"}
                  </p>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Position
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {ticketToSolve.position ||
                        ticketToSolve.createdBy?.position ||
                        "-"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {ticketToSolve.department || "-"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Concern
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-700">
                      {ticketToSolve.concern || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <p className="text-sm leading-5 text-green-800">
                      Mark this ticket as{" "}
                      <span className="font-bold">Resolved</span>?
                      The current time will be saved as the solved
                      time.
                    </p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  disabled={solving}
                  onClick={closeSolveModal}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={solving}
                  onClick={confirmSolve}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiCheckCircle size={16} />

                  {solving
                    ? "Resolving..."
                    : "Mark as Resolved"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // EMPLOYEE PAGE
  // =========================================================
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* TITLE */}
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <FiFileText size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Request Ticket
              </h1>

              <p className="text-sm text-gray-500">
                Submit a request or report an issue.
              </p>
            </div>
          </div>
        </div>

        {/* NEW REQUEST BUTTON */}
        <button
          type="button"
          onClick={openCreateModal}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
        >
          <FiPlus size={18} />
          New Request
        </button>
      </div>

      {/* REQUESTER INFORMATION */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">
          Requester Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Name
            </p>

            <p className="text-sm font-medium text-gray-800">
              {user?.name || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Position
            </p>

            <p className="text-sm font-medium text-gray-800">
              {user?.position || "-"}
            </p>
          </div>

          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              Email
            </p>

            <p className="text-sm font-medium text-gray-800">
              {user?.email || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* MY REQUESTS */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              My Requests
            </h2>

            <p className="text-sm text-gray-500">
              Your ticket status updates automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchTickets(true)}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50"
            title="Refresh requests"
          >
            <FiRefreshCw size={16} />
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">
            Loading requests...
          </div>
        ) : tickets.length === 0 ? (
          /* EMPTY STATE */
          <div className="px-5 py-12 text-center">
            <FiFileText
              size={32}
              className="mx-auto mb-3 text-gray-300"
            />

            <p className="text-sm font-medium text-gray-600">
              No ticket requests yet.
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Click "New Request" to submit your first ticket.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FiPlus size={17} />
              New Request
            </button>
          </div>
        ) : (
          /* REQUEST TABLE */
          <div className="overflow-x-auto">
            <table className="w-full min-w-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Department
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Priority
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Concern
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Note
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Request Time
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Solved Time
                  </th>

                  <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Solved By
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {ticket.department || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          ticket.priority === "Urgent"
                            ? "bg-red-100 text-red-700"
                            : ticket.priority === "High"
                              ? "bg-orange-100 text-orange-700"
                              : ticket.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                        }`}
                      >
                        {ticket.priority || "-"}
                      </span>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-gray-700">
                      <div
                        className="truncate"
                        title={ticket.concern || ""}
                      >
                        {ticket.concern || "-"}
                      </div>
                    </td>

                    <td className="max-w-sm px-5 py-4 text-sm text-gray-500">
                      <div
                        className="truncate"
                        title={ticket.note || ""}
                      >
                        {ticket.note || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                          ticket.status === "Open"
                            ? "bg-blue-100 text-blue-700"
                            : ticket.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-700"
                              : ticket.status === "Resolved"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ticket.status || "-"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {formatDateTime(ticket.createdAt)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                      {ticket.solvedAt
                        ? formatDateTime(ticket.solvedAt)
                        : "-"}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">
                      {ticket.solvedBy?.name || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EMPLOYEE CREATE REQUEST MODAL */}
      <ModalAddTicket
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        onChange={handleChange}
        isEdit={false}
        submitting={submitting}
        user={user}
        isAdmin={false}
      />
    </div>
  );
};

export default Ticket;