// Create a new router
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { check, validationResult } = require("express-validator");

//register page
router.get("/register", function (req, res, next) {
	res.render("register.ejs", { errors: [], user: req.session.user });
});

//login page
router.get("/login", function (req, res, next) {
	let sessionData = {
		loginFailed: false,
		user: req.session.user,
		errors: [],
	};
	res.render("login.ejs", sessionData);
});

//login route handler for login request
router.post("/login", async function (req, res, next) {
	//variable set up for login validation
	const username = req.body.username;
	const password = req.body.password;

	let params = [username];
	let sqlquery =
		`CALL get_user_login_details(?)`;

	//check if username is registered
	const results = await new Promise((resolve, reject) => {
		db.query(sqlquery, params, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

	//if no user found for that username
	if (results[0].length == 0) {
		//redirect back to login page, display error message saying there is no matching user
		let sessionData = {
			loginFailed: true,
			user: req.session.user,
			errors: [],
		};
		res.render("login.ejs", sessionData);
		return;
	} else {
		//get hashedPassword from returned user data
		hashedPassword = results[0][0].hashedPassword;

		// Compare the password supplied with the password in the database
		bcrypt.compare(password, hashedPassword, function (err, result) {
			if (err) {
				let sessionData = {
					loginFailed: true,
					user: req.session.user,
					errors: [{ msg: err.message}],
				};
				res.render("login.ejs", sessionData);
			} else if (result == true) {
				// regenerate the session, which is good practice to help
				// guard against forms of session fixation
				req.session.regenerate(function (err) {
					if (err) next(err);

					// store user information in session, typically a user id
					req.session.user = username;
					req.session.user_id = results[0][0].user_id;

					// save the session before redirection to ensure page
					// load does not happen before session is saved
					req.session.save(function (err) {
						if (err) return next(err);
						res.redirect("../");
					});
				});
			} else {
				//password comparison unsuccessful
				let sessionData = {
					loginFailed: true,
					user: req.session.user,
					errors: [],
				};
				//redirect to login page
				res.render("login.ejs", sessionData);
			}
		});
	}
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
			res.render("register.ejs", {
				errors: errors.array(),
				user: req.session.user,
			});
			return;
		} else {
			//check username is unique
			const username = req.body.username;
			let params = [username];
			let sqlquery =
			`CALL get_user_login_details(?)`;
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
				res.render("register.ejs", {
					errors: [{ msg: "Username taken.", path: "username" }],
					user: req.session.user,
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
					let sqlquery =
						`CALL create_user(?,?,?,?,?,?)`;
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
						res.render("registered.ejs", {
							message: result,
							user: req.session.user,
						});
					});
				}
			);
		}
	}
);

// Export the router object so index.js can access it
module.exports = router;
