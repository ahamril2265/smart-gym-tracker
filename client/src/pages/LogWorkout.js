import { useEffect, useState } from 'react';
import api from "../utils/api";
import BackButton from "../components/BackButton";

export default function LogWorkout() {
  const [program, setProgram] = useState(null);
  const [details, setDetails] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    api.get('/programs/mine')
      .then(r => {
        const p = r.data.program;
        setProgram(p);
        if (p?.exercises) {
          setDetails(p.exercises.map(e => ({
            exercise_name: e.name,
            sets_completed: e.sets,
            reps_completed: e.reps,
            weight: ''
          })));
        }
      }).catch(e => console.error(e));
  }, []);

  const updateDetail = (i, field, val) => {
    setDetails(prev => {
      const cp = [...prev];
      cp[i] = { ...cp[i], [field]: val };
      return cp;
    });
  };

  const submit = async () => {
    try {
      await api.post('/logs', { program_id: program?.id || null, details });
      alert('Workout logged');
      // Reset weights (but keep exercises)
      setDetails(details.map(d => ({ ...d, weight: '' })));
    } catch (err) { console.error(err); alert('Failed to log'); }
  };

  if (!program) return <div className="p-8">No program assigned. <a href="/programs" className="text-blue-600 underline">Pick one</a></div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Log Workout — {program.name}</h2>
      <div className="space-y-3">
        {details.map((d, i) => (
          <div key={i} className="border p-3 rounded flex items-center gap-3">
            <div className="flex-1">
              <div className="font-semibold">{d.exercise_name}</div>
              <div className="text-sm text-gray-600">Suggested: {d.sets_completed} x {d.reps_completed}</div>
            </div>
            <input className="border p-2 w-20" value={d.sets_completed} onChange={e => updateDetail(i, 'sets_completed', parseInt(e.target.value) || 0)} />
            <input className="border p-2 w-20" value={d.reps_completed} onChange={e => updateDetail(i, 'reps_completed', parseInt(e.target.value) || 0)} />
            <input className="border p-2 w-24" placeholder="kg" value={d.weight} onChange={e => updateDetail(i, 'weight', e.target.value)} />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submit}>Submit Log</button>
      </div>
    </div>
  );
}
