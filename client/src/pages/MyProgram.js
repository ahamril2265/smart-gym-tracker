import { useEffect, useState } from 'react';
import api from "../utils/api";
import { Link } from 'react-router-dom';
import BackButton from "../components/BackButton";

export default function MyProgram() {
  const [program, setProgram] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/programs/mine')
      .then(r => setProgram(r.data.program)).catch(e => console.error(e));
  }, []);

  if (!program) return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold">You have no program assigned</h2>
      <p className="mt-3">Browse programs to pick one: <Link to="/programs" className="text-blue-600 underline">Programs</Link></p>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-bold">{program.name}</h2>
      <p className="text-gray-600">{program.difficulty}</p>
      <p className="mt-2">{program.description}</p>
      <h3 className="mt-4 font-semibold">Exercises</h3>
      <ul className="mt-2 space-y-2">
        {program.exercises.map(e => (
          <li key={e.id} className="border p-3 rounded">
            <div className="flex justify-between">
              <div><strong>{e.name}</strong><div className="text-sm text-gray-600">{e.sets} x {e.reps}</div></div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <Link to="/log" className="bg-green-600 text-white px-4 py-2 rounded">Log Today's Workout</Link>
      </div>
    </div>
  );
}
