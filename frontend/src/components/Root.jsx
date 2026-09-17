import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const Root = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else if (user.role === "employee") {
      navigate("/employee/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  return null;
};

export default Root;