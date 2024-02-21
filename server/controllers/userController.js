const db = require('../models/dataModel');

const userController = {};

//sign up 
userController.postUser = async (req, res, next) => {
    console.log('we are in sign up')

    try {
        //check if the user exists in database
        const ifUserExists = {
            text: 'SELECT EXISTS(SELECT * FROM Users WHERE Users.username = $1',
            values: [req.body.username],
        }
        //wait to see if user exists
        const userExists = await db.query(ifUserExists);
        console.log(userExists.rows[0].exists, 'userExists.rows[0].username');

        //if userExists, alert user to make unique username
        if (userExists.rows[0].exists) {
            res.locals.newUser = null; 
            res.locals.message = `${username} already exists, please make unique username.`;
            return next()
;        }

        //insert username and password into database
        const queryUserPassword = {
            text: 'INSERT INTO Users (username, password) VALUES ($1, $2)',
            values: [req.body.username, req.body.password],
        };

        //await insertion of data and create newUser
        const newUser = await db.query(queryUserPassword); 
        //possibly can remove .rows here
        res.locals.newUser = newUser.rows;

        return next();
    
    } catch {
        //if error exists throughout function, catch and return error here
        const err = {
            log: 'Express error handler caught error in userController.postUser', 
            status: 500, 
            message: { err: 'An error occured has occured with Signup'}, 
        }; 
        return next(err); 
    }
    
};

//login in
userController.getUser = async (req, res, next) => {
    console.log('inside login controller');
    console.log(req.params.username, req.params.password); 

    try {
        //query to join the users table with all the data of jobs table so username is associated with its own specific data
        const queryUserPassword = {
            text: 'SELECT Users.id, Jobs.title, Jobs.field, Jobs.duedate, Jobs.startdate, Jobs.location, Jobs.salary, Jobs.description FROM Users LEFT OUTER JOIN Jobs ON Users.id = Jobs.users_id WHERE Users.username = $1 AND Users.password = $2;',
            values: [req.params.username, req.params.password],
        };
        //store username and password as user
        const user = await db.query(queryUserPassword); 

        res.locals.user = user.rows; 

        return next(); 
    }
    catch {
        const err = {
            log: 'Express error handler caught in userController.getUser', 
            status: 500, 
            message: { err: 'An error has occured with login!'}
        }; 
        return next(err); 

    }  


};

module.exports = userController; 