const client = require("./client");
const bcrypt = require('bcrypt');
const SALT_COUNT = 10;
// database functions

// user functions
async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT)
  try {
    const {rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING username, id;
    `, [username, hashedPassword]);


    return user;
  } catch (error) {
    console.error(error);
  }
}

async function getUserByUsername(username) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT id, username, password
      FROM users
      WHERE username=$1;
    `, [username]);

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUser({username, password}) {
  try {
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username = $1;
    `, [username]);
    if (!user) {
      return undefined;
    }
    const isValid = await bcrypt.compare(password, user.password)


    if (!isValid) {
      // Password does not match
      return undefined;
    }
      
    // Password matches, return the user without the password
    delete user.password;
    return user;
  } catch (error) {
    console.error(error);
  }
}



async function getUserById(userId) {
  try {
    const { rows: [ user ] } = await client.query(`
      SELECT id, username
      FROM users
      WHERE id=${ userId }
    `);

    if (!user) {
      return null
    }


    return user;
  } catch (error) {
    throw error;
  }
}




module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
