const express = require('express');
const activitiesRouter = express.Router();
const { getAllActivities, createActivity} = require("../db");
// GET /api/activities/:activityId/routines

// GET /api/activities
activitiesRouter.get('/', async (req, res, next) => {
    try {
      const activities = await getAllActivities();
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });
// POST /api/activities

activitiesRouter.post('/', async (req, res, next) => {
  const { id, name, description } = req.body;

  if (!id || !name || !description) {
    return next({
      name: 'InvalidInputError',
      message: 'Missing required fields'
    });
  }

  const postData = {
    id: id,
    name: name,
    description: description,
    authorId: req.user.id
  };
console.log(postData)
  try {
    const activity = await createActivity(postData);

    if (activity) {
      res.send({ activity });
    } else {
      return next({
        name: 'CreateActivityError',
        message: 'Unable to create Activity'
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});


// PATCH /api/activities/:activityId

module.exports = activitiesRouter;
