// Create a new router
const express = require("express")
const router = express.Router()

// Handle our api routes

router.get('/listmenus', async function(req, res, next){
    let sqlquery = `CALL get_all_menus()`

    results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

    let apiData = {
        menus: results[0]
    }

    res.json(apiData)
})

router.get('/listcompanies',function(req, res, next){
    //todo
    res.render('index.ejs')
})

router.get('/listusers', async function(req, res, next){
    let sqlquery = `CALL get_all_users()`

    results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

    let apiData = {
        users: results[0]
    }

    res.json(apiData)
})

router.get('/listdrinks',function(req, res, next){
    //todo
    res.render('index.ejs')
})

router.get('/popstats',function(req, res, next){
    //todo
    res.render('index.ejs')
})




// Export the router object so index.js can access it
module.exports = router