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
	res.render("login.ejs");
});

router.post("/loggedin", function (req, res, next) {
	const username = req.body.username;
	const password = req.body.password;

	// Save user session here, when login is successful
	req.session.userId = username;

	let sqlquery = "SELECT hashedPassword FROM users WHERE username = ?";

	db.query(sqlquery, username, (err, result) => {
		if (err) {
			err(next);
		}

		hashedPassword = result[0].hashedPassword;

		// Compare the password supplied with the password in the database
		bcrypt.compare(password, hashedPassword, function (err, result) {
			if (err) {
				res.render("loggedin.ejs", {
					loginResult: "Look there was a bit of an error tbh",
				});
			} else if (result == true) {
				res.render("loggedin.ejs", { loginResult: "Yeah ya good" });
			} else {
				res.render("loggedin.ejs", { loginResult: "Nah m8" });
			}
		});
	});
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
