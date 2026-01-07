import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined" && token !== "null";

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch (e) {
    console.error("Failed to parse user", e);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl filter drop-shadow-sm group-hover:scale-110 transition-transform">💪</span>
            <span className="font-extrabold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              SmartGym
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-medium transition duration-200">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 transition duration-200"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium transition duration-200">
                  Dashboard
                </Link>

                {/* Dynamic Links Based on Role */}
                <div className="hidden md:flex gap-6 items-center">
                  {user.role === 'admin' && (
                    <>
                      <Link to="/admin" className="font-medium text-amber-600 hover:text-amber-800 transition">Admin Dashboard</Link>
                      <Link to="/trainer-management" className="font-medium text-amber-600 hover:text-amber-800 transition">Trainer Management</Link>
                      {/* Admin Notifications/Plans are inside dashboard, but could link if separate routes existed */}
                    </>
                  )}

                  {user.role === 'trainer' && (
                    <>
                      <Link to="/trainer" className="font-medium text-emerald-600 hover:text-emerald-800 transition">Trainer Dashboard</Link>
                      <Link to="/program-management" className="font-medium text-emerald-600 hover:text-emerald-800 transition">Manage Programs</Link>
                    </>
                  )}

                  {user.role === 'client' && (
                    <>
                      <Link to="/my-program" className="font-medium text-gray-600 hover:text-blue-600 transition">My Program</Link>
                      <Link to="/workouts" className="font-medium text-gray-600 hover:text-blue-600 transition">History</Link>
                      <Link to="/log-workout" className="font-medium text-gray-600 hover:text-blue-600 transition">Log Workout</Link>
                    </>
                  )}
                </div>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                {/* Profile Link with Avatar if available */}
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden">
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 font-medium transition text-sm"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
