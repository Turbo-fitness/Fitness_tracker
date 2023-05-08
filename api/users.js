/* eslint-disable no-useless-catch */
const express = require("express");
const router = express.Router();
const {getUserByUsername, createUser} = require("../db");
const { UserDoesNotExistError, PasswordTooShortError } = require("../errors");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// POST /api/users/login
router.post('/login', async (req, res, next) => {

    const { username, password } = req.body;
    const _user = await getUserByUsername(username);
    console.log(_user,  username, password)
    try {
        
  
      if (!_user) {
        next({
          error: 'A user by that username already exists',
          message: "Username is taken!",
          name: "UserExistsError"
        });
      }
      let passwordsMatch = await bcrypt.compare(password, _user.password)
    if (!passwordsMatch) { // check if password is wrong length
        next({
          error:"Password is wrong",
          message: "Password is wrong.",
          name: "PasswordWrong"
        });
      } else {

            // create token & return to user
      
            const token = jwt.sign({ id: _user.id, username: _user.username }, process.env.JWT_SECRET);
            res.send({
                message: "you're logged in!",
                token,
                user: {
                  id: _user.id,
                  username: _user.username
                }
              });
   
  
       
      }
    } catch ({ name, message }) {
      next({ name, message })
    }
  });
// POST /api/users/register
router.post('/register', async (req, res, next) => {

    const { username, password } = req.body;
    const _user = await getUserByUsername(username);
    console.log(_user,  username, password)
    try {
      
  
      if (_user) {
        next({
          error: 'A user by that username already exists',
          message: UserDoesNotExistError(),
          name: "UserExistsError"
        });
      } else if (password.length < 8) { // check password length
        next({
          error:"You're password is too short",
          message: PasswordTooShortError(),
          name: "PasswordTooShortError"
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

// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
