import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import BackButton from "../components/BackButton";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Progress() {
  const [counts, setCounts] = useState([]);
  const [weights, setWeights] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5001/api/logs/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        setCounts(r.data.workoutsCount);
        setWeights(r.data.weightSum);
      }).catch(e => console.error(e));
  }, [token]);

  // Convert to chart-friendly arrays (last 30 days)
  const days = (() => {
    const map = {};
    const labels = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      map[key] = 0;
    }
    counts.forEach(row => {
      const key = new Date(row.day).toISOString().slice(0, 10);
      map[key] = parseInt(row.count) || 0;
    });
    return { labels, values: labels.map(l => map[l] || 0) };
  })();

  const wmap = (() => {
    const map = {};
    const labels = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      map[key] = 0;
    }
    weights.forEach(row => {
      const key = new Date(row.day).toISOString().slice(0, 10);
      map[key] = parseFloat(row.total_weight) || 0;
    });
    return { labels, values: labels.map(l => map[l] || 0) };
  })();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Progress — Last 30 days</h2>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Workouts per day</h3>
        <Bar data={{
          labels: days.labels,
          datasets: [{ label: 'Workouts', data: days.values }]
        }} options={{ responsive: true, plugins: { legend: { display: false } } }} />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Total weight lifted per day</h3>
        <Line data={{
          labels: wmap.labels,
          datasets: [{ label: 'Total weight (kg)', data: wmap.values, fill: false }]
        }} options={{ responsive: true }} />
      </div>
    </div>
  );
}
