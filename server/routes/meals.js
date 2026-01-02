const express = require("express");
const router = express.Router();
const { Meal } = require("../models");
const auth = require("../middleware/auth");

// Add meal
router.post("/", auth, async (req, res) => {
  const meal = await Meal.create({ ...req.body, userId: req.user.id });
  res.json(meal);
});

// Get meals
router.get("/", auth, async (req, res) => {
  const meals = await Meal.findAll({ where: { userId: req.user.id } });
  res.json(meals);
});

// Daily stats
router.get("/stats", auth, async (req, res) => {
  const { Op } = require("sequelize");
  const today = new Date().toISOString().slice(0, 10);
  const meals = await Meal.findAll({
    where: { userId: req.user.id, date: today }
  });

  let stats = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  meals.forEach(m => {
    stats.calories += m.calories;
    stats.protein += m.protein;
    stats.carbs += m.carbs;
    stats.fat += m.fat;
  });

  res.json(stats);
});

module.exports = router;
