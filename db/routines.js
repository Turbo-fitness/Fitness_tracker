/* eslint-disable no-useless-catch */
const client = require("./client");


function dbFields(fields) {
  const insert = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');
  // then we can use: (${ insert }) in our string template

  // need something like $1, $2, $3
  const select = Object.keys(fields)
    .map((_, index) => `$${index + 1}`)
    .join(', ');
  // then we can use (${ select }) in our string template

  const vals = Object.values(fields);
  return { insert, select, vals };
}
// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {
  const routinesToReturn = [...routines]; // prevents unwanted side effects.
  // $1, $2, $3
  const position = routines.map((_, index) => `$${index + 1}`).join(', ');
  const routineIds = routines.map((routine) => routine.id);

  // get the activities, JOIN with routine_activities (so we can get a routineId)
  const { rows: activities } = await client.query(
    `
  SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities."routineId", routine_activities.id AS "routineActivityId"
  FROM activities
  JOIN routine_activities ON routine_activities."activityId" = activities.id
  WHERE routine_activities."routineId" IN (${position})
  `,
    routineIds
  );

  // console.log('these are my activities: ----->', activities);

  // loop over each routine
  for (const routine of routinesToReturn) {
    // if the routine.id matches the activtiy.routineId then add to routine.
    const activitiesToAdd = activities.filter(
      (activity) => activity.routineId === routine.id
    );

    routine.activities = activitiesToAdd;
  }

  //console.log('these are my routines: ----->', routines[3]);
  // console.log('these are my routines: ----->', routines[3].activities);
  return routinesToReturn;
}

async function createRoutine({ creatorId, isPublic, name, goal }) {
try{
  const { rows: [routine]} = await client.query(`
  
  INSERT INTO routines ("creatorId", "isPublic", "name", "goal")
  VALUES($1, $2, $3, $4)
  RETURNING *;
  `, [creatorId, isPublic, name, goal]
  );

  return routine;
  }catch (error){
    console.error("could not create routine");
  }
}
async function getRoutineById(id) {
  try {
    const { rows: routine } = await client.query(`
      SELECT * FROM routines
      WHERE id = $1;
    `, [id]);

    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function getRoutinesWithoutActivities() {
  try {
    const { rows: routines } = await client.query(`
    SELECT *
    FROM routines  
    `)
    return routines;
  } catch(error){
    console.error(error);
  }
}

async function getAllRoutines() {
  
  try {
    const { rows: routines } = await client.query(
      `
       SELECT routines.*, users.username AS "creatorName"
       FROM routines
       JOIN users ON routines."creatorId" = users.id
    `
    );

    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}


async function getAllPublicRoutines() {
  
  try {
    const { rows: routines } = await client.query(
      `
      SELECT DISTINCT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId"
      JOIN routine_activities ON routines.id = routine_activities."routineId"
      WHERE "isPublic" = true
      `);

      //console.log("these here are them public routines",routines.isPublic )
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
      Select routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId"
      WHERE users.username = $1
      `,
      [username]
      );

      
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }
}



async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(
      `
      Select routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId"
      WHERE routines. "isPublic" = true 
      AND users.username = $1
      `,
      [username]
      );

      
    return await attachActivitiesToRoutines(routines);
  } catch (error) {
    throw error;
  }

}



async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(
      `     
      SELECT routines.*, users.username AS "creatorName"
      FROM routines
      JOIN users ON users.id = routines."creatorId"
      JOIN routine_activities ON routines.id = routine_activities."routineId"
      WHERE routines."isPublic" = true
      AND routine_activities."activityId" = $1
      
      `, [id] 
      );
      
      
      return await attachActivitiesToRoutines(routines);
    } catch (error) {
      throw error;
      
    }
    
  }
  
  
  
  
async function updateRoutine({ id, ...fields }) {
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');
  try {
    const { rows: [routine] } = await client.query(`
      UPDATE routines
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `, Object.values(fields));

    return routine;
  } catch (error) {
    console.error(error);
  }
}

async function destroyRoutine(id) {
  try {
    // Delete all routine_activities whose routine is the one being deleted
    await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId"=$1
    `, [id]);

    // Remove the routine from the database
    const { rows } = await client.query(`
      DELETE FROM routines
      WHERE id=$1
    `, [id]);

    if (rows === 0) {
      throw new Error(`Routine with id ${id} not found`);
    }

    return { message: "Routine deleted" };
  } catch (error) {
    console.error(error);
  }
}



module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
