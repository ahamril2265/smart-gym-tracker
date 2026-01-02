import { useState } from "react";
import api from "../utils/api";
import BackButton from "../components/BackButton";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate

export default function ProgramCreator() {
    const navigate = useNavigate();
    const [program, setProgram] = useState({
        name: "",
        description: "",
        difficulty: "Beginner"
    });
    const [exercises, setExercises] = useState([
        { name: "", sets: 3, reps: 10 } // Initial empty exercise
    ]);

    const token = localStorage.getItem("token");

    const handleProgramChange = (e) => {
        setProgram({ ...program, [e.target.name]: e.target.value });
    };

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: "", sets: 3, reps: 10 }]);
    };

    const removeExercise = (index) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        setExercises(newExercises);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/programs", {
                ...program,
                exercises
            });
            alert("Program Created Successfully!");
            // Reset or Redirect
            navigate('/trainer'); // Redirect to trainer dashboard
        } catch (err) {
            console.error(err);
            alert("Failed to create program");
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto">
            <BackButton />
            <h1 className="text-3xl font-bold mb-8">Create New Program</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Program Details */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Program Details</h2>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Name</label>
                            <input
                                name="name"
                                value={program.name}
                                onChange={handleProgramChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={program.description}
                                onChange={handleProgramChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                rows="3"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                            <select
                                name="difficulty"
                                value={program.difficulty}
                                onChange={handleProgramChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option>Beginner</option>
                                <option>Intermediate</option>
                                <option>Advanced</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Exercises */}
                <div className="bg-white p-6 rounded shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Exercises</h2>
                        <button type="button" onClick={addExercise} className="text-blue-600 hover:text-blue-800 font-medium">
                            + Add Exercise
                        </button>
                    </div>

                    {exercises.map((ex, index) => (
                        <div key={index} className="flex gap-4 items-end mb-4 border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex-grow">
                                <label className="block text-xs text-gray-500">Exercise Name</label>
                                <input
                                    value={ex.name}
                                    onChange={(e) => handleExerciseChange(index, "name", e.target.value)}
                                    className="block w-full border rounded p-2"
                                    placeholder="e.g. Bench Press"
                                    required
                                />
                            </div>
                            <div className="w-20">
                                <label className="block text-xs text-gray-500">Sets</label>
                                <input
                                    type="number"
                                    value={ex.sets}
                                    onChange={(e) => handleExerciseChange(index, "sets", parseInt(e.target.value))}
                                    className="block w-full border rounded p-2"
                                />
                            </div>
                            <div className="w-20">
                                <label className="block text-xs text-gray-500">Reps</label>
                                <input
                                    type="number"
                                    value={ex.reps}
                                    onChange={(e) => handleExerciseChange(index, "reps", parseInt(e.target.value))}
                                    className="block w-full border rounded p-2"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeExercise(index)}
                                className="text-red-500 hover:text-red-700 font-bold px-2 py-2"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                    Save Program
                </button>
            </form>
        </div>
    );
}
