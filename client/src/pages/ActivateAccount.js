import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function ActivateAccount() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState(null); // success, error
    const [msg, setMsg] = useState("");

    const handleActivate = async (e) => {
        e.preventDefault();
        if (password !== confirm) {
            setMsg("Passwords do not match");
            return;
        }

        try {
            await api.post("/auth/activate", { token, password });
            setStatus("success");
            setMsg("Account Activated! Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setStatus("error");
            setMsg(err.response?.data?.error || "Activation failed");
        }
    };

    if (!token) return <div className="p-10 text-center text-red-500">Invalid Activation Link</div>;

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Activate Account</h2>

                {status === 'success' ? (
                    <div className="text-green-600 text-center font-bold">{msg}</div>
                ) : (
                    <form onSubmit={handleActivate}>
                        <p className="mb-4 text-sm text-gray-600">Set your password to activate your account.</p>
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border p-2 mb-3 rounded"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className="w-full border p-2 mb-4 rounded"
                            required
                        />
                        {msg && <div className="text-red-500 text-sm mb-3">{msg}</div>}
                        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            Activate & Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
