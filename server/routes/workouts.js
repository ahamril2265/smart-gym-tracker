const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

// Middleware to check token
function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });
  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
}

// Add workout
router.post("/", authMiddleware, async (req, res) => {
  const { exercise, sets, reps, weight } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO workouts (user_id, exercise, sets, reps, weight) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [req.userId, exercise, sets, reps, weight]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get workouts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM workouts WHERE user_id=$1 ORDER BY date DESC", [req.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
