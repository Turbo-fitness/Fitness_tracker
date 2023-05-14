const express = require('express');
const routineActivitiesRouter = express.Router();
const {updateRoutineActivity, getRoutineActivityById} = require("../db");

// PATCH /api/routine_activities/:routineActivityId
routineActivitiesRouter.patch('/',  async (req, res, next) => {
    try {
      
      const userId = req.user.id;
  
      const routineActivityId = req.params.routineActivityId;
  
      
      const { duration, count } = req.body;
  
     
      const existingRoutineActivity = await getRoutineActivityById(routineActivityId);
  
      if (!existingRoutineActivity) {
        return res.status(404).json({ message: 'Routine activity not found' });
      }
  
      
      if (existingRoutineActivity.userId !== userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const updatedRoutineActivity = await updateRoutineActivity(routineActivityId, { duration, count });
  
      res.status(200).json(updatedRoutineActivity);
    } catch (error) {
      next(error);
    }
  });
// DELETE /api/routine_activities/:routineActivityId

module.exports = routineActivitiesRouter;
