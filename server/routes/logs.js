// server/routes/logs.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next){
  const token = req.headers['authorization'];
  if(!token) return res.status(401).json({error:'No token'});
  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded)=>{
    if(err) return res.status(403).json({error:'Invalid token'});
    req.userId = decoded.id;
    next();
  });
}

// Create a workout log (session) with details
// body: { program_id (optional), date (optional), details: [{exercise_name, sets_completed, reps_completed, weight}] }
router.post('/', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { program_id, date, details } = req.body;
  try {
    const insertLog = await pool.query(
      'INSERT INTO workout_logs (user_id, program_id, date) VALUES ($1, $2, COALESCE($3, NOW())) RETURNING id, date',
      [userId, program_id || null, date || null]
    );
    const logId = insertLog.rows[0].id;
    // Insert detail rows
    const insertPromises = (details || []).map(d => {
      return pool.query(
        'INSERT INTO workout_log_details (workout_log_id, exercise_name, sets_completed, reps_completed, weight) VALUES ($1,$2,$3,$4,$5)',
        [logId, d.exercise_name, d.sets_completed || null, d.reps_completed || null, d.weight || null]
      );
    });
    await Promise.all(insertPromises);
    res.json({ success:true, logId });
  } catch (err){ res.status(500).json({error:err.message}); }
});

// Get logs for current user (optionally limit)
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const logs = await pool.query('SELECT id, program_id, date FROM workout_logs WHERE user_id=$1 ORDER BY date DESC', [userId]);
    const results = [];
    for (let l of logs.rows){
      const details = await pool.query('SELECT exercise_name, sets_completed, reps_completed, weight FROM workout_log_details WHERE workout_log_id=$1', [l.id]);
      results.push({ id: l.id, program_id: l.program_id, date: l.date, details: details.rows });
    }
    res.json(results);
  } catch (err){ res.status(500).json({error:err.message}); }
});

// Simple stats endpoint: returns counts per day last 30 days and total weight lifted per day
router.get('/stats', authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    // workouts per day last 30 days
    const workoutsCount = await pool.query(`
      SELECT date::date AS day, COUNT(*) as count
      FROM workout_logs
      WHERE user_id=$1 AND date >= NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day
    `, [userId]);

    // total weight per day (sum weights in details)
    const weightSum = await pool.query(`
      SELECT wl.date::date AS day, COALESCE(SUM(d.weight),0) as total_weight
      FROM workout_logs wl
      LEFT JOIN workout_log_details d ON wl.id = d.workout_log_id
      WHERE wl.user_id=$1 AND wl.date >= NOW() - INTERVAL '30 days'
      GROUP BY day
      ORDER BY day
    `, [userId]);

    res.json({ workoutsCount: workoutsCount.rows, weightSum: weightSum.rows });
  } catch (err){ res.status(500).json({error:err.message}); }
});

module.exports = router;
