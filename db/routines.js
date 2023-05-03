const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
try{
  const { rows: [routine]} = await client.query(`
  
  INSERT INTO routines ("creatorId", "isPublic", "name", "goal")
  VALUES($1, $2, $3, $4)
  RETURNING *;
  `, [creatorId, isPublic, name, goal]
  );
console.log("this is my routines", routine)
  return routine;
  }catch (error){
    console.error("could not create routine");
  }
}
async function getRoutineById(id) {}

async function getRoutinesWithoutActivities() {}

async function getAllRoutines() {
  try{
    const { rows: routines } = await client.query(`
    
    SELECT routines.*, users.username AS "createorName" 
    FROM routines
    
    `
    );
  
    return routines;
    }catch (error){
      throw error;
    }
  }


async function getAllPublicRoutines() {}

async function getAllRoutinesByUser({ username }) {}

async function getPublicRoutinesByUser({ username }) {}

async function getPublicRoutinesByActivity({ id }) {}

async function updateRoutine({ id, ...fields }) {}

async function destroyRoutine(id) {}

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
