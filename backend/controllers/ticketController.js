
import mongoose from "mongoose";

import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/*
|--------------------------------------------------------------------------
| CHECK ADMIN
|--------------------------------------------------------------------------
*/
const isAdminUser = (req) => {
  return (
    String(req.user?.role || "").toLowerCase() ===
    "admin"
  );
};

/*
|--------------------------------------------------------------------------
| GET ALL TICKETS
|--------------------------------------------------------------------------
| Admin:
|   Returns all tickets.
|
| Employee:
|   Returns only tickets created by the logged-in employee.
|--------------------------------------------------------------------------
*/
export const getTickets = async (req, res) => {
  try {
    const query = isAdminUser(req)
      ? {}
      : {
          createdBy: req.user._id,
        };

    const tickets = await Ticket.find(query)
      .populate(
        "createdBy",
        "name email position role"
      )
      .populate(
        "solvedBy",
        "name"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error(
      "GET TICKETS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while fetching tickets.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE TICKET
|--------------------------------------------------------------------------
| Admin:
|   Can view any ticket.
|
| Employee:
|   Can view only their own ticket.
|--------------------------------------------------------------------------
*/
export const getTicket = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    const ticket = await Ticket.findById(id)
      .populate(
        "createdBy",
        "name email position role"
      )
      .populate(
        "solvedBy",
        "name"
      );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Employee can only view their own ticket
    |--------------------------------------------------------------------------
    */
    if (
      !isAdminUser(req) &&
      String(ticket.createdBy?._id) !==
        String(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this ticket.",
      });
    }

    return res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error(
      "GET TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while fetching ticket.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE TICKET
|--------------------------------------------------------------------------
| Employee submits:
|
|   department
|   priority
|   concern
|   note
|
| Name, position and email are taken from the
| logged-in user's database account.
|
| After creating the ticket:
|
|   All administrators receive a notification.
|--------------------------------------------------------------------------
*/
export const createTicket = async (req, res) => {
  try {
    const {
      department,
      priority,
      concern,
      note,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | Validate Department
    |--------------------------------------------------------------------------
    */
    if (!department?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Department is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Concern
    |--------------------------------------------------------------------------
    */
    if (!concern?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Concern is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate Priority
    |--------------------------------------------------------------------------
    */
    const allowedPriorities = [
      "Low",
      "Medium",
      "High",
      "Urgent",
    ];

    const selectedPriority =
      priority || "Medium";

    if (
      !allowedPriorities.includes(
        selectedPriority
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket priority.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Get logged-in user from database
    |--------------------------------------------------------------------------
    */
    const user = await User.findById(
      req.user._id
    ).select(
      "name email position role"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create ticket
    |--------------------------------------------------------------------------
    */
    const ticket = await Ticket.create({
      createdBy: user._id,

      name: user.name,

      position: user.position,

      email: user.email,

      department:
        department.trim(),

      priority:
        selectedPriority,

      concern:
        concern.trim(),

      note:
        note?.trim() || "",

      status: "Open",

      solvedAt: null,

      solvedBy: null,
    });

    /*
    |--------------------------------------------------------------------------
    | NOTIFY ALL ADMINS
    |--------------------------------------------------------------------------
    |
    | The notification is connected to this ticket using:
    |
    | type: "ticket"
    | relatedId: ticket._id
    |
    | Header.jsx uses these values to navigate to:
    |
    | /admin/ticket?ticket=<ticketId>
    |--------------------------------------------------------------------------
    */
    try {
      const admins = await User.find({
        role: "admin",
      }).select("_id");

      if (admins.length > 0) {
        const adminNotifications =
          admins.map((admin) => ({
            recipient: admin._id,

            title:
              "New Ticket Request",

            message:
              `${user.name} submitted a ${selectedPriority} priority ticket: ${concern.trim()}`,

            type:
              "ticket",

            relatedId:
              ticket._id,

            isRead: false,
          }));

        await Notification.insertMany(
          adminNotifications
        );
      }
    } catch (notificationError) {
      /*
      |--------------------------------------------------------------------------
      | Notification errors should NOT prevent ticket creation.
      |--------------------------------------------------------------------------
      */
      console.error(
        "CREATE TICKET NOTIFICATION ERROR:",
        notificationError
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Return populated ticket
    |--------------------------------------------------------------------------
    */
    const populatedTicket =
      await Ticket.findById(
        ticket._id
      )
        .populate(
          "createdBy",
          "name email position role"
        )
        .populate(
          "solvedBy",
          "name"
        );

    return res.status(201).json({
      success: true,

      message:
        "Ticket request submitted successfully.",

      ticket: populatedTicket,
    });
  } catch (error) {
    console.error(
      "CREATE TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while creating ticket.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE TICKET STATUS
|--------------------------------------------------------------------------
| ADMIN ONLY
|
| Admin can update STATUS only.
|
| Allowed:
|
|   Open
|   In Progress
|   Resolved
|   Closed
|
| When status becomes Resolved / Closed:
|
|   solvedAt = current date/time
|   solvedBy = logged-in admin ID
|
| Employee receives a notification.
|--------------------------------------------------------------------------
*/
export const updateTicket = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | ADMIN CHECK
    |--------------------------------------------------------------------------
    */
    if (!isAdminUser(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators can update ticket status.",
      });
    }

    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Validate ticket ID
    |--------------------------------------------------------------------------
    */
    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find ticket
    |--------------------------------------------------------------------------
    */
    const ticket =
      await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | STATUS ONLY
    |--------------------------------------------------------------------------
    |
    | Prevent admin from changing:
    |
    |   department
    |   priority
    |   concern
    |   note
    |   name
    |   position
    |   email
    |
    |--------------------------------------------------------------------------
    */
    const bodyKeys = Object.keys(
      req.body || {}
    );

    const invalidFields =
      bodyKeys.filter(
        (key) => key !== "status"
      );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Only ticket status can be updated.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Validate status
    |--------------------------------------------------------------------------
    */
    const {
      status,
    } = req.body;

    const allowedStatuses = [
      "Open",
      "In Progress",
      "Resolved",
      "Closed",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid ticket status.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Store previous status
    |--------------------------------------------------------------------------
    */
    const previousStatus =
      ticket.status;

    /*
    |--------------------------------------------------------------------------
    | Update ticket status
    |--------------------------------------------------------------------------
    */
    ticket.status = status;

    /*
    |--------------------------------------------------------------------------
    | RESOLVED / CLOSED
    |--------------------------------------------------------------------------
    */
    if (
      status === "Resolved" ||
      status === "Closed"
    ) {
      /*
      |--------------------------------------------------------------------------
      | Save solved time only if not already solved.
      |--------------------------------------------------------------------------
      */
      if (!ticket.solvedAt) {
        ticket.solvedAt =
          new Date();
      }

      /*
      |--------------------------------------------------------------------------
      | Save the admin who solved the ticket.
      |--------------------------------------------------------------------------
      */
      ticket.solvedBy =
        req.user._id;
    } else {
      /*
      |--------------------------------------------------------------------------
      | Reopened ticket
      |--------------------------------------------------------------------------
      |
      | If admin changes:
      |
      |   Resolved → Open
      |   Resolved → In Progress
      |   Closed → Open
      |   Closed → In Progress
      |
      | clear solved information.
      |--------------------------------------------------------------------------
      */
      ticket.solvedAt = null;

      ticket.solvedBy = null;
    }

    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */
    await ticket.save();

    /*
    |--------------------------------------------------------------------------
    | NOTIFY EMPLOYEE
    |--------------------------------------------------------------------------
    |
    | Only notify when the ticket actually transitions
    | into Resolved or Closed.
    |
    | This prevents duplicate notifications.
    |--------------------------------------------------------------------------
    */
    const becameResolved =
      (
        status === "Resolved" ||
        status === "Closed"
      ) &&
      previousStatus !== status;

    if (becameResolved) {
      try {
        const admin =
          await User.findById(
            req.user._id
          ).select("name");

        const adminName =
          admin?.name ||
          "Administrator";

        await Notification.create({
          recipient:
            ticket.createdBy,

          title:
            "Ticket Resolved",

          message:
            `Your ticket "${ticket.concern}" has been ${status.toLowerCase()} by ${adminName}.`,

          type:
            "ticket",

          relatedId:
            ticket._id,

          isRead: false,
        });
      } catch (notificationError) {
        /*
        |--------------------------------------------------------------------------
        | Notification failure should not fail the status update.
        |--------------------------------------------------------------------------
        */
        console.error(
          "TICKET RESOLUTION NOTIFICATION ERROR:",
          notificationError
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Return updated ticket
    |--------------------------------------------------------------------------
    */
    const updatedTicket =
      await Ticket.findById(
        ticket._id
      )
        .populate(
          "createdBy",
          "name email position role"
        )
        .populate(
          "solvedBy",
          "name"
        );

    return res.status(200).json({
      success: true,

      message:
        `Ticket marked as ${status}.`,

      ticket: updatedTicket,
    });
  } catch (error) {
    console.error(
      "UPDATE TICKET STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while updating ticket status.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE TICKET
|--------------------------------------------------------------------------
| ADMIN ONLY
|
| Deletes the ticket and sends a notification to the
| employee who created it.
|--------------------------------------------------------------------------
*/
export const deleteTicket = async (req, res) => {
  try {
    /*
    |--------------------------------------------------------------------------
    | ADMIN CHECK
    |--------------------------------------------------------------------------
    */
    if (!isAdminUser(req)) {
      return res.status(403).json({
        success: false,
        message:
          "Only administrators can delete tickets.",
      });
    }

    const { id } = req.params;

    /*
    |--------------------------------------------------------------------------
    | Validate ID
    |--------------------------------------------------------------------------
    */
    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find ticket first
    |--------------------------------------------------------------------------
    | We need createdBy and concern before deleting
    | so we can send the notification.
    |--------------------------------------------------------------------------
    */
    const ticket =
      await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Delete ticket
    |--------------------------------------------------------------------------
    */
    await Ticket.findByIdAndDelete(id);

    /*
    |--------------------------------------------------------------------------
    | Notify employee
    |--------------------------------------------------------------------------
    */
    try {
      const admin =
        await User.findById(
          req.user._id
        ).select("name");

      const adminName =
        admin?.name ||
        "Administrator";

      await Notification.create({
        recipient:
          ticket.createdBy,

        title:
          "Ticket Deleted",

        message:
          `Your ticket "${ticket.concern}" was deleted by ${adminName}.`,

        type:
          "ticket",

        relatedId:
          ticket._id,

        isRead: false,
      });
    } catch (notificationError) {
      /*
      |--------------------------------------------------------------------------
      | Notification failure should not fail deletion.
      |--------------------------------------------------------------------------
      */
      console.error(
        "TICKET DELETE NOTIFICATION ERROR:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "Ticket deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE TICKET ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Server error while deleting ticket.",
    });
  }
};

