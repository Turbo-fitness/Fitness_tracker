const express = require('express');
const routinesRouter = express.Router();
const { getAllRoutines, createRoutine} = require("../db");
// GET /api/routines

routinesRouter.get('/', async (req, res, next) => {
  try {
    const routines = await getAllRoutines();
    res.json(routines);
  } catch (error) {
    next(error);
  }
});

   
// POST /api/routines
routinesRouter.post('/', async (req, res, next) => {
  const { name, goal, isPublic, creatorId } = req.body;

  if (!name || !goal || !isPublic || !creatorId) {
    return next({
      name: 'InvalidInputError',
      message: 'Missing required fields'
    });
  }

  const postData = {
    name: name,
    goal: goal,
    isPublic: isPublic,
    creatorId :req.user.id 
     
  };
  
  try {
    const routine = await createRoutine(postData);
    if (routine) {
      res.send({ routine });
 
    } else {
      return next({
        name: 'CreateRoutineError',
        message: 'Unable to create routine'
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

// PATCH /api/routines/:routineId

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = routinesRouter;
