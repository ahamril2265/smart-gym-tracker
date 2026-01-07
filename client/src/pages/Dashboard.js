import { useEffect, useState } from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [program, setProgram] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {


        // Fetch Profile FIRST as it is critical
        let profile = null;
        try {
          const profileRes = await api.get("/user/profile");
          profile = profileRes.data;
          setUser(profile);
        } catch (e) {
          console.error("Profile fetch failed", e);
        }

        if (profile) {
          // Fetch other data in parallel, but don't break if they fail
          const [programRes, workoutRes] = await Promise.allSettled([
            api.get("/programs/mine"),
            api.get("/workouts")
          ]);

          if (programRes.status === 'fulfilled') {
            const myProg = Array.isArray(programRes.value.data.programs)
              ? programRes.value.data.programs[0] // handle new structure { programs: [...] }
              : (Array.isArray(programRes.value.data) ? programRes.value.data[0] : programRes.value.data);
            setProgram(myProg);
          }

          if (workoutRes.status === 'fulfilled') {
            setRecentWorkouts(workoutRes.value.data.slice(0, 5));
          }

          // Fetch Attendance
          api.get(`/attendance/history/${profile.id}`)
            .then(res => setAttendance(res.data))
            .catch(e => console.warn("Attendance fetch error", e));
        }

        setLoading(false);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;

  const lastVisit = attendance.length > 0 ? new Date(attendance[0].check_in_time).toLocaleDateString() : "Never";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.username || "Athlete"}!</h1>
          <p className="mt-2 opacity-90">Ready to crush your goals today?</p>
        </div>
        <div className="mt-4 md:mt-0 text-right bg-white/20 p-4 rounded-xl backdrop-blur-sm">
          <p className="text-sm font-semibold uppercase tracking-wider opacity-80">Member ID</p>
          <p className="text-2xl font-mono font-bold tracking-widest">{user?.member_id || "PENDING"}</p>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Program */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500 hover:shadow-lg transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase">Current Program</h3>
              <p className="text-2xl font-bold mt-1 text-gray-800">{program ? program.name : "None Assigned"}</p>
            </div>
            <span className="text-3xl">🏋️</span>
          </div>
          {program ? (
            <p className="mt-4 text-sm text-gray-600 line-clamp-2">{program.description || "Stay consistent!"}</p>
          ) : (
            <p className="mt-4 text-sm text-gray-500">Ask your trainer to assign one.</p>
          )}
          <Link to="/my-program" className="mt-4 inline-block text-purple-600 font-semibold text-sm hover:underline">
            View Routine →
          </Link>
        </div>

        {/* Attendance */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase">Last Visit</h3>
              <p className="text-2xl font-bold mt-1 text-gray-800">{lastVisit}</p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
          <p className="mt-4 text-sm text-gray-600">Total Check-ins: <span className="font-bold">{attendance.length}</span></p>
          <Link to="/profile" className="mt-4 inline-block text-green-600 font-semibold text-sm hover:underline">
            Show QR Code →
          </Link>
        </div>

        {/* Nutrition / Progress Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500 hover:shadow-lg transition">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm font-semibold uppercase">Goal Status</h3>
              <p className="text-2xl font-bold mt-1 text-gray-800 capitalize">{user?.goal || "Maintenance"}</p>
            </div>
            <span className="text-3xl">🎯</span>
          </div>
          <p className="mt-4 text-sm text-gray-600">Weight: <span className="font-bold">{user?.weight || "-"} kg</span></p>
          <Link to="/progress" className="mt-4 inline-block text-orange-600 font-semibold text-sm hover:underline">
            Track Progress →
          </Link>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Recent Workouts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
            <Link to="/log-workout" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition">
              + Log Workout
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {recentWorkouts.length === 0 ? (
              <div className="p-10 text-center text-gray-500">
                <p>No workouts logged yet.</p>
                <p className="text-sm mt-2">Start tracking to see your history here!</p>
              </div>
            ) : (
              <div className="divide-y">
                {recentWorkouts.map((w) => (
                  <div key={w.id} className="p-4 hover:bg-gray-50 flex justify-between items-center transition">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {w.exercise.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{w.exercise}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(w.date).toLocaleDateString()} at {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-gray-700">{w.sets} x {w.reps}</p>
                      {w.weight && <p className="text-xs text-gray-400">{w.weight} kg</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {recentWorkouts.length > 0 && (
              <Link to="/workouts" className="block p-3 text-center text-blue-600 font-semibold bg-gray-50 hover:bg-blue-50 transition border-t">
                View All History
              </Link>
            )}
          </div>
        </div>

        {/* Right Col: Quick Actions / Menu */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/program-creator" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4 border border-gray-100">
              <div className="bg-purple-100 p-3 rounded-lg text-purple-600 text-xl">📝</div>
              <div>
                <p className="font-bold text-gray-800">My Programs</p>
                <p className="text-xs text-gray-500">View assigned routines</p>
              </div>
            </Link>
            <Link to="/nutrition" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4 border border-gray-100">
              <div className="bg-green-100 p-3 rounded-lg text-green-600 text-xl">🥗</div>
              <div>
                <p className="font-bold text-gray-800">Nutrition Log</p>
                <p className="text-xs text-gray-500">Track your meals</p>
              </div>
            </Link>
            <Link to="/friends" className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center gap-4 border border-gray-100">
              <div className="bg-pink-100 p-3 rounded-lg text-pink-600 text-xl">👥</div>
              <div>
                <p className="font-bold text-gray-800">Friends</p>
                <p className="text-xs text-gray-500">Connect with others</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
