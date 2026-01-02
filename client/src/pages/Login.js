import { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Clear token if user visits login page directly to ensure clean state
    const token = localStorage.getItem("token");
    if (token) {
      // Optional: you could redirect to dashboard if already logged in
      // but user asked to fix "logout button visible" issue, implying they want to be logged out.
      // So we clear it.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
    }
  }, [setToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);

      // Store user role/info if provided
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      setToken(res.data.token);

      // Role based redirect could be done here, but dashboard handles general
      if (res.data.user?.role === 'admin') navigate("/admin");
      else if (res.data.user?.role === 'trainer') navigate("/trainer");
      else navigate("/dashboard");

    } catch (err) {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm mb-6 text-center">
          <span className="text-4xl">💪</span>
          <h2 className="mt-4 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
            <div className="mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium leading-6 text-gray-900">Password</label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">Forgot password?</a>
              </div>
            </div>
            <div className="mt-2">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Not a member?{' '}
          <Link to="/signup" className="font-semibold leading-6 text-blue-600 hover:text-blue-500">
            Start a 14 day free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
