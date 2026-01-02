import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // Forces re-render on route change
  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined" && token !== "null";

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

                {/* Links Section */}
                <div className="hidden md:flex gap-4 items-center">
                  <Link to="/admin" className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full transition">
                    Admin Area
                  </Link>
                  <Link to="/trainer" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full transition">
                    Trainer Area
                  </Link>
                </div>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <Link to="/profile" className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-blue-50 text-xl border border-gray-200 transition text-gray-700">
                  👤
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
