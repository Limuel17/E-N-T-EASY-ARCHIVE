
import { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      console.log(response.data);

      if (response.data.success) {
        await login(
          response.data.user,
          response.data.token
        );

        if (response.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/employee/dashboard");
        }
      } else {
        setError(
          response.data.error || "Invalid email or password"
        );
      }
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setError(
        error.response?.data?.error ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12 lg:px-8">
      <div className="w-full rounded-lg bg-white p-8 shadow-lg sm:max-w-sm">
        {/* Logo */}
        <div className="text-center">
          <img
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            alt="Your Company"
            className="mx-auto h-10 w-auto"
          />

          <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-black">
            Sign in to your account
          </h2>
        </div>

        {/* Form */}
        <div className="mt-10">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-black"
              >
                Email address
              </label>

              <div className="mt-2">
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setMail(e.target.value)}
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-black"
                >
                  Password
                </label>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="block w-full rounded-md bg-white px-3 py-2 text-base text-black outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-center text-sm text-red-500">
                {error}
              </p>
            )}

            {/* Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ color: "white" }}
                    />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

