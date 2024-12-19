// Create a new router
const express = require("express");
const router = express.Router();

// Handle our routes
router.get("/", function (req, res, next) {
	//assign this new databse data to the forumData object being passed to page
	let sessionData = {
		user: req.session.user,
	};
	res.render("index.ejs", sessionData);
});

router.get("/search", function (req, res, next) {
	let sessionData = {
		user: req.session.user,
	};
	res.render("search.ejs", sessionData);
});

router.post("/searchresult", async function (req, res, next) {
	const searchtype = req.body.type;
	const sqlquery = "";

	let sessionData = {
		user: req.session.user,
	};

	if (searchtype == "user") {
		sqlquery = `CALL search_for_user(?)`;
	} else if (searchtype == "menu") {
		sqlquery = `CALL search_for_menu(?)`;
	} else if (searchtype == "drink") {
		sqlquery = `CALL search_for_drink(?)`;
	} else {
		res.render("error.ejs", { message: "Unknown search type." });
	}

	if (sqlquery != "") {
		params = req.body.query;
		const results = await new Promise((resolve, reject) => {
			db.query(sqlquery, params, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);

					let resultData = {
						type: searchtype,
						results: results[0]
					};

					if (searchtype == "drink") {
						//initialise a drinkList for holding objects
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

						resultData.results = resDrinkList;
					}

					responseData = Object.assign({}, resultData, sessionData);
					res.render("searchresult.ejs", responseData);
				}
			});
		});
	}
});

router.get("/about", async function (req, res, next) {
	//return count of all users
	const users = await new Promise((resolve, reject) => {
		db.query(
			`SELECT COUNT(username) as user_count from users`,
			(error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			}
		);
	});

	//return count of all menus
	const menus = await new Promise((resolve, reject) => {
		db.query(
			`SELECT COUNT(menu_name) as menu_count from menus `,
			(error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			}
		);
	});

	//todo
	console.log(users);
	console.log(menus);

	let aboutData = {
		user_count: users[0].user_count,
		menu_count: menus[0].menu_count,
	};
	res.render("about.ejs", aboutData);
});

router.get("/logout", redirectLogin, (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.redirect("./");
		}
		res.redirect("/");
	});
});

// Export the router object so index.js can access it
module.exports = router;
