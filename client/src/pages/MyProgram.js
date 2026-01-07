import { useEffect, useState } from 'react';
import api from "../utils/api";
import { Link } from 'react-router-dom';
import BackButton from "../components/BackButton";

export default function MyProgram() {
  const [programs, setPrograms] = useState([]); // User's assigned programs
  const [allPrograms, setAllPrograms] = useState([]); // All available programs for selection
  const [loading, setLoading] = useState(true);

  // Manage Modal State
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [manageData, setManageData] = useState({
    programId: '',
    days: []
  });
  const [errors, setErrors] = useState('');

  const fetchMyPrograms = async () => {
    try {
      const res = await api.get('/programs/mine');
      setPrograms(res.data.programs || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPrograms();
  }, []);

  const handleOpenManage = async () => {
    try {
      setErrors('');
      const res = await api.get('/programs'); // Fetch all programs
      setAllPrograms(res.data);
      setManageData({ programId: '', days: [] });
      setIsManageOpen(true);
    } catch (e) {
      alert("Failed to load programs");
    }
  };

  const handleSelfAssign = async () => {
    if (!manageData.programId) return setErrors('Please select a program');
    try {
      await api.post('/programs/self-assign', {
        programId: manageData.programId,
        days: manageData.days
      });
      alert("Program updated successfully!");
      fetchMyPrograms(); // Refresh view
      setManageData({ programId: '', days: [] }); // Reset form
    } catch (e) {
      alert("Failed to assign program: " + (e.response?.data?.error || e.message));
    }
  };

  const handleSelfRemove = async (programId) => {
    if (!window.confirm("Remove this program from your schedule?")) return;
    try {
      await api.post('/programs/self-unassign', { programId });
      fetchMyPrograms();
    } catch (e) {
      alert("Failed to remove program");
    }
  };


  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getProgramsForDay = (day) => {
    return programs.filter(p => p.schedule && p.schedule.includes(day));
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <BackButton />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Weekly Schedule</h1>
        <button
          onClick={handleOpenManage}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow font-bold text-sm"
        >
          Manage My Programs
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center mb-10">
          <p className="text-gray-500 mb-4">You don't have any programs assigned yet.</p>
          <button
            onClick={handleOpenManage}
            className="text-indigo-600 font-bold hover:underline"
          >
            Start a Program Now
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-7 gap-4 mb-12">
          {daysOfWeek.map(day => {
            const dayPrograms = getProgramsForDay(day);
            const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

            return (
              <div key={day} className={`border rounded-lg p-4 ${isToday ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'bg-white'}`}>
                <h3 className={`font-bold mb-3 ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>{day}</h3>

                {dayPrograms.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Rest Day</p>
                ) : (
                  <div className="space-y-3">
                    {dayPrograms.map(p => (
                      <div key={p.id} className="bg-white p-2 rounded border border-gray-200 shadow-sm text-sm">
                        <div className="font-bold text-emerald-700 mb-1">{p.name}</div>
                        <ul className="space-y-1">
                          {p.exercises && p.exercises.map(e => (
                            <li key={e.id} className="text-xs text-gray-600 flex justify-between">
                              <span>{e.name}</span>
                              <span className="font-mono">{e.sets}x{e.reps}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {isToday && dayPrograms.length > 0 && (
                  <Link to="/log-workout" className="block mt-4 text-center bg-blue-600 text-white text-xs py-2 rounded hover:bg-blue-700">
                    Log Workout
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {programs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">All Assigned Programs</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {programs.map(p => (
              <div key={p.id} className="border p-5 rounded-xl shadow-sm bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{p.difficulty}</span>
                </div>
                <p className="text-sm mb-4 text-gray-600">{p.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">Schedule</p>
                  <div className="flex gap-1 flex-wrap">
                    {p.schedule && p.schedule.length > 0 ? p.schedule.map(d => (
                      <span key={d} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded font-medium border border-indigo-100">
                        {d.substring(0, 3)}
                      </span>
                    )) : <span className="text-xs text-gray-400 italic">Not scheduled</span>}
                  </div>
                </div>

                <div className="border-t pt-3 mt-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setManageData({ programId: p.id, days: p.schedule || [] });
                        setIsManageOpen(true);
                        // If needed, fetchAllPrograms if not already loaded, but handleOpenManage usually does it.
                        // Let's just open manage modal pre-filled, but we need dropdown options.
                        if (allPrograms.length === 0) api.get('/programs').then(r => setAllPrograms(r.data));
                      }}
                      className="flex-1 text-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded font-bold"
                    >
                      Edit Schedule
                    </button>
                    <button
                      onClick={() => handleSelfRemove(p.id)}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm rounded font-bold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manage Modal */}
      {isManageOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manage My Programs</h2>
              <button onClick={() => setIsManageOpen(false)} className="text-gray-400 hover:text-black text-2xl">&times;</button>
            </div>

            <div className="space-y-6">
              {/* Program Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Choose Program</label>
                <select
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-indigo-500 outline-none"
                  value={manageData.programId}
                  onChange={e => setManageData({ ...manageData, programId: parseInt(e.target.value) })}
                >
                  <option value="">-- Select a Program --</option>
                  {allPrograms.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.difficulty})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select a program to add it or update its schedule.</p>
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Weekly Schedule</label>
                <div className="grid grid-cols-4 gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        const current = manageData.days || [];
                        const newDays = current.includes(day)
                          ? current.filter(d => d !== day)
                          : [...current, day];
                        setManageData({ ...manageData, days: newDays });
                      }}
                      className={`text-xs py-2 px-1 rounded border transition font-medium ${(manageData.days || []).includes(day)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {errors && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
                  {errors}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleSelfAssign}
                  className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 shadow-lg transition"
                >
                  Save to Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
