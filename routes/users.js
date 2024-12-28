// Create a new router
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.get("/register", function (req, res, next) {
	res.render("register.ejs", {user: req.session.user});
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
		check("company").isLength({ max: 64 }),
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
						res.send(result);
					});
				}
			);
		}
	}
);

// Export the router object so index.js can access it
module.exports = router;
