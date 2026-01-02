import { useState, useEffect } from "react";
import axios from "axios";
import BackButton from "../components/BackButton";

export default function TrainerDashboard() {
    const [clients, setClients] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "", email: "", password: ""
    });

    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            const clientsRes = await axios.get("http://localhost:5001/api/trainer/clients", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const programsRes = await axios.get("http://localhost:5001/api/programs", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClients(clientsRes.data);
            setPrograms(programsRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch dashboard data");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const handleAssignProgram = async (userId, programId) => {
        if (!programId) return;
        try {
            await axios.post(
                "http://localhost:5001/api/trainer/assign-program",
                { userId, programId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Program assigned!");
        } catch (err) {
            alert("Failed to assign program");
        }
    };

    // Create new client assigned to me
    const handleAddClient = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:5001/api/trainer/clients",
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
            await axios.delete(`http://localhost:5001/api/trainer/clients/${clientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchData();
        } catch (err) {
            alert("Failed to unassign client");
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="p-10 max-w-6xl mx-auto">
            <BackButton />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Trainer Dashboard</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add New Client
                </button>
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
                                            <select
                                                className="border p-2 rounded w-full text-sm"
                                                onChange={(e) => handleAssignProgram(client.id, parseInt(e.target.value))}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select Program</option>
                                                {programs.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleUnassign(client.id)}
                                                className="text-red-500 text-xs hover:underline text-left pl-1"
                                            >
                                                Remove Client
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
        </div>
    );
}
