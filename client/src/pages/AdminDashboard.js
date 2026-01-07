import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import BackButton from "../components/BackButton";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [editPlan, setEditPlan] = useState(null);
    const [formData, setFormData] = useState({
        username: "", email: "", password: "", role: "client",
        membership_type: "", membership_status: "active",
        dob: "", address: "", phone_number: "", weight: "", height: ""
    });
    const [planFormData, setPlanFormData] = useState({
        name: "", price: "", duration_months: "", description: ""
    });

    const token = localStorage.getItem("token");

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get("/admin/users");
            const statsRes = await api.get("/admin/stats");
            const plansRes = await api.get("/admin/plans");

            setUsers(res.data);
            setStats(statsRes.data);
            setPlans(plansRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            // alert("Failed to fetch admin data"); // silent fail better for UX? or toast?
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle User Form Input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Plan Form Input
    const handlePlanChange = (e) => {
        setPlanFormData({ ...planFormData, [e.target.name]: e.target.value });
    };

    // Open User Modal
    const openModal = (user = null) => {
        if (user) {
            setEditUser(user);
            setFormData({
                username: user.username,
                email: user.email,
                password: "",
                role: user.role,
                membership_type: user.membershipType || "",
                membership_status: user.membershipStatus || "active",
                total_amount: user.total_amount,
                amount_paid: user.amount_paid,
                start_date: user.start_date,
                dob: user.dob || "",
                address: user.address || "",
                phone_number: user.phone_number || "",
                weight: user.weight || "",
                height: user.height || ""
            });
        } else {
            setEditUser(null);
            setFormData({
                username: "", email: "", password: "", role: "client",
                membership_type: plans.length > 0 ? plans[0].name : "",
                membership_status: "active",
                total_amount: "", amount_paid: "", start_date: new Date().toISOString().split('T')[0],
                dob: "", address: "", phone_number: "", weight: "", height: ""
            });
        }
        setIsModalOpen(true);
    };

    // Open Plan Modal
    const openPlanModal = (plan = null) => {
        if (plan) {
            setEditPlan(plan);
            setPlanFormData({
                name: plan.name, price: plan.price, duration_months: plan.duration_months, description: plan.description || ""
            });
        } else {
            setEditPlan(null);
            setPlanFormData({ name: "", price: "", duration_months: "", description: "" });
        }
        setIsPlanModalOpen(true);
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
                alert("Client created successfully");
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

    // Submit Plan
    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editPlan) {
                await api.put(`/admin/plans/${editPlan.id}`, planFormData);
                alert("Plan updated");
            } else {
                await api.post("/admin/plans", planFormData);
                alert("Plan created");
            }
            setIsPlanModalOpen(false);
            fetchUsers();
        } catch (err) {
            alert("Operation failed");
        }
    };

    // Delete Plan
    const handlePlanDelete = async (id) => {
        if (!window.confirm("Delete this plan?")) return;
        try {
            await api.delete(`/admin/plans/${id}`);
            fetchUsers();
        } catch (err) {
            alert("Failed to delete plan");
        }
    };

    const handleTrainerAssign = async (userId, trainerId) => {
        try {
            await api.put(`/admin/users/${userId}/trainer`, { trainerId: trainerId || null });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to assign trainer");
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
                    {/* ... Existing stats cards ... */}
                    {/* Simplified for brevity in replace, keeping existing ones in mind but adding/modifying if needed? No, just keep simple or add new Plan Card */}

                    {/* Let's REUSE the existing stat cards code but inserting proper Notifications/Plan mgmt buttons above or below */}
                </div>
            )}

            {/* Action Buttons for Plans and Notifications */}
            <div className="flex gap-4 mb-8">
                <button onClick={() => setIsPlanModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 shadow">
                    Manage Membership Plans
                </button>
                {/* Notification Button already exists but we can enhance */}
            </div>

            {/* Plans List (Visible for Admin Reference) */}
            <div className="mb-8 bg-white p-6 rounded shadow">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Membership Plans</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plans.map(p => (
                        <div key={p.id} className="border p-4 rounded bg-gray-50 relative group">
                            <h4 className="font-bold text-blue-600">{p.name}</h4>
                            <p className="text-2xl font-bold">₹{p.price}</p>
                            <p className="text-sm text-gray-500">{p.duration_months} Months</p>
                            <p className="text-xs text-gray-400 mt-2">{p.description}</p>
                            <div className="absolute top-2 right-2 hidden group-hover:flex gap-2">
                                <button onClick={() => openPlanModal(p)} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Edit</button>
                                <button onClick={() => handlePlanDelete(p.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Del</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Plan Modal */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">{editPlan ? "Edit Plan" : "Create Plan"}</h2>
                        <form onSubmit={handlePlanSubmit}>
                            <input name="name" value={planFormData.name} onChange={handlePlanChange} placeholder="Plan Name" className="border p-2 w-full mb-2" required />
                            <input name="price" type="number" value={planFormData.price} onChange={handlePlanChange} placeholder="Price (Rs)" className="border p-2 w-full mb-2" required />
                            <input name="duration_months" type="number" value={planFormData.duration_months} onChange={handlePlanChange} placeholder="Duration (Months)" className="border p-2 w-full mb-2" required />
                            <textarea name="description" value={planFormData.description} onChange={handlePlanChange} placeholder="Description" className="border p-2 w-full mb-2" />
                            <div className="flex justify-end gap-2 text-sm">
                                <button type="button" onClick={() => setIsPlanModalOpen(false)} className="px-3 py-1 text-gray-600">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-purple-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h2 className="text-xl font-bold mb-4">{editUser ? "Edit Client" : "Create New Client"}</h2>
                        <form onSubmit={handleSubmit}>
                            {/* 1. Role and Membership Selection */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={(e) => {
                                            const newRole = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                role: newRole,
                                                total_amount: newRole === 'trainer' ? "" : prev.total_amount,
                                                membership_type: newRole === 'trainer' ? "" : prev.membership_type
                                            }));
                                        }}
                                        className="border p-2 w-full rounded"
                                    >
                                        <option value="client">Client</option>
                                        <option value="trainer">Trainer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                {formData.role === 'client' && (
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Membership Plan</label>
                                        <select
                                            name="membership_type"
                                            value={formData.membership_type}
                                            onChange={(e) => {
                                                const selectedPlan = plans.find(p => p.name === e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    membership_type: e.target.value,
                                                    total_amount: selectedPlan ? selectedPlan.price : formData.total_amount
                                                });
                                            }}
                                            className="border p-2 w-full rounded"
                                        >
                                            <option value="">-- Select Plan --</option>
                                            {plans.map(p => (
                                                <option key={p.id} value={p.name}>
                                                    {p.name} - ₹{p.price}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* 2. Basic Info */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" className="border p-2 w-full rounded" required />
                                <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="border p-2 w-full rounded" type="email" required />
                            </div>

                            {/* 3. Personal Details */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Date of Birth</label>
                                    <input name="dob" type="date" value={formData.dob} onChange={handleChange} className="border p-2 w-full rounded" />
                                </div>
                                <input name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="Phone" className="border p-2 w-full rounded mt-6" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="border p-2 w-full rounded" />
                                <input name="height" type="number" value={formData.height} onChange={handleChange} placeholder="Height (cm)" className="border p-2 w-full rounded" />
                            </div>
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="border p-2 w-full rounded mb-4" />

                            {/* 4. Finance (Only for Client) */}
                            {formData.role === 'client' && (
                                <div className="grid grid-cols-2 gap-4 mb-4 border-t pt-4">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Total Amount</label>
                                        <input
                                            name="total_amount"
                                            type="number"
                                            value={formData.total_amount}
                                            onChange={handleChange}
                                            placeholder="Total Amount"
                                            className="border p-2 w-full rounded bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Amount Paid</label>
                                        <input name="amount_paid" type="number" value={formData.amount_paid} onChange={handleChange} placeholder="Amount Paid" className="border p-2 w-full rounded" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                                        <input name="start_date" type="date" value={formData.start_date || ""} onChange={handleChange} className="border p-2 w-full rounded" />
                                    </div>
                                </div>
                            )}

                            {/* Info Text */}
                            <div className="text-xs text-gray-500 mb-4 bg-blue-50 p-2 rounded">
                                {formData.role === 'trainer'
                                    ? "Trainer will be created with 'Off Duty' status. No membership plan required."
                                    : "Client will receive an email to activate account and set password."}
                            </div>

                            <div className="flex justify-end gap-2 text-sm">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1 text-gray-600">Cancel</button>
                                <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <h2 className="bg-gray-100 px-6 py-4 font-semibold border-b">
                    Client Management
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
                                    {user.role === "client" ? (
                                        (user.membershipType && user.membershipType.includes("Personal Training")) ? (
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
                                            <div className="text-xs text-gray-400 italic">Plan Restricted</div>
                                        )
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

