import { useEffect, useState } from "react";
import api from "../utils/api";
import BackButton from "../components/BackButton";

export default function Friends() {
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  const fetchData = () => {
    api.get("/user/all").then(res => setUsers(res.data));
    api.get("/friends").then(res => setFriends(res.data));
    api.get("/friends/pending").then(res => setPending(res.data));
    api.get("/friends/workouts").then(res => setWorkouts(res.data));
  };

  useEffect(fetchData, []);

  const sendRequest = (friendId) => {
    api.post(`/friends/request/${friendId}`)
      .then(() => { alert("Request sent!"); fetchData(); });
  };

  const handleAccept = (id) => {
    api.post(`/friends/accept/${id}`)
      .then(() => fetchData());
  };

  const handleReject = (id) => {
    api.post(`/friends/reject/${id}`)
      .then(() => fetchData());
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Friends</h2>

      {/* All Users */}
      <h3 className="font-semibold mb-2">All Users</h3>
      <ul className="mb-6">
        {users.map(u => (
          <li key={u.id} className="flex justify-between items-center border p-2 mb-2">
            <span>{u.name} ({u.email})</span>
            <button
              onClick={() => sendRequest(u.id)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Add Friend
            </button>
          </li>
        ))}
      </ul>

      {/* Pending Requests */}
      <h3 className="font-semibold mb-2">Pending Requests</h3>
      <ul className="mb-6">
        {pending.map(req => (
          <li key={req.id} className="flex justify-between items-center border p-2 mb-2">
            <span>{req.user.name} ({req.user.email})</span>
            <div className="space-x-2">
              <button
                onClick={() => handleAccept(req.id)}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(req.id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Friends List */}
      <h3 className="font-semibold mb-2">My Friends</h3>
      <ul className="mb-6">
        {friends.map(f => (
          <li key={f.id}>{f.friend.name} ({f.friend.email})</li>
        ))}
      </ul>

      {/* Friends’ Workouts */}
      <h3 className="font-semibold mb-2">Friends’ Workouts</h3>
      <ul>
        {workouts.map(w => (
          <li key={w.id}>{w.User.name}: {w.name}</li>
        ))}
      </ul>
    </div>
  );
}
