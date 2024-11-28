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

router.get("/about", async function (req, res, next) {
	//return count of all users
	const users = await new Promise((resolve, reject) => {
		db.query(`SELECT COUNT(username) as user_count from users`, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
	});

    //return count of all menus
	const menus = await new Promise((resolve, reject) => {
		db.query(`SELECT COUNT(menu_name) as menu_count from menus `, (error, results) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		});
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
