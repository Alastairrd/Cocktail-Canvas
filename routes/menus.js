// Create a new router
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

//view menu page
router.get("/view", async function (req, res, next) {
	const menuId = req.query.menuId;
	let results;
	let menuInfo;

	//first get menu based on id
	try {
		let menuSqlQuery = `CALL get_menu(?)`;
		menuInfo = await new Promise((resolve, reject) => {
			db.query(menuSqlQuery, menuId, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});

		//get drinks assosicated with menu
		menuSqlQuery = `CALL get_current_drink_list(?)`;
		results = await new Promise((resolve, reject) => {
			db.query(menuSqlQuery, menuId, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	} catch (error) {
		res.render("error.ejs", { user: req.session.user, message: error });
		return;
	}

	//initialise a drinkList for holding objects
	//turns drink sql row data into object featuring lists for ingredients and measurements for ease of html display
	let resDrinkList = [];
	results[0].forEach((entry) => {
		//find if there is an object in drink list with a matching id already
		let existingDrink = resDrinkList.find(
			(drink) => drink.drink_id === entry.drink_id
		);

		//if not
		if (!existingDrink) {
			//create an object, take necessary details from entry
			resDrinkList.push({
				drink_id: entry.drink_id,
				drink_name: entry.drink_name,
				drink_method: entry.drink_method,
				drink_glass: entry.glass_name,
				drink_price: entry.price,
				ingredients: [entry.ingr_name],
				measurements: [entry.measure],
			});
		} else {
			//if we have an existing drink object in drink list with matching menu id, add ingredients and measure to lsits
			existingDrink.ingredients.push(entry.ingr_name);
			existingDrink.measurements.push(entry.measure);
		}
	});

	let menuData = {
		drinkList: resDrinkList,
		menu_id: menuId,
		menu_name: menuInfo[0][0].menu_name,
		menu_desc: menuInfo[0][0].menu_desc,
		user: req.session.user,
	};
	res.render("viewmenu.ejs", menuData); //render page with all necessary data
});

//create menu page
router.get("/create", redirectLogin, function (req, res, next) {
	let sessionData = {
		user: req.session.user,
		errors: [],
	};

	res.render("createmenu.ejs", sessionData);
});

//route for handling creation of a menu
router.post(
	"/create",
	redirectLogin,
	[
		check("menu_name").notEmpty().trim().isLength({ max: 50 }),

		check("menu_desc").trim().isLength({ max: 256 }),
	],
	async function (req, res, next) {
		//validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
			res.render("createmenu.ejs", {
				errors: errors.array(),
				user: req.session.user,
			});
			return;
		}

		//setup variables
		const menuName = req.body.menu_name;
		const menuDesc = req.body.menu_desc;
		const userId = req.session.user_id;

		//variables for query
		const sqlquery = `CALL create_menu_proc(?,?,?)`;
		const params = [menuName, menuDesc, userId];

		results = await new Promise((resolve, reject) => {
			db.query(sqlquery, params, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});

		res.redirect("../menus/editlist"); //redirect to list of menus to edit
	}
);

//edit menu page, allows adding custom cocktails, searching api and adding results to menu,
//as well as searching internal db for existing drinks to add to menu
router.get("/editmenu", redirectLogin, async function (req, res, next) {
	const menuId = req.query.menu_id;

	//first check menu belongs to user
	const sqlQuery = `CALL check_menu_against_user(?,?)`;
	let params = [menuId, req.session.user_id];
	checkResults = await new Promise((resolve, reject) => {
		db.query(sqlQuery, params, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

	//if not owner of menu
	if (!checkResults[0][0].is_owner) {
		res.render("error.ejs", {
			message: "Menu does not belong to this user.",
			user: req.session.user,
		});
		return;
	}

	//else is owner of menu, get drinks list for menu
	const menuSqlQuery = `CALL get_current_drink_list(?)`;
	results = await new Promise((resolve, reject) => {
		db.query(menuSqlQuery, menuId, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

	//initialise a drinkList for holding objects
	//turns drink sql row data into object featuring lists for ingredients and measurements for ease of html display
	let resDrinkList = [];
	results[0].forEach((entry) => {
		//find if there is an object in drink list with a matching id already
		let existingDrink = resDrinkList.find(
			(drink) => drink.drink_id === entry.drink_id
		);

		//if not
		if (!existingDrink) {
			//create an object, take necessary details from entry
			resDrinkList.push({
				drink_id: entry.drink_id,
				drink_name: entry.drink_name,
				drink_method: entry.drink_method,
				drink_glass: entry.glass_name,
				drink_price: entry.price,
				ingredients: [entry.ingr_name],
				measurements: [entry.measure],
			});
		} else {
			//if we have an existing drink object in drink list with matching menu id, add ingredients and measure to lsits
			existingDrink.ingredients.push(entry.ingr_name);
			existingDrink.measurements.push(entry.measure);
		}
	});

	let menuData = {
		drinkList: resDrinkList,
		menu_id: menuId,
		user: req.session.user,
		errors: [],
	};
	res.render("editmenu.ejs", menuData); //render editmenu page with relevant data
});

//list of menus to edit
router.get("/editlist", redirectLogin, async function (req, res, next) {
	const userId = req.session.user_id;
	const sqlquery = `CALL get_menu_list_for_user(?)`; //gets all menus owned by logged in user

	//query db for current menu list
	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, userId, (error, results) => {
			if (error) {
				reject(error);
				console.log(error.message);
			} else {
				resolve(results);
			}
		});
	});

	//send back info for menus
	menuListData = { menuList: results[0], user: req.session.user };
	res.render("editlist.ejs", menuListData);
});

//route for adding a cocktail to menu either from custom creation, API, or internal DB
//returns json results handled by functions
router.post(
	"/add-cocktail-to-menu",
	redirectLogin,
	[
		//validate drink name
		check("drink_name")
			.notEmpty()
			.withMessage("Drink name must not be empty.")
			.trim()
			.isLength({ max: 64 })
			.withMessage("Drink name cannot be more than 64 characters."),

		//validate method
		check("drink_method")
			.notEmpty()
			.withMessage("Method must not be empty.")
			.trim()
			.isLength({ max: 512 })
			.withMessage("Method cannot be more than 512 characters."),

		//validate glass
		check("drink_glass")
			.notEmpty()
			.withMessage("Glass must not be empty.")
			.trim()
			.isLength({ max: 32 })
			.withMessage("Glass name cannot be more than 32 characters."),

		//validate ingredients array
		check("ingredients")
			.isArray({ min: 1 })
			.withMessage("At least one ingredient is required."),

		//validate each ingredient
		check("ingredients.*")
			.trim()
			.notEmpty()
			.withMessage("Ingredient cannot be empty.")
			.isLength({ max: 50 })
			.withMessage("Ingredient cannot be more than 50 characters."),

		//check measurements array
		check("measurements")
			.isArray({ min: 1 })
			.withMessage("At least one measurement is required."),

		//measurement validation for array entries
		check("measurements.*")
			.trim()
			.notEmpty()
			.withMessage("Measurement cannot be empty.")
			.isLength({ max: 50 })
			.withMessage("Measurement canot be more than 50 characters."),

		//check ingredients and measurements have same length
		check().custom((value, { req }) => {
			//check they are arrays first before length comparison
			if (
				!Array.isArray(req.body.ingredients) ||
				!Array.isArray(req.body.measurements)
			) {
				return true;
			}

			if (req.body.ingredients.length !== req.body.measurements.length) {
				throw new Error(
					"Ingredients and measurements count must match."
				);
			}
			return true;
		}),
	],
	async function (req, res, next) {
		//validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({ errors: errors.array() });
			return;
		}

		//also check menu ownership
		const sqlQuery = `CALL check_menu_against_user(?,?)`;
		const menuParams = [req.body.menu_id, req.session.user_id];
		checkResults = await new Promise((resolve, reject) => {
			db.query(sqlQuery, menuParams, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});

		//if not owner of menu
		if (!checkResults[0][0].is_owner) {
			res.status(400).json({
				errors: [
					{ msg: "Menu does not belong to this user.", path: "menu" },
				],
			});
			return;
		}

		//check where cocktail is coming from
		try {
			//if cocktail exists in db already
			if (req.body.drink_id != -1) {
				//check if drink is already in menu
				let sqlquery = `CALL get_current_drink_list(?)`;
				let params = [req.body.menu_id];

				results = await new Promise((resolve, reject) => {
					db.query(sqlquery, params, (error, results) => {
						if (error) {
							console.log(error);
							reject(error);
						} else {
							resolve(results);
						}
					});
				});
				console.log("logging curent drink list");
				console.log(results);
				console.log("end current list");
				const exists = results[0].some(row => row.drink_id == req.body.drink_id);

				if(exists){
					res.status(400).send("Drink already exists in menu.");
					return;
				}

				//otherwise add to menu
				sqlquery = `CALL add_existing_drink_to_menu(?, ?)`;
				params = [req.body.drink_id, req.body.menu_id];

				results = await new Promise((resolve, reject) => {
					db.query(sqlquery, params, (error, results) => {
						if (error) {
							console.log(error);
							reject(error);
						} else {
							resolve(results);
						}
					});
				});

				res.status(200).send("OK");
				return;
			}
		} catch (error) {
			console.log(error);
			res.status(400).json({
				errors: [{ msg: error.message, path: "internal" }],
			});
			return;
		}

		//else add new cocktail to db
		//setup variables
		const cocktailName = req.body.drink_name;
		const cocktailMethod = req.body.drink_method;
		const cocktailGlass = req.body.drink_glass;
		const cocktailPrice = req.body.drink_price;
		const jsonIngrMeas = JSON.stringify({
			ingredients: req.body.ingredients,
			measurements: req.body.measurements,
		});
		const menuId = req.body.menu_id;

		//variables for adding cocktail query
		const sqlquery = `CALL add_drink_to_db(?,?,?,?,?,?)`;
		const params = [
			cocktailName,
			cocktailMethod,
			cocktailGlass,
			cocktailPrice,
			jsonIngrMeas,
			menuId,
		];
		results = await new Promise((resolve, reject) => {
			db.query(sqlquery, params, (error, results) => {
				if (error) {
					console.log(error);
					reject(error);
					res.status(400).json({
						errors: [{ msg: error.message, path: "internal" }],
					});
				} else {
					resolve(results);
				}
			});
		});

		res.status(200).send("OK");
	}
);

//remove a drink from menu
router.post(
	"/remove-cocktail-from-menu",
	redirectLogin,
	async function (req, res, next) {
		try {
			const menuId = req.body.menu_id;

			//check menu ownership
			let sqlQuery = `CALL check_menu_against_user(?,?)`;
			let params = [menuId, req.session.user_id];
			checkResults = await new Promise((resolve, reject) => {
				db.query(sqlQuery, params, (error, results) => {
					if (error) {
						reject(error);
					} else {
						resolve(results);
					}
				});
			});

			//if not owner of menu
			if (!checkResults[0][0].is_owner) {
				res.status(403).send("User is not owner of menu.");
				return;
			}

			//remove based on drink and menu id
			sqlQuery = `CALL remove_drink_from_menu(?, ?)`;
			params = [req.body.drink_id, req.body.menu_id];
			//query db for current menu list
			results = await new Promise((resolve, reject) => {
				db.query(sqlQuery, params, (error, results) => {
					if (error) {
						reject(error);
						res.status(500).send(
							"Unable to remove drink from menu."
						);
						return;
					} else {
						resolve(results);

						res.status(200).send("OK");
					}
				});
			});
		} catch (error) {
			res.status(500).send(error.message);
		}
	}
);

// Export the router object so index.js can access it
module.exports = router;
