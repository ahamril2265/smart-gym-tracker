import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

/** Turn camelCase or snake_case keys into human labels */
function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")   // camelCase -> spaces
    .replace(/[_-]/g, " ")        // snake_case/kebab -> spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()) // capitalize words
    .trim();
}

export default function Home() {
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const base = "http://localhost:5001/api";
        const res = await axios.get(`${base}/gym`);
        setGym(res.data);
      } catch (err) {
        console.error("Failed to fetch gym info:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGym();
  }, []);

  const equipment = gym?.equipment && typeof gym.equipment === "object" ? gym.equipment : {};

  const token = localStorage.getItem("token");
  const isAuthenticated = token && token !== "undefined" && token !== "null";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8 bg-white border-b border-gray-100 pb-20">
        <div className="mx-auto max-w-2xl text-center pt-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm px-4">
            {gym?.name || "Smart Gym"}
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {gym?.address || "Track your workouts, visualize your progress, and achieve your fitness goals."}
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/signup"
                  className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 hover:shadow-blue-500/30 transition transform hover:-translate-y-1"
                >
                  Start Your Journey
                </Link>
                <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition flex items-center gap-1">
                  Log in <span aria-hidden="true">&rarr;</span>
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 hover:shadow-blue-500/30 transition transform hover:-translate-y-1"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Gym Info Section */}
      <div className="py-20 flex-grow">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About Card */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>ℹ️</span> About Us
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                {gym?.description || gym?.about || "Welcome to the future of fitness tracking."}
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-1">⏰ Opening Hours</h3>
                  <p className="text-gray-600">{gym?.openingHours || gym?.hours || "24/7 Access"}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-1">💳 Memberships</h3>
                  <p className="text-gray-600">{gym?.membership || "Flexible Plans"}</p>
                </div>
              </div>
            </div>

            {/* Equipment Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 hover:shadow-md transition">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏋️‍♀️</span> Equipment
              </h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : Object.keys(equipment).length === 0 ? (
                <p className="text-gray-500 italic">No equipment listed yet.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(equipment).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700 font-medium">{formatLabel(key)}</span>
                      <span className="bg-white px-2 py-1 rounded shadow-sm text-sm font-bold text-blue-600">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
