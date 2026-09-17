import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";

import User from "../models/User.js";

// =========================================================
// HELPERS
// =========================================================

const isAdminUser = (req) => {
  return (
    String(req.user?.role || "").toLowerCase() ===
    "admin"
  );
};

const isEmployeeUser = (req) => {
  return (
    String(req.user?.role || "").toLowerCase() ===
    "employee"
  );
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =========================================================
// GET ALL USERS
// GET /api/users
// =========================================================

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "GET USERS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while fetching users.",
    });
  }
};

// =========================================================
// GET SINGLE USER
// GET /api/users/:id
// =========================================================

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "GET USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while fetching user.",
    });
  }
};

// =========================================================
// UPDATE USER
// PUT /api/users/:id
// =========================================================

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const requesterId = String(
      req.user?._id || ""
    );

    const targetUserId = String(
      targetUser._id
    );

    const requesterIsAdmin =
      isAdminUser(req);

    const requesterIsEmployee =
      isEmployeeUser(req);

    // -----------------------------------------------------
    // PERMISSION CHECK
    // -----------------------------------------------------

    if (
      !requesterIsAdmin &&
      requesterId !== targetUserId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to update this user.",
      });
    }

    const {
      name,
      email,
      address,
      position,
      role,
    } = req.body;

    // -----------------------------------------------------
    // VALIDATE NAME
    // -----------------------------------------------------

    if (
      name !== undefined &&
      !String(name).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    // -----------------------------------------------------
    // VALIDATE EMAIL
    // -----------------------------------------------------

    if (
      email !== undefined &&
      !String(email).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // -----------------------------------------------------
    // EMAIL DUPLICATE CHECK
    // -----------------------------------------------------

    if (email !== undefined) {
      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const existingUser =
        await User.findOne({
          email: normalizedEmail,
          _id: {
            $ne: targetUser._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "Email address is already in use.",
        });
      }

      targetUser.email =
        normalizedEmail;
    }

    // -----------------------------------------------------
    // NAME
    // -----------------------------------------------------

    if (name !== undefined) {
      targetUser.name =
        String(name).trim();
    }

    // -----------------------------------------------------
    // ADDRESS
    // -----------------------------------------------------

    if (address !== undefined) {
      targetUser.address =
        String(address).trim();
    }

    // -----------------------------------------------------
    // EMPLOYEE RESTRICTIONS
    // -----------------------------------------------------
    //
    // Employee can update:
    // - Name
    // - Email
    // - Address
    //
    // Employee CANNOT update:
    // - Position
    // - Role
    //
    // -----------------------------------------------------

    if (requesterIsEmployee) {
      if (
        position !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Employees cannot change their position. Please contact an administrator.",
        });
      }

      if (
        role !== undefined
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Employees cannot change their role. Please contact an administrator.",
        });
      }
    }

    // -----------------------------------------------------
    // ADMIN CAN UPDATE POSITION
    // -----------------------------------------------------

    if (
      requesterIsAdmin &&
      position !== undefined
    ) {
      if (!String(position).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Position is required.",
        });
      }

      targetUser.position =
        String(position).trim();
    }

    // -----------------------------------------------------
    // ADMIN CAN UPDATE ROLE
    // -----------------------------------------------------

    if (
      requesterIsAdmin &&
      role !== undefined
    ) {
      const normalizedRole =
        String(role)
          .trim()
          .toLowerCase();

      const allowedRoles = [
        "admin",
        "employee",
      ];

      if (
        !allowedRoles.includes(
          normalizedRole
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid role. Role must be admin or employee.",
        });
      }

      targetUser.role =
        normalizedRole;
    }

    // -----------------------------------------------------
    // PROFILE IMAGE
    // -----------------------------------------------------

    if (req.file) {
      targetUser.profileImage =
        `/uploads/profiles/${req.file.filename}`;
    }

    // -----------------------------------------------------
    // SAVE USER
    // -----------------------------------------------------

    await targetUser.save();

    // -----------------------------------------------------
    // FETCH UPDATED USER
    // -----------------------------------------------------

    const updatedUser =
      await User.findById(
        targetUser._id
      ).select("-password");

    return res.status(200).json({
      success: true,
      message:
        "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error(
      "UPDATE USER ERROR:",
      error
    );

    // Duplicate MongoDB unique index error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email address is already in use.",
      });
    }

    // Mongoose validation error
    if (
      error.name ===
      "ValidationError"
    ) {
      const validationMessages =
        Object.values(error.errors)
          .map(
            (item) =>
              item.message
          )
          .join(", ");

      return res.status(400).json({
        success: false,
        message:
          validationMessages ||
          "Invalid user information.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while updating user.",
    });
  }
};

// =========================================================
// DELETE USER
// DELETE /api/users/:id
// =========================================================

export const deleteUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(
      id
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // -----------------------------------------------------
    // PREVENT ADMIN FROM DELETING THEMSELVES
    // -----------------------------------------------------

    if (
      String(req.user?._id) ===
      String(user._id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account.",
      });
    }

    await User.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE USER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while deleting user.",
    });
  }
};

// =========================================================
// CHANGE OWN PASSWORD
// PUT /api/users/change-password
// =========================================================

export const changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is required.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password is required.",
      });
    }

    if (
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Confirm password is required.",
      });
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match.",
      });
    }

    if (
      newPassword.length < 6
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters.",
      });
    }

    // -----------------------------------------------------
    // FIND CURRENT USER
    // -----------------------------------------------------

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User account not found.",
      });
    }

    // -----------------------------------------------------
    // CHECK CURRENT PASSWORD
    // -----------------------------------------------------

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    // -----------------------------------------------------
    // PREVENT SAME PASSWORD
    // -----------------------------------------------------

    const samePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password.",
      });
    }

    // -----------------------------------------------------
    // HASH NEW PASSWORD
    // -----------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    // If your User model has mustChangePassword,
    // changing the password manually completes the requirement.
    if (
      Object.prototype.hasOwnProperty.call(
        user,
        "mustChangePassword"
      )
    ) {
      user.mustChangePassword =
        false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while changing password.",
    });
  }
};

// =========================================================
// ADMIN RESET USER PASSWORD
// POST /api/users/:id/reset-password
// =========================================================

export const resetUserPassword = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    // -----------------------------------------------------
    // GENERATE TEMPORARY PASSWORD
    // -----------------------------------------------------

    let temporaryPassword = "";

    while (
      temporaryPassword.length <
      10
    ) {
      temporaryPassword =
        randomBytes(8)
          .toString("base64")
          .replace(
            /[^a-zA-Z0-9]/g,
            ""
          );
    }

    temporaryPassword =
      temporaryPassword.substring(
        0,
        10
      );

    // -----------------------------------------------------
    // HASH TEMPORARY PASSWORD
    // -----------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        temporaryPassword,
        10
      );

    user.password =
      hashedPassword;

    // If your User model contains this field,
    // force the employee to change the temporary password.
    if (
      Object.prototype.hasOwnProperty.call(
        user,
        "mustChangePassword"
      )
    ) {
      user.mustChangePassword =
        true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully.",
      temporaryPassword,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      "RESET USER PASSWORD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Server error while resetting password.",
    });
  }
};