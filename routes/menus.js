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

    //todo get results for the menu data to be displayed as current menu
    let menuData = { menu_id: results[0][0].menu_id}

    res.render('editmenu.ejs', menuData)
})

router.post('/add-cocktail-to-menu', redirectLogin, async function (req, res, next){

    //setup variables
    const cocktailName = req.body.add_cocktail_name;
    const cocktailMethod = req.body.add_cocktail_method;
    const cocktailGlass = req.body.add_cocktail_glass;
    const cocktailPrice = req.body.add_cocktail_price;
    const jsonIngrMeas = JSON.stringify({ 
        ingredients: req.body.ingredients,
        measurements: req.body.measurements
    })
    const menuId = req.body.menu_id;

    //variables for query
    const sqlquery = `CALL add_cocktail_from_db(?,?,?,?,?,?)`;
    const params = [cocktailName, cocktailMethod, cocktailGlass, cocktailPrice, jsonIngrMeas, menuId];


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

    let menuData = { menu_id: menuId}

    res.render('editmenu.ejs', menuData)
})

// Export the router object so index.js can access it
module.exports = router