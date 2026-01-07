import { useState, useEffect } from 'react';
import api from '../utils/api';
import BackButton from '../components/BackButton';

export default function ProgramManagement() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | null
    const [formData, setFormData] = useState({
        name: '', description: '', difficulty: 'Beginner', exercises: []
    });

    // For Exercise Input in Modal
    const [exerciseInput, setExerciseInput] = useState({ name: '', sets: 3, reps: 10 });

    useEffect(() => {
        fetchPrograms();
    }, []);

    const fetchPrograms = async () => {
        try {
            const res = await api.get('/programs');
            setPrograms(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch programs", err);
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setFormData({ name: '', description: '', difficulty: 'Beginner', exercises: [] });
        setModalMode('create');
    };

    const handleOpenEdit = (program) => {
        // Pre-fill
        setFormData({
            id: program.id,
            name: program.name,
            description: program.description,
            difficulty: program.difficulty || 'Beginner',
            exercises: program.exercises ? program.exercises.map(e => ({
                name: e.name, sets: e.sets, reps: e.reps
            })) : []
        });
        setModalMode('edit');
    };

    const handleAddExercise = () => {
        if (!exerciseInput.name) return;
        setFormData({
            ...formData,
            exercises: [...formData.exercises, { ...exerciseInput }]
        });
        setExerciseInput({ name: '', sets: 3, reps: 10 });
    };

    const handleRemoveExercise = (index) => {
        const updated = [...formData.exercises];
        updated.splice(index, 1);
        setFormData({ ...formData, exercises: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('/programs', formData);
                alert("Program created!");
            } else if (modalMode === 'edit') {
                await api.put(`/programs/${formData.id}`, formData);
                alert("Program updated!");
            }
            fetchPrograms();
            setModalMode(null);
        } catch (err) {
            alert(err.response?.data?.error || "Operation failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This will remove the program permanently.")) return;
        try {
            await api.delete(`/programs/${id}`);
            fetchPrograms();
        } catch (err) {
            alert("Failed to delete program");
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <BackButton />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Program Management</h1>
                <button
                    onClick={handleOpenCreate}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow flex items-center gap-2"
                >
                    + Create New Program
                </button>
            </div>

            {/* Program List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map(p => (
                    <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{p.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
                                    p.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                }`}>
                                {p.difficulty || 'General'}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-4 flex-grow">{p.description}</p>

                        <div className="text-xs text-gray-400 mb-4 bg-gray-50 p-2 rounded">
                            {p.exercises && p.exercises.length > 0 ? (
                                <span>{p.exercises.length} Exercises (e.g., {p.exercises[0].name}...)</span>
                            ) : (
                                <span>No exercises</span>
                            )}
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => handleOpenEdit(p)}
                                className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-50 font-medium text-sm transition"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(p.id)}
                                className="flex-1 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded hover:bg-red-50 font-medium text-sm transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal - Create/Edit */}
            {modalMode && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">{modalMode === 'create' ? 'Create Program' : 'Edit Program'}</h2>
                            <button onClick={() => setModalMode(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                                    <input
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Strength 101"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                    <select
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-emerald-500 outline-none h-20"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of the program goal..."
                                />
                            </div>

                            <hr className="my-4" />

                            <div>
                                <h3 className="font-bold text-lg mb-2">Exercises</h3>

                                <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                                    <div className="grid grid-cols-12 gap-2 items-end">
                                        <div className="col-span-6">
                                            <label className="text-xs text-gray-500 block mb-1">Exercise Name</label>
                                            <input
                                                className="w-full border p-2 rounded text-sm"
                                                placeholder="e.g. Bench Press"
                                                value={exerciseInput.name}
                                                onChange={e => setExerciseInput({ ...exerciseInput, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-gray-500 block mb-1">Sets</label>
                                            <input
                                                type="number" className="w-full border p-2 rounded text-sm"
                                                value={exerciseInput.sets}
                                                onChange={e => setExerciseInput({ ...exerciseInput, sets: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-xs text-gray-500 block mb-1">Reps</label>
                                            <input
                                                type="number" className="w-full border p-2 rounded text-sm"
                                                value={exerciseInput.reps}
                                                onChange={e => setExerciseInput({ ...exerciseInput, reps: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <button
                                                type="button"
                                                onClick={handleAddExercise}
                                                className="w-full bg-gray-800 text-white p-2 rounded text-sm font-bold hover:bg-black transition"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Exercise List Table */}
                                {formData.exercises.length > 0 && (
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-100 text-gray-600">
                                                <tr>
                                                    <th className="p-2 pl-4">#</th>
                                                    <th className="p-2">Exercise</th>
                                                    <th className="p-2">Sets</th>
                                                    <th className="p-2">Reps</th>
                                                    <th className="p-2">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {formData.exercises.map((ex, idx) => (
                                                    <tr key={idx} className="bg-white">
                                                        <td className="p-2 pl-4 text-gray-400">{idx + 1}</td>
                                                        <td className="p-2 font-medium">{ex.name}</td>
                                                        <td className="p-2">{ex.sets}</td>
                                                        <td className="p-2">{ex.reps}</td>
                                                        <td className="p-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveExercise(idx)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setModalMode(null)}
                                    className="px-5 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30"
                                >
                                    {modalMode === 'create' ? 'Create Program' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
