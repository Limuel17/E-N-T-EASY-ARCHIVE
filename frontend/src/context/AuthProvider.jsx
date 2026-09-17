import { useState } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;
  });

  // ==============================
  // LOGIN
  // ==============================
  const login = (userData, token) => {
    setUser(userData);

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    localStorage.setItem("token", token);

    console.log("LOGIN USER:", userData);
    console.log("LOGIN TOKEN:", token);
  };

  // ==============================
  // LOGOUT
  // ==============================
  const logout = () => {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;