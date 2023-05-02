const client = require('./client');

// database functions
async function createActivity({ name, description }) {
  try {
    const { rows: [activity] } = await client.query(`
      INSERT INTO activities(name, description)
      VALUES($1, $2)
      RETURNING id, name, description;
    `, [name, description]);

    return activity;
  } catch (error) {
    console.error(error);
  }
}

async function getAllActivities() {
    try {
      const { rows: activities } = await client.query(`
        SELECT *
        FROM activities;
      `);
      return activities;
    } catch (error) {
      console.error(error);
    }
  }

async function getActivityById(id) {
  try {
    const { rows: [ activity ] } = await client.query(`
      SELECT *
      FROM activities
      WHERE id=${ id }
    `);

    if (!activity) {
      return null
    }


    return activity;
  } catch (error) {
    throw error;
  }

}

async function getActivityByName(name) {
  try {
    const { rows: [activity] } = await client.query(`
      SELECT *
      FROM activities
      WHERE name = $1;
    `, [name]);

    return activity;
  } catch (error) {
    console.error(error);
  }
}

// used as a helper inside db/routines.js
async function attachActivitiesToRoutines(routines) {}

async function updateActivity({ id, ...fields }) {
  const { activityId } = fields; // might be undefined

  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  try {

    if (setString.length > 0) {
      await client.query(`
        UPDATE activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
    }


    if (id === undefined) {
      return await getActivitybyId(id);
    }

    return await getActivityById(id);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
};
