const express = require('express');
const router = express.Router();
const {getAllPublicRoutines, getRoutineActivitiesByRoutine} = require("../db");
// GET /api/routines
router.get('/routines', async (req, res, next) => {
    try {
      const routines = await getAllPublicRoutines();
      res.json(routines);
    } catch (error) {
      next(error);
    }
  });

// POST /api/routines

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
