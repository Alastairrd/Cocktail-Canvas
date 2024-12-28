// Create a new router
const express = require("express");
const router = express.Router();

router.get("/view", async function (req, res, next) {
	const menuId = req.query.menuId;
	let results;
	let menuInfo;

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

		console.log(menuInfo);

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
		res.render("error.ejs", { message: error });
		return;
	}

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

	let menuData = {
		drinkList: resDrinkList,
		menu_id: menuId,
		menu_name: menuInfo[0][0].menu_name,
		menu_desc: menuInfo[0][0].menu_desc,
		user: req.session.user,
	};
	res.render("viewmenu.ejs", menuData);
});

router.get("/create", redirectLogin, function (req, res, next) {
	let sessionData = {
		user: req.session.user,
	};

	res.render("createmenu.ejs", sessionData);
});

router.post("/create", redirectLogin, async function (req, res, next) {
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

	res.redirect("/editlist");
});

router.get("/editmenu", redirectLogin, async function (req, res, next) {
	const menuId = req.query.menu_id;

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

	//else is owner of menu
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
	};
	res.render("editmenu.ejs", menuData);
});

router.get("/editlist", redirectLogin, async function (req, res, next) {
	//user id
	const userId = req.session.user_id;
	const sqlquery = `CALL get_menu_list_for_user(?)`;

	//query db for current menu list
	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, userId, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

	//send back info for menus
	menuListData = { menuList: results[0], user: req.session.user };
	res.render("editlist.ejs", menuListData);
});

//route for adding a cocktail to menu either from custom creation or DB
router.post(
	"/add-cocktail-to-menu",
	redirectLogin,
	async function (req, res, next) {
		console.log("made it into request");
		console.log(req.body);
		//setup variables
		const cocktailName = req.body.add_cocktail_name;
		const cocktailMethod = req.body.add_cocktail_method;
		const cocktailGlass = req.body.add_cocktail_glass;
		const cocktailPrice = req.body.add_cocktail_price;
		const jsonIngrMeas = JSON.stringify({
			ingredients: req.body.ingredients,
			measurements: req.body.measurements,
		});
		const menuId = req.body.menu_id;

		//variables for query
		const sqlquery = `CALL add_cocktail_from_db(?,?,?,?,?,?)`;
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
				} else {
					resolve(results);
				}
			});
		});

		res.redirect(`/menus/editmenu?menu_id=${menuId}`);
	}
);

// Export the router object so index.js can access it
module.exports = router;
