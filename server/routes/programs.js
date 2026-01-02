// server/routes/programs.js
const express = require('express');
const router = express.Router();
const { Program, ProgramExercise, UserProgram, sequelize } = require('../models'); // Use Models
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
}

// 1. Get all programs (with exercises)
router.get('/', async (req, res) => {
  try {
    const programs = await Program.findAll({
      include: [
        { model: ProgramExercise, as: 'exercises', attributes: ['id', 'name', 'sets', 'reps', 'position'] }
      ],
      order: [['id', 'ASC']] // Order by ID mainly/default
    });
    // Program model's hasMany is 'exercises'. 
    // Wait, let's verify if model aliases are correct.
    // Program.js: Program.hasMany(models.ProgramExercise, { foreignKey: "program_id", as: "exercises" });
    // This matches. 

    // Also internal exercise order: 
    // Sequelize doesn't easily sort nested includes in all versions, but let's try.
    // Actually, let's sort in memory or trust default.
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Program (with exercises)
router.post('/', authMiddleware, async (req, res) => {
  const { name, description, difficulty, exercises } = req.body;
  // Transaction to ensure atomicity
  const t = await sequelize.transaction();

  try {
    const newProgram = await Program.create({
      name,
      description,
      difficulty,
      created_by: req.userId
    }, { transaction: t });

    if (exercises && exercises.length > 0) {
      const exerciseData = exercises.map((ex, index) => ({
        program_id: newProgram.id,
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        position: index
      }));
      await ProgramExercise.bulkCreate(exerciseData, { transaction: t });
    }

    await t.commit();
    res.status(201).json(newProgram);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
});

// 3. Delete Program
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Cascading delete is handled by DB FK ideally, but let's be safe
    // await ProgramExercise.destroy({ where: { program_id: req.params.id } }); 
    // We can just destroy program and let cascade hooks work if configured OR do manual

    // Manual cleanup just in case FK constraints aren't set to CASCADE
    await ProgramExercise.destroy({ where: { program_id: req.params.id } });
    await UserProgram.destroy({ where: { program_id: req.params.id } }); // Remove assignments

    const count = await Program.destroy({ where: { id: req.params.id } });
    if (count === 0) return res.status(404).json({ error: "Program not found" });

    res.json({ message: "Program deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4. Assign program to user (save selection)
router.post('/assign/:programId', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const programId = parseInt(req.params.programId);
  try {
    // Delete previous assignments
    await UserProgram.destroy({ where: { user_id: userId } });

    const assignment = await UserProgram.create({
      user_id: userId,
      program_id: programId,
      assigned_by: userId // Self-assigned via this route usually
    });

    res.json({ assigned: true, row: assignment });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Get the user's assigned program
router.get('/mine', authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const userProg = await UserProgram.findOne({ where: { user_id: userId } });
    if (!userProg) return res.json({ program: null });

    // Fetch full program details
    const program = await Program.findByPk(userProg.program_id, {
      include: [
        { model: ProgramExercise, as: 'exercises', attributes: ['id', 'name', 'sets', 'reps', 'position'] }
      ]
    });

    res.json({ program });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
