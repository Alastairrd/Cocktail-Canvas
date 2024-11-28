// Create a new router
const express = require("express")
const router = express.Router()

router.get('/create', redirectLogin, function (req, res, next){
    let sessionData = {
		user: req.session.user,
	};

    res.render('createmenu.ejs', sessionData)
})

router.post('/create', redirectLogin, async function (req, res, next){
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

    res.render('editmenu.ejs')
})

// Export the router object so index.js can access it
module.exports = router