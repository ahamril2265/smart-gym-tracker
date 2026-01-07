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

// 2.5 Update Program (NEW)
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, description, difficulty, exercises } = req.body;
  const t = await sequelize.transaction();

  try {
    const program = await Program.findByPk(req.params.id);
    if (!program) {
      await t.rollback();
      return res.status(404).json({ error: "Program not found" });
    }

    // Check ownership: Only creator or admin can update
    // Note: req.userId comes from middleware. Assuming Users have roles, we might need to fetch User to check admin.
    // user.js model usually has role.
    // For now, let's enforce creator check. If admin logic is needed, we'd need to fetch the user too.
    // Simplified: Check if user is creator.
    if (program.created_by !== req.userId) {
      // Optionally check admin here if we had the user role in request or fetch it.
      // Let's assume strict ownership for now or fetch user.
      const { User } = require('../models');
      const user = await User.findByPk(req.userId);
      if (user.role !== 'admin') {
        await t.rollback();
        return res.status(403).json({ error: "Not authorized to update this program" });
      }
    }

    // Update Program details
    await program.update({ name, description, difficulty }, { transaction: t });

    // Update Exercises (Replace all)
    if (exercises) { // Only update exercises if provided
      await ProgramExercise.destroy({ where: { program_id: program.id } }, { transaction: t });

      if (exercises.length > 0) {
        const exerciseData = exercises.map((ex, index) => ({
          program_id: program.id,
          name: ex.name,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          position: index
        }));
        await ProgramExercise.bulkCreate(exerciseData, { transaction: t });
      }
    }

    await t.commit();
    res.json({ message: "Program updated successfully", program });

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

// 5. Get the user's assigned programs (Multi-Program Support)
router.get('/mine', authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const userPrograms = await UserProgram.findAll({ where: { user_id: userId } });
    if (!userPrograms || userPrograms.length === 0) return res.json({ programs: [] });

    // Fetch details for all assigned programs
    const programs = await Promise.all(userPrograms.map(async (up) => {
      const program = await Program.findByPk(up.program_id, {
        include: [
          { model: ProgramExercise, as: 'exercises', attributes: ['id', 'name', 'sets', 'reps', 'position'] }
        ]
      });

      // Attach schedule info to the program object for frontend convenience
      if (program) {
        program.dataValues.schedule = up.schedule_days || [];
        program.dataValues.assigned_date = up.assigned_date;
      }
      return program;
    }));

    // Filter out nulls if program deleted
    const validPrograms = programs.filter(p => p !== null);

    res.json({ programs: validPrograms });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. User Self-Assign Program
router.post('/self-assign', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { programId, days } = req.body;
  try {
    const [assignment, created] = await UserProgram.findOrCreate({
      where: { user_id: userId, program_id: programId },
      defaults: {
        assigned_by: userId,
        schedule_days: days || []
      }
    });

    if (!created) {
      assignment.schedule_days = days || [];
      await assignment.save();
    }
    res.json({ message: 'Program assigned/updated successfully', assignment });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. User Self-Unassign Program
router.post('/self-unassign', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const { programId } = req.body;
  try {
    await UserProgram.destroy({
      where: { user_id: userId, program_id: programId }
    });
    res.json({ message: "Program removed" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
