// Import express and ejs
var express = require ('express')
var session = require ('express-session')
var validator = require ('express-validator');
const expressSanitizer = require('express-sanitizer');
var ejs = require('ejs')

//Import mysql module
var mysql = require('mysql2')

// Create the express application object
const app = express()
const port = 8000

global.redirectLogin = (req, res, next) => {
    if (!req.session.user) {
      res.redirect('../users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

// Tell Express that we want to use EJS as the templating engine
app.set('view engine', 'ejs')

// Set up the body parser 
app.use(express.urlencoded({ extended: true }))

//middleware for parsing json in body
app.use(express.json());

// Set up public folder (for css)
app.use(express.static(__dirname + '/public'))
// Set up scripts folder (for scripts)
app.use(express.static(__dirname + '/scripts'))

app.use(expressSanitizer());

// Create a session
app.use(session({
    secret: 'somerandomstuff',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}))

// Define the database connection
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'cocktail_canvas_app',
    password: 'password',
    database: 'cocktail_canvas'
})
// Connect to the database
db.connect((err) => {
    if (err) {
        throw err
    }
    console.log('Connected to database')
})
global.db = db

// Define our application-specific data
app.locals.appData = {appName: "Cocktail Canvas"}

// Load the route handlers
const mainRoutes = require("./routes/main")
app.use('/', mainRoutes)

// Load the route handlers for /users
const usersRoutes = require('./routes/users')
app.use('/users', usersRoutes)

// Load the route handlers for /menu
const menusRoutes = require('./routes/menus')
app.use('/menus', menusRoutes)

// Load the route handlers for /cocktail
const cocktailRoutes = require('./routes/cocktails')
app.use('/cocktails', cocktailRoutes)

// Load the route handlers for /api
const apiRoutes = require('./routes/api')
app.use('/api', apiRoutes)

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`))