// Create a new router
const express = require("express");
const router = express.Router();

// Handle our routes
//index page
router.get("/", function (req, res, next) {
	let sessionData = {
		user: req.session.user,
	};
	res.render("index.ejs", sessionData);
});

//list page, display lists for users,drinks,menus
router.get("/list", async function (req, res, next) {
	let listData = { //initialise
		users: [],
		menus: [],
		drinkList: [],
		user_count: 0,
		menu_count: 0,
		drink_count: 0,
		user: req.session.user
	};

	try {
		//first get counts for all lists
		//return count of all users
		const usersCount = await new Promise((resolve, reject) => {
			db.query(`CALL get_user_count()`, (error, results) => {
				if (error) {
					reject(error);
					throw new Error(error)
				} else {
					resolve(results);
				}
			});
		});
		listData.user_count = usersCount[0][0].user_count

		//return count of all menus
		const menusCount = await new Promise((resolve, reject) => {
			db.query(`CALL get_menu_count()`, (error, results) => {
				if (error) {
					reject(error);
					throw new Error(error)
				} else {
					resolve(results);
				}
			});
		});
		listData.menu_count = menusCount[0][0].menu_count

		//return count of all drinks
		const drinksCount = await new Promise((resolve, reject) => {
			db.query(`CALL get_drink_count()`, (error, results) => {
				if (error) {
					reject(error);
					throw new Error(error)
				} else {
					resolve(results);
				}
			});
		});
		listData.drink_count = drinksCount[0][0].drink_count

		//then get all list data
		let sqlquery = "CALL get_all_users()"; // query database to get all the users
		const users = await new Promise((resolve, reject) => {
			db.query(sqlquery, (error, results) => {
				if (error) {
					reject(error);
					throw new Error(error)
				} else {
					resolve(results);
				}
			});
		});
		listData.users = users[0]

		//return all menus
		sqlquery = "CALL get_all_menus()";
		const menus = await new Promise((resolve, reject) => {
			db.query(sqlquery, (error, results) => {
				if (error) {
					reject(error);
					throw new Error(error)
				} else {
					resolve(results);
				}
			});
		});
		listData.menus = menus[0]

		//return all drinks
		sqlquery = "CALL get_all_drinks()";
		let resDrinkList = [];
		const drinks = await new Promise((resolve, reject) => {
			db.query(sqlquery, (error, results) => {
				if (error) {
					reject(error);
					throw new Error(error)
				} else {
					resolve(results);

					//turns drink sql row data into object featuring lists for ingredients and measurements for ease of html display
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

					
				}
			});
		});
		listData.drinkList = resDrinkList //final drink list for rendering
		res.render("list.ejs", listData);

	} catch (error) {
		res.render("error.ejs", {message: error.message, user: req.session.user})
	}

	
});

//search page
router.get("/search",function (req, res, next) {
	let sessionData = {
		user: req.session.user,
	};
	res.render("search.ejs", sessionData);
});

//page for search results
router.post("/searchresult", async function (req, res, next) {
	let searchtype = req.body.type;
	let sqlquery = "";

	let sessionData = {
		user: req.session.user,
	};

	//type of search dictates query
	if (searchtype == "user") {
		sqlquery = `CALL search_for_user(?)`;
	} else if (searchtype == "menu") {
		sqlquery = `CALL search_for_menu(?)`;
	} else if (searchtype == "drink") {
		sqlquery = `CALL search_for_drink(?)`;
	} else {
		res.render("error.ejs", { user: req.session.user, message: "Unknown search type." });
	}

	//once we have our query, make appropriate search
	if (sqlquery != "") {
		params = req.body.keyword;
		const results = await new Promise((resolve, reject) => {
			db.query(sqlquery, params, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);

					let resultData = {
						type: searchtype,
						results: results[0],
					};

					if (searchtype == "drink") {
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
									ingredients: [entry.ingr_name],
									measurements: [entry.measure],
								});
							} else {
								//if we have an existing drink object in drink list with matching menu id, add ingredients and measure to lsits
								existingDrink.ingredients.push(entry.ingr_name);
								existingDrink.measurements.push(entry.measure);
							}
						});

						resultData.results = resDrinkList;
					}

					responseData = Object.assign({}, resultData, sessionData);

					res.render("searchresult.ejs", responseData); //render page with relevant search data
				}
			});
		});
	}
});

//about page
router.get("/about", async function (req, res, next) {
	//return count of all users
	const users = await new Promise((resolve, reject) => {
		db.query(`CALL get_user_count()`, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

	//return count of all menus
	const menus = await new Promise((resolve, reject) => {
		db.query(`CALL get_menu_count()`, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

	//return count of all drink
	const drinks = await new Promise((resolve, reject) => {
		db.query(`CALL get_drink_count()`, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

	//stats for display on about page
	let aboutData = {
		user_count: users[0][0].user_count,
		menu_count: menus[0][0].menu_count,
		drink_count: drinks[0][0].drink_count,
		user: req.session.user
	};

	res.render("about.ejs", aboutData);
});

//logout page, removes session
router.get("/logout", redirectLogin, (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.redirect("users/login");
		}
		res.redirect("users/login");
	});
});

// Export the router object so index.js can access it
module.exports = router;
