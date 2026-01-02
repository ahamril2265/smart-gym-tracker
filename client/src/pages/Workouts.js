import { useEffect, useState } from "react";
import axios from "axios";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch workouts from backend
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await axios.get("http://localhost:5001/api/workouts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkouts(res.data);
      } catch (err) {
        console.error("Error fetching workouts:", err);
        alert("Failed to load workouts.");
      }
    };

    fetchWorkouts();
  }, [token]);

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Workouts</h2>

      {workouts.length === 0 ? (
        <p className="text-gray-500">No workouts found. Try adding some from Dashboard.</p>
      ) : (
        <ul className="space-y-2">
          {workouts.map((w) => (
            <li
              key={w.id}
              className="border p-4 rounded shadow-sm flex justify-between items-center bg-white"
            >
              <div>
                <p className="font-semibold text-lg">{w.exercise}</p>
                <p className="text-gray-600">
                  {w.sets} sets × {w.reps} reps{" "}
                  {w.weight ? `@ ${w.weight} kg` : ""}
                </p>
                <p className="text-gray-400 text-sm">
                  {new Date(w.date).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
