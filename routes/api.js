// Create a new router
const express = require("express")
const router = express.Router()

// Handle our api routes

router.get('listmenus',function(req, res, next){
    //todo
    res.render('index.ejs')
})

router.get('listcompanies',function(req, res, next){
    //todo
    res.render('index.ejs')
})

router.get('listusers',function(req, res, next){
    //todo
    res.render('index.ejs')
})

router.get('listdrinks',function(req, res, next){
    //todo
    res.render('index.ejs')
})

router.get('popstats',function(req, res, next){
    //todo
    res.render('index.ejs')
})




// Export the router object so index.js can access it
module.exports = router