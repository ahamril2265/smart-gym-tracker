import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import BackButton from "../components/BackButton";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({
        username: "", email: "", password: "", role: "user",
        membership_type: "basic", membership_status: "active"
    });

    const token = localStorage.getItem("token");

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get("/admin/users");
            const statsRes = await api.get("/admin/stats");
            setUsers(res.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch admin data");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle Form Input Change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Open Modal for Create or Edit
    const openModal = (user = null) => {
        if (user) {
            setEditUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: "", // Leave blank if not changing
                role: user.role,
                membership_type: user.membership_type || "one_day",
                membership_status: user.membership_status || "active",
                total_amount: user.total_amount,
                amount_paid: user.amount_paid,
                start_date: user.start_date
            });
        } else {
            setEditUser(null);
            setFormData({
                username: "", email: "", password: "", role: "user",
                membership_type: "one_day", membership_status: "active",
                total_amount: "", amount_paid: "", start_date: new Date().toISOString().split('T')[0]
            });
        }
        setIsModalOpen(true);
    };

    // Submit Form (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editUser) {
                // Update
                if (!formData.password) delete formData.password; // Don't send empty password
                await api.put(`/admin/users/${editUser.id}`, formData);
                alert("User updated successfully");
            } else {
                // Create
                await api.post("/admin/users", formData);
                alert("User created successfully");
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Operation failed");
        }
    };

    // Handle Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`/admin/users/${id}`);
            fetchUsers();
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const handleTrainerAssign = async (userId, trainerId) => {
        try {
            await api.put(`/admin/users/${userId}/trainer`, { trainerId: trainerId || null });
            fetchUsers();
        } catch (err) {
            alert("Failed to assign trainer");
        }
    };

    const trainers = users.filter((u) => u.role === "trainer");

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <BackButton />
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            if (!window.confirm("Send expiry reminders to all expired users?")) return;
                            try {
                                const res = await api.post("/admin/notify-expiry");
                                alert(res.data.message);
                            } catch (err) {
                                alert("Failed to send reminders");
                            }
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 shadow"
                    >
                        ✉ Send Expiry Reminders
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
                    >
                        + Create User
                    </button>
                </div>
            </div>

            {/* Statistics Section */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Trainers</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-3xl font-bold text-blue-600">{stats.trainers.total}</span>
                            <div className="text-sm text-gray-500 text-right">
                                <p><span className="text-green-600 font-bold">{stats.trainers.onDuty}</span> On Duty</p>
                                <p><span className="text-gray-400 font-bold">{stats.trainers.offDuty}</span> Off Duty</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Users & Memberships</h3>
                        <div className="flex justify-between items-center">
                            <span className="text-3xl font-bold text-green-600">{stats.users.total}</span>
                            <div className="text-sm text-gray-500 text-right">
                                <p><span className="text-green-600 font-bold">{stats.users.active}</span> Active</p>
                                <p><span className="text-red-400 font-bold">{stats.users.expired}</span> Expired</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Plan Distribution</h3>
                        <div className="space-y-1">
                            {/* Simplified stats for new plans */}
                            <div className="flex justify-between text-sm">
                                <span>Monthly</span>
                                <span className="font-bold">{stats.membership.monthly || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Yearly</span>
                                <span className="font-bold">{stats.membership.yearly || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Others</span>
                                <span className="font-bold">
                                    {(stats.users.total - (stats.membership.monthly || 0) - (stats.membership.yearly || 0)) || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">{editUser ? "Edit User" : "Create New User"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                name="username" value={formData.username} onChange={handleChange}
                                placeholder="Username" className="border p-2 w-full mb-2" required
                            />
                            <input
                                name="email" value={formData.email} onChange={handleChange}
                                placeholder="Email" className="border p-2 w-full mb-2" required
                            />

                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <label className="text-xs text-gray-500">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date ? formData.start_date.split('T')[0] : ''}
                                        onChange={handleChange}
                                        className="border p-2 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Total Amount</label>
                                    <input
                                        type="number"
                                        name="total_amount"
                                        placeholder="0.00"
                                        value={formData.total_amount || ''}
                                        onChange={handleChange}
                                        className="border p-2 w-full"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Amount Paid</label>
                                    <input
                                        type="number"
                                        name="amount_paid"
                                        placeholder="0.00"
                                        value={formData.amount_paid || ''}
                                        onChange={handleChange}
                                        className="border p-2 w-full"
                                    />
                                </div>
                            </div>

                            {/* Password removed - User sets it via activation link */}
                            <p className="text-xs text-gray-500 mb-2">User will receive an email to activate account and set password.</p>

                            <select name="role" value={formData.role} onChange={handleChange} className="border p-2 w-full mb-2">
                                <option value="user">User</option>
                                <option value="trainer">Trainer</option>
                                <option value="admin">Admin</option>
                            </select>

                            {formData.role === 'user' && (
                                <>
                                    <label className="text-xs text-gray-500">Membership Type</label>
                                    <select name="membership_type" value={formData.membership_type} onChange={handleChange} className="border p-2 w-full mb-2">
                                        <option value="one_day">One-Day Pass</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="tri_monthly">Tri-Monthly</option>
                                        <option value="half_yearly">Half-yearly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>

                                    {/* Membership Status is now auto-calculated */}
                                </>
                            )}

                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <h2 className="bg-gray-100 px-6 py-4 font-semibold border-b">
                    User Management
                </h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b">
                            <th className="p-4">Member ID</th>
                            <th className="p-4">Username</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Assigned Trainer</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-mono text-sm text-gray-600">{user.member_id || '-'}</td>
                                <td className="p-4">
                                    <div className="font-semibold">{user.username}</div>
                                    <div className="text-xs text-gray-500">
                                        {user.membership_type && (
                                            <span className="uppercase font-bold text-xs bg-gray-100 px-1 rounded">
                                                {user.membership_type.replace(/_/g, " ")}
                                            </span>
                                        )}
                                        {user.membership_status === 'expired' && <span className="text-red-500 ml-1">(Expired)</span>}
                                    </div>
                                </td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-800' :
                                        user.role === 'trainer' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {user.role === "user" ? (
                                        <select
                                            value={user.trainerId || ""}
                                            onChange={(e) =>
                                                handleTrainerAssign(user.id, parseInt(e.target.value))
                                            }
                                            className="border p-1 rounded w-full bg-white text-sm"
                                        >
                                            <option value="">-- No Trainer --</option>
                                            {trainers.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.username}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button
                                        onClick={() => openModal(user)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

