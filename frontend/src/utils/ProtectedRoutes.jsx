
import { Navigate } from "react-router";

import { useAuth } from "../context/AuthContext";

const ProtectedRoutes = ({
  children,
  requireRole = [],
}) => {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize user role
  const userRole = String(user.role || "").toLowerCase();

  // Normalize allowed roles
  const allowedRoles = requireRole.map((role) =>
    String(role).toLowerCase()
  );

  // User does not have permission
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorize" replace />;
  }

  return children;
};

export default ProtectedRoutes;

