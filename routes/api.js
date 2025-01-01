// Create a new router
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const apiVersion = 0.1;

//base api route
router.get("/", async function (req, res, next) {
	//list of routes
	let apiData = {
		version: "0.1",
		links: {
			users: "https://doc.gold.ac.uk/usr/717/api/users",
			menus: "https://doc.gold.ac.uk/usr/717/api/menus",
			drinks: "https://doc.gold.ac.uk/usr/717/api/drinks",
			ingredients: "https://doc.gold.ac.uk/usr/717/api/ingredients",
		},
	};

	res.json(apiData);
});

//////////////
// USERS API//
/////////////

//list all links in users api
router.get("/users", async function (req, res, next) {
	//return count of all users
	const usersCount = await new Promise((resolve, reject) => {
		db.query(`CALL get_user_count()`, (error, results) => {
			if (error) {
				reject(error);
				throw new Error(error);
			} else {
				resolve(results);
			}
		});
	});

	//list of routes
	let apiData = {
		version: apiVersion,
		total_users: usersCount[0][0].user_count
			? usersCount[0][0].user_count
			: "Error in user count",
		links: {
			register: "https://doc.gold.ac.uk/usr/717/api/users/register",
			register_info:
				"POST REQUEST // Required parameters: `password` (length 8 - 24), `username` (length 8 - 16) // Optional parameters: " +
				"`email`: (valid, max length 320), `company`: (max length 64), `first`: (max length 20), `last`: (max length 30)",
			get: "https://doc.gold.ac.uk/usr/717/api/users/get?user_id=",
			get_info: "GET REQUEST // Required paramaters: `user_id` (INT)",
			search: "https://doc.gold.ac.uk/usr/717/api/users/search?keyword=",
			search_info:
				"GET REQUEST // Required parameters: `keyword` (max length 50)",
			list: "https://doc.gold.ac.uk/usr/717/api/users/list",
			list_info: "GET REQUEST // Required parameters: N/A",
		},
	};

	res.json(apiData);
});

router.post(
	"/register",
	[
		check("email").isEmail().normalizeEmail().trim(),

		check("password").isLength({ min: 8, max: 24 }).notEmpty(),

		check("username")
			.notEmpty()
			.trim()
			.escape()
			.isLength({ min: 8, max: 16 }),

		check("company").trim().escape().isLength({ max: 64 }),

		check("first").trim().escape(),
		check("last").trim().escape(),
	],
	async function (req, res, next) {
		//input validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
			res.json({
				errors: errors.array(),
			});
			return;
		} else {
			//check username is unique
			const username = req.body.username;
			let params = [username];
			let sqlquery = `CALL get_user_login_details(?)`;
			const results = await new Promise((resolve, reject) => {
				db.query(sqlquery, params, (error, results) => {
					if (error) {
						reject(error);
					} else {
						resolve(results);
					}
				});
			});

			//if user found for that username
			if (results[0].length != 0) {
				res.json({
					errors: { msg: "Username taken.", path: "username" },
				});
				return;
			}
			//salting and hashing password
			const saltRounds = 10;
			const plainPassword = req.body.password;

			bcrypt.hash(
				plainPassword,
				saltRounds,
				function (err, hashedPassword) {
					// Store hashed password in your database.
					let sqlquery = `CALL create_user(?,?,?,?,?,?)`;
					// execute sql query
					let newrecord = [
						req.body.username,
						req.body.first,
						req.body.last,
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
								req.body.first +
								" " +
								req.body.last +
								" you are now registered!  We will send an email to you at " +
								req.body.email;
						res.json({
							result_message: result,
							result: "success",
							username: req.body.username,
							firstName: req.body.first,
							lastName: req.body.last,
							email: req.body.email,
							company: req.body.company,
						});
					});
				}
			);
		}
	}
);

//user get
router.get("/users/get", [check("user_id").trim().escape()], async function (req, res, next) {
	const userId = req.query.user_id;
	let userInfo;

	try {
		let userSqlQuery = `CALL get_user(?)`;
		userInfo = await new Promise((resolve, reject) => {
			db.query(userSqlQuery, userId, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	} catch (error) {
		res.json({ error: error.message });
		return;
	}

	let apiData = { user_info: userInfo[0] };

	res.json(apiData);
});

//user search
router.get(
	"/users/search",
	[check("keyword").trim().escape()],
	async function (req, res, next) {
		let sqlquery = `CALL search_for_user(?)`;
		let keyword;
		if (!req.query.keyword || req.query.keyword.length < 1) {
			keyword = "";
		} else {
			keyword = req.query.keyword;
		}

		results = await new Promise((resolve, reject) => {
			db.query(sqlquery, keyword, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);

					let apiData = {
						users: results[0],
					};

					res.json(apiData);
				}
			});
		});
	}
);

//list all users
router.get("/users/list", async function (req, res, next) {
	let sqlquery = `CALL get_all_users()`;

	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
				res.json({ error: error });
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

/////////////
// MENUS  //
//////////////

//menu base listing all links
router.get("/menus", async function (req, res, next) {
	//return count of all menus
	const menusCount = await new Promise((resolve, reject) => {
		db.query(`CALL get_menu_count()`, (error, results) => {
			if (error) {
				reject(error);
				throw new Error(error);
			} else {
				resolve(results);
			}
		});
	});

	//list of routes
	let apiData = {
		version: apiVersion,
		menu_count: menusCount[0][0].menu_count
			? menusCount[0][0].menu_count
			: "Error in menu count",
		links: {
			get: "https://doc.gold.ac.uk/usr/717/api/menus/get?menu_id=",
			get_info: "GET REQUEST // Required parameters: `menu_id` (INT)",
			search: "https://doc.gold.ac.uk/usr/717/api/menus/search?keyword=",
			search_info:
				"GET REQUEST // Required parameters: `keyword` (max length 16)",
			list: "https://doc.gold.ac.uk/usr/717/api/menus/list",
			list_info: "GET REQUEST // Required parameters: N/A",
		},
	};

	res.json(apiData);
});

//get menu
router.get("/menus/get", [check("menu_id").trim().escape()], async function (req, res, next) {
	const menuId = req.query.menu_id;
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
		res.json({ error: error.message });
		return;
	}

	let apiData = { menu_info: menuInfo[0][0], drinklist: results[0] };

	res.json(apiData);
});

//menu search
router.get(
	"/menus/search",
	[check("keyword").trim().escape()],
	async function (req, res, next) {
		let keyword;
		if (!req.query.keyword || req.query.keyword.length < 1) {
			keyword = "";
		} else {
			keyword = req.query.keyword;
		}
		try {
			let sqlquery = `CALL search_for_menu(?)`;

			results = await new Promise((resolve, reject) => {
				db.query(sqlquery, keyword, (error, results) => {
					if (error) {
						reject(error);
					} else {
						resolve(results);

						let apiData = {
							menus: results[0],
						};

						res.json(apiData);
					}
				});
			});
		} catch (error) {
			res.json({ error: error.message });
			return;
		}
	}
);

//list menus
router.get("/menus/list", async function (req, res, next) {
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

/////////////
// DRINKS  //
/////////////

//drink base listing all links
router.get("/drinks", async function (req, res, next) {
	//return count of all drinks
	const drinksCount = await new Promise((resolve, reject) => {
		db.query(`CALL get_drink_count()`, (error, results) => {
			if (error) {
				reject(error);
				throw new Error(error);
			} else {
				resolve(results);
			}
		});
	});

	//list of routes
	let apiData = {
		version: apiVersion,
		drink_count: drinksCount[0][0].drink_count
			? drinksCount[0][0].drink_count
			: "Error in drink count",
		links: {
			get: "https://doc.gold.ac.uk/usr/717/api/drinks/get?drink_id=",
			get_info: "GET REQUEST // Required parameters: `drink_id` (INT)",
			search: "https://doc.gold.ac.uk/usr/717/api/drinks/search?keyword=",
			search_info:
				"GET REQUEST // Required parameters: `keyword` (max length 64)",
			list: "https://doc.gold.ac.uk/usr/717/api/drinks/list",
			list_info: "GET REQUEST // Required parameters: N/A",
			listbycount:
				"https://doc.gold.ac.uk/usr/717/api/drinks/listbycount",
			listbycount_info: "GET REQUEST // Required parameters: N/A",
		},
	};

	res.json(apiData);
});

//get drinks
router.get("/drinks/get", [check("drink_id").trim().escape()], async function (req, res, next) {
	const drinkId = req.sanitize(req.query.drink_id);
	let results;
	let drinkInfo;

	try {
		let drinkSqlQuery = `CALL get_drink(?)`;
		drinkInfo = await new Promise((resolve, reject) => {
			db.query(drinkSqlQuery, drinkId, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});

		drinkSqlQuery = `CALL get_current_drink_list(?)`;
		results = await new Promise((resolve, reject) => {
			db.query(drinkSqlQuery, drinkId, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	} catch (error) {
		res.json({ error: error.message });
		return;
	}

	let apiData = { drink_info: drinkInfo[0][0], drinklist: results[0] };

	res.json(apiData);
});

//search drinks
router.get(
	"/drinks/search",
	[check("keyword").trim().escape()],
	async function (req, res, next) {
		let keyword;
		if (!req.query.keyword || req.query.keyword.length < 1) {
			keyword = "";
		} else {
			keyword = req.query.keyword;
		}
		try {
			let sqlquery = `CALL search_for_drink(?)`;

			results = await new Promise((resolve, reject) => {
				db.query(sqlquery, keyword, (error, results) => {
					if (error) {
						reject(error);
					} else {
						resolve(results);

						let apiData = {
							drinks: results[0],
						};

						res.json(apiData);
					}
				});
			});
		} catch (error) {
			res.json({ error: error.message });
			return;
		}
	}
);

//list all drinks
router.get("/drinks/list", async function (req, res, next) {
	let sqlquery = `CALL get_all_drinks()`;

	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
				res.send("Error in API request from database.");
			} else {
				resolve(results);

				let apiData = {
					drinks: results[0],
				};

				res.json(apiData);
			}
		});
	});
});

//returns name of drinks and number of menus featured in
router.get("/drinks/listbycount", async function (req, res, next) {
	let sqlquery = `CALL list_drinks_by_count()`;
	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
				res.send("Error in API request from database.");
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

/////////////////
// INGREDIENTS //
/////////////////

//ingr base listing all links
router.get("/ingredients", async function (req, res, next) {
	//return count of all ingrs
	const ingrsCount = await new Promise((resolve, reject) => {
		db.query(`CALL get_ingr_count()`, (error, results) => {
			if (error) {
				reject(error);
				throw new Error(error);
			} else {
				resolve(results);
			}
		});
	});

	//list of routes
	let apiData = {
		version: apiVersion,
		ingredient_count: ingrsCount[0][0].ingr_count,
		links: {
			get: "https://doc.gold.ac.uk/usr/717/api/ingredients/get?ingr_id=",
			get_info: "GET REQUEST // Required parameters: `ingr_id` (INT)",
			search: "https://doc.gold.ac.uk/usr/717/api/ingredients/search?keyword=",
			search_info:
				"GET REQUEST // Required parameters: `keyword` (max length 64)",
			list: "https://doc.gold.ac.uk/usr/717/api/ingredients/list",
			list_info: "GET REQUEST // Required parameters: N/A",
			listbycount:
				"https://doc.gold.ac.uk/usr/717/api/ingredients/listbycount",
			listbycount_info: "GET REQUEST // Required parameters: N/A",
		},
	};

	res.json(apiData);
});

//get ingredients
router.get("/ingredients/get", [check("ingr_id").trim().escape()], async function (req, res, next) {
	const ingrId = req.sanitize(req.query.ingr_id);
	let ingrInfo;

	try {
		let ingrSqlQuery = `CALL get_ingr(?)`;
		ingrInfo = await new Promise((resolve, reject) => {
			db.query(ingrSqlQuery, ingrId, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	} catch (error) {
		res.json({ error: error.message });
		return;
	}

	let apiData = { ingredient: ingrInfo[0] };

	res.json(apiData);
});

//search ingredients
router.get("/ingredients/search", [check("keyword").trim().escape()],async function (req, res, next) {
	let keyword;
		if (!req.query.keyword || req.query.keyword.length < 1) {
			keyword = "";
		} else {
			keyword = req.query.keyword;
		}
	try {
		let sqlquery = `CALL search_for_ingr(?)`;

		results = await new Promise((resolve, reject) => {
			db.query(sqlquery, keyword, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);

					let apiData = {
						ingredients: results[0],
					};

					res.json(apiData);
				}
			});
		});
	} catch (error) {
		res.json({ error: error.message });
		return;
	}
});

//list all ingredients
router.get("/ingredients/list", async function (req, res, next) {
	let sqlquery = `CALL get_all_ingrs()`;

	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
				res.send("Error in API request from database.");
			} else {
				resolve(results);

				let apiData = {
					ingredients: results[0],
				};

				res.json(apiData);
			}
		});
	});
});

//returns all ingredients by how many times featured in drinks
router.get("/ingredients/listbycount", async function (req, res, next) {
	let sqlquery = `CALL list_ingr_by_count()`;
	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
				res.send("Error in API request from database.");
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

/////////////////
// GLASS //
/////////////////

//glass base listing all links
router.get("/glasses", async function (req, res, next) {
	//return count of all glasses
	const ingrsCount = await new Promise((resolve, reject) => {
		db.query(`CALL get_glass_count()`, (error, results) => {
			if (error) {
				reject(error);
				throw new Error(error);
			} else {
				resolve(results);
			}
		});
	});

	//list of routes for glasses
	let apiData = {
		version: apiVersion,
		glass_count: glassesCount[0][0].glass_count,
		links: {
			get: "https://doc.gold.ac.uk/usr/717/api/glasses/get?glass_id=",
			get_info: "GET REQUEST // Required parameters: `glass_id` (INT)",
			search: "https://doc.gold.ac.uk/usr/717/api/glasses/search?keyword=",
			search_info:
				"GET REQUEST // Required parameters: `keyword` (max length 32)",
			list: "https://doc.gold.ac.uk/usr/717/api/glasses/list",
			list_info: "GET REQUEST // Required parameters: N/A",
			listbycount:
				"https://doc.gold.ac.uk/usr/717/api/glasses/listbycount",
			listbycount_info: "GET REQUEST // Required parameters: N/A",
		},
	};

	res.json(apiData);
});

//get glass
router.get("/glasses/get", [check("glass_id").trim().escape()], async function (req, res, next) {
	const glassId = req.sanitize(req.query.glass_id);
	let glassInfo;

	try {
		let glassSqlQuery = `CALL get_glass(?)`;
		glassInfo = await new Promise((resolve, reject) => {
			db.query(glassSqlQuery, glassId, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);
				}
			});
		});
	} catch (error) {
		res.json({ error: error.message });
		return;
	}

	let apiData = { glass: glassInfo[0] };

	res.json(apiData);
});

//search glasses
router.get("/glasses/search", [check("keyword").trim().escape()], async function (req, res, next) {
	let keyword;
		if (!req.query.keyword || req.query.keyword.length < 1) {
			keyword = "";
		} else {
			keyword = req.query.keyword;
		}
	try {
		let sqlquery = `CALL search_for_glass(?)`;

		results = await new Promise((resolve, reject) => {
			db.query(sqlquery, keyword, (error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results);

					let apiData = {
						glasses: results[0],
					};

					res.json(apiData);
				}
			});
		});
	} catch (error) {
		res.json({ error: error.message });
		return;
	}
});

//list all glasses
router.get("/glasses/list", async function (req, res, next) {
	let sqlquery = `CALL get_all_glasses()`;

	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
				res.send("Error in API request from database.");
			} else {
				resolve(results);

				let apiData = {
					glasses: results[0],
				};

				res.json(apiData);
			}
		});
	});
});

//returns all glasses by how many times featured in drinks
router.get("/glasses/listbycount", async function (req, res, next) {
	let sqlquery = `CALL list_glass_by_count()`;
	results = await new Promise((resolve, reject) => {
		db.query(sqlquery, (error, results) => {
			if (error) {
				reject(error);
				res.send("Error in API request from database.");
			} else {
				resolve(results);

				let apiData = {
					glass_results: results[0],
				};

				res.json(apiData);
			}
		});
	});
});

// Export the router object so index.js can access it
module.exports = router;
