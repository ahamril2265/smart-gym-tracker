import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Programs from './pages/Programs';
import MyProgram from './pages/MyProgram';
import LogWorkout from './pages/LogWorkout';
import Progress from './pages/Progress';
import Workouts from './pages/Workouts';
import Friends from './pages/Friends';
import Nutrition from './pages/Nutrition';
import Profile from './pages/Profile';
import AdminDashboard from "./pages/AdminDashboard";
import TrainerManagement from "./pages/TrainerManagement";
import TrainerDashboard from "./pages/TrainerDashboard";
import Home from './pages/Home';

import ProgramCreator from "./pages/ProgramCreator";
import ProgramManagement from "./pages/ProgramManagement";
import AttendanceScanner from "./pages/AttendanceScanner";
import ActivateAccount from "./pages/ActivateAccount";

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route path="/attendance" element={<AttendanceScanner />} />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'admin', 'trainer']}><Dashboard /></ProtectedRoute>} />
        <Route path="/log-workout" element={<ProtectedRoute allowedRoles={['user']}><LogWorkout /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'admin', 'trainer']}><Profile /></ProtectedRoute>} />
        <Route path="/programs" element={<ProtectedRoute allowedRoles={['user']}><Programs /></ProtectedRoute>} />
        <Route path="/my-program" element={<ProtectedRoute allowedRoles={['user']}><MyProgram /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute allowedRoles={['user']}><Progress /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute allowedRoles={['user']}><Workouts /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute allowedRoles={['user']}><Friends /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute allowedRoles={['user']}><Nutrition /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/trainer-management" element={<ProtectedRoute allowedRoles={['admin']}><TrainerManagement /></ProtectedRoute>} />

        {/* Protected Trainer Routes */}
        <Route path="/trainer" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />
        <Route path="/program-creator" element={<ProtectedRoute allowedRoles={['trainer']}><ProgramCreator /></ProtectedRoute>} />
        <Route path="/program-management" element={<ProtectedRoute allowedRoles={['trainer']}><ProgramManagement /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
