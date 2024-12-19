// Create a new router
const express = require("express");
const router = express.Router();

//base api route
router.get("/", async function (req, res, next) {
	
	//list of routes
	//todo update and correct
	let apiData = {
		version: "0.1",
		links: {
			users: "https://doc.gold.ac.uk/usr/717/api/listusers",
			menus: "https://doc.gold.ac.uk/usr/717/api/listmenus",
			drinkCount: "https://doc.gold.ac.uk/usr/717/api/listdrinksbycount",
			ingredientCount: "https://doc.gold.ac.uk/usr/717/api/listingrbycount"
		}
	}

	res.json(apiData);
});

// Handle our api routes
router.get("/listmenus", async function (req, res, next) {
	let sqlquery = `CALL get_all_menus()`;

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
		menus: results[0],
	};

	res.json(apiData);
});

//list all users
router.get("/listusers", async function (req, res, next) {
	let sqlquery = `CALL get_all_users()`;

	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
                res.send("Error in API request from database.")
			} else {
				resolve(results);

				let apiData = {
					users: results[0],
				};

				res.json(apiData);
			}
		});
	});
});

//returns name of drinks and number of menus featured in
router.get("/listdrinksbycount", async function (req, res, next) {
	let sqlquery = `CALL list_drinks_by_count()`;
    results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
                res.send("Error in API request from database.")
			} else {
				resolve(results);

				let apiData = {
					drink_results: results[0],
				};

				res.json(apiData);
			}
		});
	});
});

//returns all ingredients by how many times featured in drinks
router.get("/listingrbycount", async function (req, res, next) {
	let sqlquery = `CALL list_ingr_by_count()`;
    results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
                res.send("Error in API request from database.")
			} else {
				resolve(results);

				let apiData = {
					ingr_results: results[0],
				};

				res.json(apiData);
			}
		});
	});
});

// Export the router object so index.js can access it
module.exports = router;
