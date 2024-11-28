// Create a new router
const { check, validationResult } = require("express-validator");

const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/register", function (req, res, next) {
	res.render("register.ejs");
});

router.get("/list", redirectLogin, function (req, res, next) {
	let sqlquery = "SELECT username, firstName, lastName, email FROM users"; // query database to get all the books
	// execute sql query
	db.query(sqlquery, (err, result) => {
		if (err) {
			next(err);
		}
		console.log(result);
		res.render("userlist.ejs", { availableUsers: result });
	});
});

router.get("/login", function (req, res, next) {
	let sessionData = {
		loginFailed: false,
		user: req.session.user,
	};
	res.render("login.ejs", sessionData);
});

router.post("/login", async function (req, res, next) {
	//variable set up for login validation
	const username = req.body.username;
	const password = req.body.password;

	let params = [username, password];
	let sqlquery = "SELECT user_id, hashedPassword FROM users WHERE username = ?";

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
	if (results.length == 0) {
		//redirect back to login page, display error message saying there is no matching user
		let sessionData = {
			loginFailed: true,
			user: req.session.user,
		};
		res.render("login.ejs", sessionData);
	} else {
		//get hashedPassword from returned user data
		hashedPassword = results[0].hashedPassword;

		// Compare the password supplied with the password in the database
		bcrypt.compare(password, hashedPassword, function (err, result) {
			if (err) {
				let sessionData = {
					loginFailed: false,
					user: req.session.user,
				};
				res.render("login.ejs", sessionData);
			} else if (result == true) {
				// regenerate the session, which is good practice to help
				// guard against forms of session fixation
				req.session.regenerate(function (err) {
					if (err) next(err);

					// store user information in session, typically a user id
					req.session.user = username;
					req.session.user_id = results[0].user_id;

					// save the session before redirection to ensure page
					// load does not happen before session is saved
					req.session.save(function (err) {
						if (err) return next(err);
						res.redirect("/");
					});
				});
			} else {
				//password comparison unsuccessful
				let sessionData = {
					loginFailed: true,
					user: req.session.user,
				};
				//redirect to login page
				res.render("login.ejs", sessionData);
			}
		});
	}
});

router.post(
	"/registered",
	[
		check("email").isEmail(),
		check("password").isLength({ min: 8, max: 24 }).notEmpty(),
		check("username").isLength({ min: 8, max: 16 }).notEmpty(),
		check("first").notEmpty(),
		check("last").notEmpty(),
	],
	function (req, res, next) {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			console.log(errors);
			res.redirect("./register");
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
						"INSERT INTO users (username, firstName, lastName, email, hashedPassword) VALUES (?,?,?,?,?)";
					// execute sql query
					let newrecord = [
						req.sanitize(req.body.username),
						req.sanitize(req.body.first),
						req.sanitize(req.body.last),
						req.body.email,
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
								req.body.email +
								". Your password is: " +
								req.body.password +
								" and your hashed password is: " +
								hashedPassword;
						res.send(result);
					});
				}
			);
		}
	}
);

// Export the router object so index.js can access it
module.exports = router;
