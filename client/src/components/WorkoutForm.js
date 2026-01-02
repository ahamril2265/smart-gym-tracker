import { useState } from "react";
import axios from "axios";

export default function WorkoutForm({ onAdd }) {
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const token = localStorage.getItem("token");

  const submit = async () => {
    if (!exercise || !sets || !reps) return alert("Please fill all fields");

    try {
      const res = await axios.post(
        "http://localhost:5001/api/workouts",
        { exercise, sets, reps, weight },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onAdd(res.data);
      setExercise("");
      setSets("");
      setReps("");
      setWeight("");
    } catch (err) {
      console.error(err);
      alert("Failed to add workout");
    }
  };

  return (
    <div className="border p-4 mb-4 rounded shadow-sm">
      <input
        className="border p-2 mr-2 mb-2 w-1/4"
        placeholder="Exercise"
        value={exercise}
        onChange={e => setExercise(e.target.value)}
      />
      <input
        className="border p-2 mr-2 mb-2 w-1/6"
        placeholder="Sets"
        value={sets}
        onChange={e => setSets(e.target.value)}
      />
      <input
        className="border p-2 mr-2 mb-2 w-1/6"
        placeholder="Reps"
        value={reps}
        onChange={e => setReps(e.target.value)}
      />
      <input
        className="border p-2 mr-2 mb-2 w-1/6"
        placeholder="Weight (kg)"
        value={weight}
        onChange={e => setWeight(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={submit}
      >
        Add Workout
      </button>
    </div>
  );
}
