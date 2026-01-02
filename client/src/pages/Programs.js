import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BackButton from "../components/BackButton";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5001/api/programs').then(r => setPrograms(r.data)).catch(e => console.error(e));
  }, []);

  const assign = async (id) => {
    try {
      await axios.post(`http://localhost:5001/api/programs/assign/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Program assigned. Go to My Program or Log Workout.');
    } catch (err) { console.error(err); alert('Failed to assign'); }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Workout Programs</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {programs.map(p => (
          <div key={p.id} className="border p-4 rounded shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.difficulty}</p>
              </div>
              <button className="text-sm bg-blue-500 text-white px-3 py-1 rounded" onClick={() => assign(p.id)}>Save</button>
            </div>
            <p className="mt-2 text-gray-700">{p.description}</p>
            <ul className="mt-3 space-y-1">
              {p.exercises && p.exercises.map(e => (
                <li key={e.id} className="text-sm text-gray-700">
                  • {e.name} — {e.sets} x {e.reps}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/myprogram" className="text-blue-600 underline">View My Program</Link>
      </div>
    </div>
  );
}
