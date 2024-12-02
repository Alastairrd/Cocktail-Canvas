async function cocktailDBFetch(event){
    event.preventDefault() //stop reload of page
    //get keyword for cocktail seearch
    const keyword = document.getElementById('keyword').value.trim();
    //url for api call
    const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(keyword)}`; //encode keyword

    let response;
    try {
        response = await fetch(url);

        //check everything is good
        if(response.ok == true){
            console.log("http success: ", response.status);
            const data = await response.json()
            listAPIResults(data);
        } else {
            console.log("http error: ", response.status); //log response if not
        }
    //log the error
    } catch (error) {
        console.log("error in fetch: ", error);
    }
}

function parseCocktailApiResponse(apiResponse) {
    //init the drink list for response
    let resDrinkList = [];

    //check there are drinks in api response
    if (apiResponse.drinks.length > 0) {
        apiResponse.drinks.forEach((entry) => {
            //declare arrays for ingr and measurements
            const ingredients = [];
            const measurements = [];

            //loop and gather all possible ingredients and measurements
            for (let i = 1; i <= 15; i++) {
                //get api data into variable
                const ingredientKey = `strIngredient${i}`;
                const measureKey = `strMeasure${i}`;

                if (entry[ingredientKey] !== null && entry[ingredientKey] !== undefined) {
                    ingredients.push(entry[ingredientKey]);
                    measurements.push(entry[measureKey] || "");//empty string in case no measurement defined
                }
            }

            //create drink list obeject and fill with data from api call
            resDrinkList.push({
                drink_id: entry.idDrink,
                drink_name: entry.strDrink,
                drink_method: entry.strInstructions,
                glass_name: entry.strGlass,
                price: 0.00, //set 0 can be edited later
                ingredients: ingredients,
                measurements: measurements,
            });
        });
    }

    return resDrinkList;
}