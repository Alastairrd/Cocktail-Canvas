// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");

//base api route
router.get("/", async function (req, res, next) {
	
	//list of routes
	//todo update and correct
	let apiData = {
		version: "0.1",
		links: {
			users: "https://doc.gold.ac.uk/usr/717/api/users",
			menus: "https://doc.gold.ac.uk/usr/717/api/menus",
			drinks: "https://doc.gold.ac.uk/usr/717/api/drinks",
			ingredients: "https://doc.gold.ac.uk/usr/717/api/ingredients",
			glass: "https://doc.gold.ac.uk/usr/717/api/ingredients"
		}
	}

	res.json(apiData);
});

//////////////
// USERS API//
/////////////

//list all users
router.get("/users", async function (req, res, next) {
	//list of routes
	//todo update and correct
	let apiData = {
		version: "0.1",
		links: {
			register: "https://doc.gold.ac.uk/usr/717/api/users/register",
			register_info: "POST REQUEST // Required parameters: password (length 8 - 24), username (length 8 - 16) // Optional parameters: " +
			"email: (valid, max length 320), company: (max length 64), first: (max length 20), last: (max length 30)",
			find: "https://doc.gold.ac.uk/usr/717/api/users/find",
			update: "https://doc.gold.ac.uk/usr/717/api/users/update",
			delete: "https://doc.gold.ac.uk/usr/717/api/users/delete",
			list: "https://doc.gold.ac.uk/usr/717/api/users/list"
		}
	}

	res.json(apiData);
});

router.post(
	"/users/register",
	[
		check("email").isLength({max: 320}).isEmail(),
		check("password").isLength({ min: 8, max: 24 }).notEmpty(),
		check("username").isLength({ min: 8, max: 16 }).notEmpty(),
		check("company").isLength({ max: 64 }),
		check("first").isLength({max: 20}),
		check("last").isLength({max: 30}),
	],
	function (req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
			res.json({error: errors});
		} else {
			//salting and hashing password
			const saltRounds = 10;
			const plainPassword = req.body.password;

			bcrypt.hash(
				plainPassword,
				saltRounds,
				function (err, hashedPassword) {
					// Store hashed password in your database.
					let sqlquery =
						"INSERT INTO users (username, firstName, lastName, email, company, hashedPassword) VALUES (?,?,?,?,?,?)";
					// execute sql query
					let newrecord = [
						req.sanitize(req.body.username),
						req.sanitize(req.body.first),
						req.sanitize(req.body.last),
						req.body.email,
						req.body.company,
						hashedPassword,
					];
					db.query(sqlquery, newrecord, (err, result) => {
						if (err) {
							console.log("Error posting");
							next(err);
						}
						//result message
						else
							result =
								"Hello " +
								req.sanitize(req.body.first) +
								" " +
								req.sanitize(req.body.last) +
								" you are now registered!  We will send an email to you at " +
								req.body.email
						res.json({result_message: result});
					});
				}
			);
		}
	}
);


//list all users
router.get("/listusers", async function (req, res, next) {
	let sqlquery = `CALL get_all_users()`;
	//todo include count

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
