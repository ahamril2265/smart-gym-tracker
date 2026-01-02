import { useEffect, useState } from "react";
import axios from "axios";
import BackButton from "../components/BackButton";
import { QRCodeSVG } from "qrcode.react";

export default function Profile() {
  const [profile, setProfile] = useState({});
  const [edit, setEdit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  // Preloaded Avatar Options
  const AVATAR_SEEDS = [
    "Felix", "Aneka", "Zoe", "Jack", "Bella", "Leo", "Mia", "Max",
    "Lola", "Sam", "Kiki", "Rocky", "Sasha", "Toby", "Coco", "Oliver",
    "Milo", "Luna", "Charlie", "Chloe", "Teddy", "Lily", "Buster", "Ruby"
  ];

  useEffect(() => {
    axios.get("http://localhost:5001/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProfile(res.data));
  }, []);

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('age', profile.age || '');
    formData.append('weight', profile.weight || '');
    formData.append('height', profile.height || '');
    formData.append('goal', profile.goal || '');
    formData.append('experience', profile.experience || '');

    if (profile.file) {
      formData.append('profileImage', profile.file);
    } else if (profile.profile_picture) {
      formData.append('profileImage', profile.profile_picture);
    }

    try {
      await axios.put("http://localhost:5001/api/user/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Refresh profile to show new image
      const res = await axios.get("http://localhost:5001/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setEdit(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const qrValue = profile.id ? JSON.stringify({ memberId: profile.member_id, userId: profile.id, email: profile.email }) : "";

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <BackButton />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          My Profile
        </h1>
        {!edit && (
          <button
            onClick={() => setEdit(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Avatar Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Choose an Avatar</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold text-xl">✕</button>
            </div>

            <div className="overflow-y-auto grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-2 custom-scrollbar">
              {AVATAR_SEEDS.map((seed) => {
                const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                return (
                  <button
                    key={seed}
                    onClick={() => {
                      setProfile({ ...profile, profile_picture: url, file: null }); // Clear file if avatar selected
                      setIsModalOpen(false);
                    }}
                    className="p-2 border-2 border-transparent hover:border-blue-500 rounded-xl transition focus:outline-none"
                  >
                    <img src={url} alt={seed} className="w-full h-auto rounded-full bg-gray-50" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Card */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          {edit ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.age || ""}
                  onChange={e => setProfile({ ...profile, age: e.target.value })}
                  placeholder="e.g. 25" type="number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                <input className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.weight || ""}
                  onChange={e => setProfile({ ...profile, weight: e.target.value })}
                  placeholder="e.g. 75" type="number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                <input className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  value={profile.height || ""}
                  onChange={e => setProfile({ ...profile, height: e.target.value })}
                  placeholder="e.g. 180" type="number" />
              </div>
              <div className="md:col-span-2 flex flex-col items-center mb-4">
                <div className="w-32 h-32 rounded-full border-4 border-blue-100 overflow-hidden mb-4 relative group">
                  <img
                    src={profile.file ? URL.createObjectURL(profile.file) : (profile.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`)}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-200 transition"
                  >
                    👾 Choose Avatar
                  </button>
                  <label className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition cursor-pointer">
                    📁 Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => setProfile({ ...profile, file: e.target.files[0] })}
                    />
                  </label>
                </div>
                {profile.file && <p className="text-xs text-gray-500 mt-2">Selected: {profile.file.name}</p>}
              </div>

              <div>

                {/* Only show Goal and Level for regular users */}
                {profile.role === 'user' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fitness Goal</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        value={profile.goal || ""}
                        onChange={e => setProfile({ ...profile, goal: e.target.value })}>
                        <option value="lose">Lose Weight</option>
                        <option value="gain">Gain Muscle</option>
                        <option value="maintain">Maintain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                        value={profile.experience || ""}
                        onChange={e => setProfile({ ...profile, experience: e.target.value })}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">Save Changes</button>
                  <button onClick={() => setEdit(false)} className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img src={profile.profile_picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile.username} alt="avatar"
                className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-sm" />

              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-semibold text-gray-900 text-lg">{profile.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900 break-all">{profile.email}</p>
                </div>
                <div className="h-px bg-gray-100 col-span-2 my-2"></div>

                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium text-gray-900">{profile.weight || "-"} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="font-medium text-gray-900">{profile.height || "-"} cm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Goal</p>
                  <p className="font-medium text-gray-900 capitalize">{profile.goal || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Level</p>
                  <p className="font-medium text-gray-900 capitalize">{profile.experience || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ID Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 p-3 opacity-20 text-6xl font-bold italic select-none">GYM</div>

          <h3 className="text-lg font-bold tracking-widest uppercase text-white/80 mb-6">Access Pass</h3>

          <div className="bg-white p-3 rounded-xl shadow-inner mb-6">
            {qrValue && <QRCodeSVG value={qrValue} size={160} />}
          </div>

          <p className="text-xs text-gray-400 mb-2">Member ID</p>
          <div className="text-xl font-mono font-bold tracking-wider bg-white/10 px-4 py-1 rounded border border-white/20">
            {profile.member_id || "LOADING..."}
          </div>

          <div className="mt-8 w-full border-t border-white/10 pt-4 flex justify-between text-xs text-gray-400">
            <span>Valid: {profile.membershipStatus === 'expired' ? '🔴 Expired' : '🟢 Active'}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
