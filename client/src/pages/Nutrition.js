import { useEffect, useState } from "react";
import api from "../utils/api";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from "chart.js";
import BackButton from "../components/BackButton";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Nutrition() {
  const token = localStorage.getItem("token");
  const [meals, setMeals] = useState([]);
  const [meal, setMeal] = useState({ mealType: "breakfast", food: "", calories: "", protein: "", carbs: "", fat: "", date: new Date().toISOString().slice(0, 10) });
  const [stats, setStats] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const fetchMeals = () => {
    api.get("/meals").then(res => setMeals(res.data));
    api.get("/meals/stats").then(res => setStats(res.data));
  };

  useEffect(fetchMeals, []);

  const handleAdd = () => {
    api.post("/meals", meal)
      .then(() => { setMeal({ ...meal, food: "", calories: "", protein: "", carbs: "", fat: "" }); fetchMeals(); });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <BackButton />
      <h2 className="text-2xl font-bold mb-4">Nutrition Tracking</h2>

      {/* Add Meal Form */}
      <div className="space-y-2 mb-6">
        <select className="border p-2 w-full"
          value={meal.mealType}
          onChange={e => setMeal({ ...meal, mealType: e.target.value })}>
          <option>breakfast</option>
          <option>lunch</option>
          <option>dinner</option>
          <option>snack</option>
        </select>
        <input className="border p-2 w-full" placeholder="Food" value={meal.food}
          onChange={e => setMeal({ ...meal, food: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Calories" value={meal.calories}
          onChange={e => setMeal({ ...meal, calories: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Protein" value={meal.protein}
          onChange={e => setMeal({ ...meal, protein: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Carbs" value={meal.carbs}
          onChange={e => setMeal({ ...meal, carbs: e.target.value })} />
        <input className="border p-2 w-full" placeholder="Fat" value={meal.fat}
          onChange={e => setMeal({ ...meal, fat: e.target.value })} />
        <button onClick={handleAdd} className="bg-green-500 text-white px-3 py-1 rounded">Add Meal</button>
      </div>

      {/* Meals List */}
      <h3 className="font-semibold mb-2">Meals</h3>
      <ul className="mb-6">
        {meals.map(m => <li key={m.id}>{m.date} - {m.mealType}: {m.food} ({m.calories} cal)</li>)}
      </ul>

      {/* Daily Stats */}
      <h3 className="font-semibold mb-2">Today’s Nutrition</h3>
      <p>Calories: {stats.calories}</p>
      <p>Protein: {stats.protein}g, Carbs: {stats.carbs}g, Fat: {stats.fat}g</p>

      <Pie data={{
        labels: ["Protein", "Carbs", "Fat"],
        datasets: [{ data: [stats.protein, stats.carbs, stats.fat], backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444"] }]
      }} />
    </div>
  );
}
