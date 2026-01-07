import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function TrainerManagement() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrainers();
    }, []);

    const fetchTrainers = async () => {
        try {
            // Reusing the admin users endpoint which returns all users, including trainers
            // Better to have a dedicated endpoint, but filtering client side for now is quick
            const res = await api.get('/admin/users');
            const trainerList = res.data.filter(u => u.role === 'trainer');
            setTrainers(trainerList);
        } catch (err) {
            console.error("Failed to fetch trainers", err);
        } finally {
            setLoading(false);
        }
    };

    // Mock Data for Attendance Graph (Last 7 Days)
    // In a real app, we'd fetch actual attendance records
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = {
        labels,
        datasets: [
            {
                label: 'Trainers Present',
                data: labels.map(() => Math.floor(Math.random() * (trainers.length + 1))), // Random presence count
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Weekly Trainer Attendance',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Trainer Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* 1. Attendance Graph */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <Bar options={options} data={data} />
                </div>

                {/* 2. Quick Stats */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-xl font-bold mb-4">Duty Status Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded text-center">
                            <p className="text-3xl font-bold text-green-600">
                                {trainers.filter(t => t.trainerStatus === 'on_duty').length}
                            </p>
                            <p className="text-sm text-gray-600">On Duty</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded text-center">
                            <p className="text-3xl font-bold text-gray-400">
                                {trainers.filter(t => t.trainerStatus === 'off_duty' || !t.trainerStatus).length}
                            </p>
                            <p className="text-sm text-gray-600">Off Duty</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded text-center col-span-2">
                            <p className="text-3xl font-bold text-blue-600">{trainers.length}</p>
                            <p className="text-sm text-gray-600">Total Trainers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Detailed Trainer List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-700">Trainer Roster</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center p-4">Loading...</td></tr>
                        ) : trainers.map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.member_id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.trainerStatus === 'on_duty'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {t.trainerStatus === 'on_duty' ? 'On Duty' : 'Off Duty'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
