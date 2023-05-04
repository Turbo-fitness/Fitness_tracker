const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, count, duration }) {
  try {
      const { rows: [routine_activity] } = await client.query(`
      INSERT INTO routine_activities ("routineId", "activityId", count, duration)
      VALUES ( $1, $2, $3, $4 )
      ON CONFLICT ("routineId", "activityId") DO NOTHING
      RETURNING *;
    `, [routineId, activityId, count, duration]);

    return routine_activity;
  } catch (error) {
    console.error('Error adding activity to routine:', error);
  }
}


async function getRoutineActivityById(id) {
  try {
    const { rows: [routineActivity] } = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE id=$1
    `, [id]);

    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try {
    const { rows: routineActivities } = await client.query(`
      SELECT *
      FROM routine_activities
      JOIN activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" = $1
    `, [id]);

    return routineActivities;
  } catch (error) {
    console.error(error);
  }
}

async function updateRoutineActivity({ id, count, duration }) {
  try {
    const { rows: [routineActivity] } = await client.query(`
      UPDATE routine_activities
      SET count=$1, duration=$2
      WHERE id=$3
      RETURNING *
    `, [count, duration, id]);

    if (!routineActivity) {
      throw Error(`Routine activity with id ${id} not found`);
    }

    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutineActivity(id) {
  try {
    const { rows: [routineActivity] } = await client.query(`
      DELETE FROM routine_activities
      WHERE id=$1
      RETURNING *
    `, [id]);

    if (!routineActivity) {
      throw Error(`Routine activity with id ${id} not found`);
    }

    return routineActivity;
  } catch (error) {
    console.error(error);
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const { rows: [routineActivity] } = await client.query(`
      SELECT routines.*
      FROM routine_activities
      JOIN routines ON routines.id = routine_activities."routineId"
      WHERE routine_activities.id = $1
    `, [routineActivityId]);

    if (!routineActivity) {
      return false;
    //  throw Error(`No routine activity with id ${routineActivityId}`);
    }

    if (routineActivity.creatorId === userId) {
      return true;
    }

    // if (routineActivity.isPublic) {
    //   return true;
    // }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
