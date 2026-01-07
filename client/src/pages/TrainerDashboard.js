import { useState, useEffect } from "react";
import api from "../utils/api";
import BackButton from "../components/BackButton";

export default function TrainerDashboard() {
    const [clients, setClients] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "", email: "", password: ""
    });
    const [trainerProfile, setTrainerProfile] = useState(null);
    const [assignModalData, setAssignModalData] = useState(null); // { userId, username, programId, days: [] }
    const [errors, setErrors] = useState('');

    const fetchData = async () => {
        try {
            const [clientsRes, programsRes, profileRes] = await Promise.all([
                api.get("/trainer/clients"),
                api.get("/programs"),
                api.get("/user/profile")
            ]);

            setClients(clientsRes.data);
            setPrograms(programsRes.data);
            setTrainerProfile(profileRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch dashboard data");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // toggleStatus removed in favor of check-in/out logic

    // Helper: Fetch client programs
    const fetchClientPrograms = async (userId) => {
        try {
            const res = await api.get(`/trainer/client-programs/${userId}`);
            return res.data;
        } catch (err) {
            console.error(err);
            return [];
        }
    };

    const handleOpenManageModal = async (client) => {
        setErrors('');
        const programs = await fetchClientPrograms(client.id);
        setAssignModalData({
            userId: client.id,
            username: client.username,
            clientPrograms: programs,
            programId: '',
            days: []
        });
    };

    const handleRemoveAssignment = async (programId) => {
        if (!window.confirm("Unassign this program?")) return;
        try {
            await api.post("/trainer/unassign-program", {
                userId: assignModalData.userId,
                programId: programId
            });
            // Refresh list
            const updated = await fetchClientPrograms(assignModalData.userId);
            setAssignModalData(prev => ({ ...prev, clientPrograms: updated }));
        } catch (e) { alert("Failed to remove"); }
    };

    // Create new client assigned to me
    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            await api.post("/trainer/clients", formData);
            alert("Client created and assigned!");
            setIsModalOpen(false);
            setFormData({ username: "", email: "", password: "" });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create client");
        }
    };

    // Unassign client
    const handleUnassign = async (clientId) => {
        if (!window.confirm("Are you sure you want to remove this client? They will still have a user account but won't be assigned to you.")) return;
        try {
            await api.delete(`/trainer/clients/${clientId}`);
            fetchData();
        } catch (err) {
            alert("Failed to unassign client");
        }
    };


    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="p-10 max-w-6xl mx-auto">
            <BackButton />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Trainer Dashboard</h1>
                    {trainerProfile && (
                        <p className="text-gray-500 font-mono text-sm mt-1">
                            ID: <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{trainerProfile.member_id || "N/A"}</span>
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {trainerProfile && (
                        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <div className={`h-3 w-3 rounded-full flex-shrink-0 ${trainerProfile.trainerStatus === 'on_duty' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                {trainerProfile.trainerStatus === 'on_duty' ? 'On Duty' : 'Off Duty'}
                            </span>

                            {/* Check In / Out Buttons */}
                            {trainerProfile.trainerStatus !== 'on_duty' ? (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await api.post('/trainer/check-in');
                                            setTrainerProfile({ ...trainerProfile, trainerStatus: res.data.status });
                                        } catch (e) { }
                                    }}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700 transition whitespace-nowrap"
                                >
                                    Check In
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await api.post('/trainer/check-out');
                                            setTrainerProfile({ ...trainerProfile, trainerStatus: res.data.status });
                                        } catch (e) { }
                                    }}
                                    className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition whitespace-nowrap"
                                >
                                    Check Out
                                </button>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow whitespace-nowrap h-full"
                        style={{ height: '42px' }}
                    >
                        + Add New Client
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">Add New Client</h2>
                        <p className="text-sm text-gray-500 mb-4">Create a new user account. They will be automatically assigned to you.</p>
                        <form onSubmit={handleAddClient}>
                            <input
                                placeholder="Username" className="border p-2 w-full mb-2" required
                                value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                            <input
                                placeholder="Email" className="border p-2 w-full mb-2" required type="email"
                                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            <div className="mb-2">
                                <label className="text-xs text-gray-500">Start Date</label>
                                <input
                                    type="date"
                                    className="border p-2 w-full"
                                    value={formData.start_date || ''}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mb-2">Client will receive an email to activate account and set password.</p>

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* My Clients Section */}
                <div className="col-span-2 bg-white shadow rounded-lg overflow-hidden">
                    <h2 className="bg-blue-100 px-6 py-4 font-semibold border-b text-blue-800">
                        My Clients
                    </h2>
                    {clients.length === 0 ? (
                        <div className="p-6 text-gray-500">No clients assigned yet.</div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="p-4">Client</th>
                                    <th className="p-4">Membership</th>
                                    <th className="p-4">Assign Program</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client) => (
                                    <tr key={client.id} className="border-b">
                                        <td className="p-4">
                                            <div className="font-semibold">{client.username}</div>
                                            <div className="text-sm text-gray-500">{client.email}</div>
                                            <div className="text-xs text-gray-400">ID: {client.member_id}</div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${client.membershipType === 'vip' ? 'bg-purple-100 text-purple-700' :
                                                    client.membershipType === 'premium' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {client.membershipType}
                                                </span>
                                            </div>
                                            <div className={`text-xs mt-1 font-semibold ${client.membershipStatus === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                                {client.membershipStatus === 'active' ? 'Active' : 'Expired'}
                                            </div>
                                        </td>
                                        <td className="p-4 flex flex-col gap-2">
                                            {/* Open Modal Button instead of Direct Select */}
                                            <button
                                                onClick={() => handleOpenManageModal(client)}
                                                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-indigo-700 w-fit"
                                            >
                                                Manage Programs
                                            </button>

                                            <button
                                                onClick={() => handleUnassign(client.id)}
                                                className="text-red-500 text-xs hover:underline text-left pl-1 mt-1"
                                            >
                                                Unassign Client
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Quick Actions / Program Management Placeholder */}
                <div className="bg-white shadow rounded-lg p-6 h-fit">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <p className="text-gray-600 mb-4 text-sm">
                        Create new programs to help your clients achieve their goals.
                    </p>
                    <button
                        onClick={() => window.location.href = '/program-creator'}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mb-3 shadow transition"
                    >
                        + Create Workout Program
                    </button>
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 w-full shadow-sm transition">
                        View Client Progress
                    </button>
                </div>
            </div>

            {/* Manage Programs Modal */}
            {assignModalData && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold">Manage Programs</h2>
                                <p className="text-sm text-gray-500">For {assignModalData.username}</p>
                            </div>
                            <button onClick={() => setAssignModalData(null)} className="text-gray-400 hover:text-black">&times;</button>
                        </div>

                        {/* Currently Assigned List */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Current Assignments</h3>
                            {(!assignModalData.clientPrograms || assignModalData.clientPrograms.length === 0) ? (
                                <p className="text-sm text-gray-400 italic">No active program assignments.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {assignModalData.clientPrograms.map(p => (
                                        <li key={p.id} className="bg-white border rounded shadow-sm p-3 flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-indigo-900">{p.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {p.schedule && p.schedule.length > 0 ? (
                                                        <span className="flex gap-1 flex-wrap">
                                                            {p.schedule.map(d => <span key={d} className="bg-indigo-50 text-indigo-600 px-1.5 rounded">{d.substring(0, 3)}</span>)}
                                                        </span>
                                                    ) : <span>No specific days</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setAssignModalData(prev => ({
                                                        ...prev,
                                                        programId: p.id,
                                                        days: p.schedule || []
                                                    }))}
                                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveAssignment(p.id)}
                                                    className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <hr className="my-4 border-gray-100" />

                        {/* Assignment/Edit Form */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Assign / Update</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Program to Assign</label>
                                <select
                                    className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    value={assignModalData.programId}
                                    onChange={e => setAssignModalData({ ...assignModalData, programId: parseInt(e.target.value) })}
                                >
                                    <option value="">-- Choose Program --</option>
                                    {programs.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.difficulty})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Days (Cycle)</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                        <button
                                            key={day}
                                            onClick={() => {
                                                const current = assignModalData.days || [];
                                                const newDays = current.includes(day)
                                                    ? current.filter(d => d !== day)
                                                    : [...current, day];
                                                setAssignModalData({ ...assignModalData, days: newDays });
                                            }}
                                            className={`text-xs py-2 px-1 rounded border transition ${(assignModalData.days || []).includes(day)
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {errors && <p className="text-red-500 text-xs">{errors}</p>}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={async () => {
                                        if (!assignModalData.programId) return setErrors('Please select a program');
                                        try {
                                            await api.post("/trainer/assign-program", {
                                                userId: assignModalData.userId,
                                                programId: assignModalData.programId,
                                                days: assignModalData.days
                                            });
                                            alert("Program assigned/updated successfully!");
                                            // Refresh list inside modal
                                            const updated = await fetchClientPrograms(assignModalData.userId);
                                            setAssignModalData(prev => ({
                                                ...prev,
                                                clientPrograms: updated,
                                                programId: '',
                                                days: [] // Reset form
                                            }));
                                        } catch (e) {
                                            console.error("Assignment error:", e);
                                            alert("Assignment failed: " + (e.response?.data?.error || e.message));
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 shadow-md transition"
                                >
                                    Confirm Assignment / Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
