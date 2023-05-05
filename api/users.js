/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const {getUserByUsername, createUser} = require("../db");
const { UserDoesNotExistError } = require("../errors");
const jwt = require('jsonwebtoken');

// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;
  
    try {
      const _user = await getUserByUsername(username);
  
      if (_user) {
        next({
          name: 'UserExistsError',
          message: 'A user by that username already exists'
        });
      } else if (password.length < 8) { // check password length
        next({
          name: 'PasswordTooShortError',
          message: 'Your password must be at least 8 characters long'
        });
      } else {
        const user = await createUser({
          username,
          password
        });
  
        const token = jwt.sign({
          id: user.id,
          username
        }, process.env.JWT_SECRET, {
          expiresIn: '1w'
        });
  
        res.send({
          message: "Successfully created new user.",
          token,
          user: {
            id: user.id,
            username: user.username
          }
        });
      }
    } catch ({ name, message }) {
      next({ name, message })
    }
  });
// POST /api/users/login

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
