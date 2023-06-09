require('dotenv').config();
const apiRouter = require('express').Router()
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

// GET /api/health
apiRouter.get('/health', async (req, res, next) => {
    try {
       
        res.send({
          message: 'The api is healthy',
        
        });
      } catch (error) {
        next(error);
      }
    });

    apiRouter.use(async (req, res, next) =>{
      const prefix = 'Bearer ';
      const auth = req.header('Authorization');
  
      if (!auth) {
          next();
      }   else if (auth.startsWith(prefix)){
          const token = auth.slice(prefix.length);
          console.log(JWT_SECRET);
          try {
              const { id } = jwt.verify(token, JWT_SECRET);
  
              if (id) {
                  req.user = await getUserById(id);
                  next();
              }
          } catch ({ name, message }) {
              next({ name, message });
          }
      } else {
          next ({
              name: 'AuthorizationHeaderError',
              message: `Authorization token must start with ${ prefix }`
          });
      }
  });
// ROUTER: /api/users
const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

// ROUTER: /api/activities
const activitiesRouter = require('./activities');
apiRouter.use('/activities', activitiesRouter);

// ROUTER: /api/routines
const routinesRouter = require('./routines');
apiRouter.use('/routines', routinesRouter);

// ROUTER: /api/routine_activities
const routineActivitiesRouter = require('./routineActivities');
apiRouter.use('/routine_activities', routineActivitiesRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
      name: error.name,
      message: error.message
    });
  });
  
module.exports = apiRouter;
