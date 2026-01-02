import { useState } from "react";
import axios from "axios";
import BackButton from "../components/BackButton";
// In real world we would use react-qr-reader to scan from webcam
// For this environment, we simulate scanning by pasting/typing the content from the QR code (User ID or JSON)

export default function AttendanceScanner() {
    const [inputValue, setInputValue] = useState("");
    const [status, setStatus] = useState(null); // success, error
    const [message, setMessage] = useState("");
    const [scannedUser, setScannedUser] = useState(null);

    // const token = localStorage.getItem("token"); // Kiosk is PUBLIC now

    const handleCheckIn = async (e) => {
        e.preventDefault();
        setMessage("Processing...");
        setStatus(null);
        setScannedUser(null);

        // Try to parse if it's JSON from QR
        let payload = {};
        try {
            // Check if input is JSON (from our QR)
            if (inputValue.trim().startsWith("{")) {
                const parsed = JSON.parse(inputValue);
                if (parsed.memberId) payload = { memberId: parsed.memberId };
                else if (parsed.userId) payload = { userId: parsed.userId }; // Backward compatibility
            } else {
                // Assume manual entry of email or ID or MemoerID
                if (inputValue.includes("@")) payload = { email: inputValue };
                else if (inputValue.startsWith("MEM-")) payload = { memberId: inputValue };
                else if (!isNaN(inputValue)) payload = { userId: inputValue };
                else payload = { memberId: inputValue }; // Fallback to MemberID string
            }
        } catch (err) {
            // Fallback
            if (inputValue.includes("@")) payload = { email: inputValue };
            else if (inputValue.startsWith("MEM-")) payload = { memberId: inputValue };
            else payload = { userId: inputValue };
        }

        try {
            // Public endpoint, no auth header needed
            const res = await axios.post("http://localhost:5001/api/attendance/check-in", payload);
            setStatus("success");
            setMessage("Welcome!");
            setScannedUser({ name: res.data.user, time: new Date(res.data.time).toLocaleTimeString() });
            setInputValue(""); // Clear for next person
        } catch (err) {
            console.error(err);
            setStatus("error");
            setMessage(err.response?.data?.error || "Check-in failed");
        }
    };

    return (
        <div className="p-10 max-w-xl mx-auto text-center">
            <BackButton />
            <h1 className="text-3xl font-bold mb-2">Gym Check-In Kiosk</h1>
            <p className="text-gray-500 mb-8">Scan your QR code or enter your ID</p>

            <div className="bg-white p-8 rounded-lg shadow-lg">
                <form onSubmit={handleCheckIn} className="mb-6">
                    <input
                        autoFocus
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Scan QR or Enter ID/Email"
                        className="w-full text-center text-lg p-4 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    />
                    <button type="submit" className="mt-4 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                        CHECK IN
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        (Simulate scanning by pasting the JSON from your profile QR here)
                    </p>
                </form>

                {/* Status Display - Flash Messages */}
                {message && (
                    <div className={`p-4 rounded-lg animate-pulse ${status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <h2 className="text-2xl font-bold uppercase">{status === 'success' ? 'ACCESS GRANTED' : 'ACCESS DENIED'}</h2>
                        <p className="text-lg">{message}</p>
                    </div>
                )}

                {scannedUser && (
                    <div className="mt-6 border-t pt-4">
                        <p className="text-gray-600">Member</p>
                        <h3 className="text-2xl font-bold text-gray-800">{scannedUser.name}</h3>
                        <p className="text-sm text-gray-500">Checked in at {scannedUser.time}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
