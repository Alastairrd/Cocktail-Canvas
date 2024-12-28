//on load, get the ingredients container and button for adding ingredient
document.addEventListener("DOMContentLoaded", function() {
	const ingredientsContainer = document.getElementById(
		"ingredients-container"
	);
	const addIngredientBtn = document.getElementById("add-ingredient-btn");

	//add a new div for storing ingredients and measurements as a pair
	addIngredientBtn.addEventListener("click", function() {
		const ingredientPair = document.createElement("div");
		ingredientPair.classList.add("ingredient-pair-div");

		//ingredient input element, set length constraint, ingredients as array to take multiple
		const ingredientInput = document.createElement("input");
		ingredientInput.type = "text";
		ingredientInput.name = "ingredients[]";
		ingredientInput.placeholder = "Ingredient";
		ingredientInput.maxLength = 64;
		ingredientInput.setAttribute("list", "ingredientSuggestions");

		//listener for ingr input
		ingredientInput.addEventListener("input", async function() {
			const typedValue = ingredientInput.value.trim();

			//if input is empty clear the list
			if (typedValue == "") {
				document.getElementById("ingredientSuggestions").innerHTML = "";
				return;
			}

			try {
				const response = await fetch(
				  "../api/ingredients/search?keyword=" + encodeURIComponent(typedValue) //fetch ingredients from typed input
				);

				if (!response.ok) {
				  throw new Error(`Request failed with status: ${response.status}`); //error if bad response
				}

				const data = await response.json(); //json response
			  
				//clear list of old suggestions
				const dataList = document.getElementById("ingredientSuggestions");
				dataList.innerHTML = "";
			  
				//fill with new ingredients from fetch
				data.ingredients.forEach((item) => {
				  const option = document.createElement("option");
				  option.value = item.ingr_name;
				  dataList.appendChild(option);
				});
			  } catch (error) {
				console.error("Error fetching suggestions:", error);
			  }
		});

		//data list for the suggestions to be held
		existingDataList = document.createElement("datalist");
		existingDataList.id = "ingredientSuggestions";
		document.body.appendChild(existingDataList);

		//measurement input element, set length constraint, measurements as array to take multiple
		const measurementInput = document.createElement("input");
		measurementInput.type = "text";
		measurementInput.name = "measurements[]";
		measurementInput.placeholder = "Measurement";
		measurementInput.maxLength = 32;

		//button to remove the pair of ingredients and measurements
		const removeBtn = document.createElement("button");
		removeBtn.type = "button";
		removeBtn.classList.add("remove-btn");
		removeBtn.textContent = "Remove";
		removeBtn.addEventListener("click", () => {
			//remove pair on click
			ingredientPair.remove();
		});

		//add input elements to parent div, and parent div to container
		ingredientPair.appendChild(ingredientInput);
		ingredientPair.appendChild(measurementInput);
		ingredientPair.appendChild(removeBtn);
		ingredientsContainer.appendChild(ingredientPair);
	});
});

async function cocktailDBFetch(event) {
	event.preventDefault(); //stop reload of page
	//get keyword for cocktail seearch
	const keyword = document.getElementById("keyword").value.trim();
	//url for api call
	const url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
		keyword
	)}`; //encode keyword

	let response;
	try {
		response = await fetch(url);

		//check everything is good
		if (response.ok == true) {
			console.log("http success: ", response.status);
			const data = await response.json();
			const parsedData = parseCocktailApiResponse(data);
			listParsedResults(parsedData);
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

				if (
					entry[ingredientKey] !== null &&
					entry[ingredientKey] !== undefined
				) {
					ingredients.push(entry[ingredientKey]);
					measurements.push(entry[measureKey] || "-----"); //empty string in case no measurement defined
				}
			}

			//create drink list obeject and fill with data from api call
			resDrinkList.push({
				drink_id: entry.idDrink,
				drink_name: entry.strDrink,
				drink_method: cleanString(entry.strInstructions),
				drink_glass: cleanString(entry.strGlass),
				drink_price: 0.0, //set 0 can be edited later
				ingredients: ingredients,
				measurements: measurements,
			});
		});
	}

	return resDrinkList;
}

function cleanString(str) {
	//removing unnecessary text from api responses or coming from page
	return str
	  .replace(/^Method:\s*/i, "") 
	  .replace(/^Glass:\s*/i, ""); 
  }

function listParsedResults(resultList) {
	//container for search list results
	const listContainer = document.getElementById("result-list-container");

	resultList.forEach((result) => {
		//create parent div
		const resultDiv = document.createElement("div");
		resultDiv.classList.add("result-div");

		//create the cocktail details bits
		const resultName = document.createElement("p");
		resultName.classList.add("cocktail-item-name");
		resultName.innerText = result.drink_name;

		const resultMethod = document.createElement("p");
		resultMethod.classList.add("cocktail-item-method");
		resultMethod.innerText = "Method: " + result.drink_method;

		const resultGlass = document.createElement("p");
		resultGlass.classList.add("cocktail-item-glass");
		resultGlass.innerText = "Glass: " + result.drink_glass;

		const resultPrice = document.createElement("p");
		resultPrice.classList.add("cocktail-item-price");
		resultPrice.innerText = "Price: £" + result.drink_price;
		resultPrice.style.display = "none";

		//create the ingredient/measure pair list container
		const ingredientList = document.createElement("ul");
		//if there exists an ingredient and measurement
		if (result.ingredients && result.measurements) {
			for (let i = 0; i < result.ingredients.length; i++) {
				//create list item for ingredient measurement pair
				const ingrMeasureListItem = document.createElement("li");
				ingrMeasureListItem.classList.add("ingredient-list-item");
				//text item for ingredient and measurement
				const ingredientText = document.createElement("p");
				ingredientText.innerText = `${result.ingredients[i]}`;
				const joinText = document.createElement("p");
				joinText.innerText = ` : `;
				const measureText = document.createElement("p");
				measureText.innerText = `${result.measurements[i]}`;
				//append text to list item
				ingrMeasureListItem.appendChild(ingredientText);
				ingrMeasureListItem.appendChild(joinText);
				ingrMeasureListItem.appendChild(measureText);

				//append list item to container
				ingredientList.appendChild(ingrMeasureListItem);
			}
		} else {
			//create list item for ingredient measurements
			const ingrMeasureListItem = document.createElement("li");
			ingrMeasureListItem.classList.add("ingredient-list-item");

			//text item for ingredient and measurement
			const ingredientText = document.createElement("p");
			ingredientText.innerText = `No ingredient found.`;
			const joinText = document.createElement("p");
			joinText.innerText = ` : `;
			const measureText = document.createElement("p");
			measureText.innerText = `No measurement found.`;
			//append text to list item
			ingrMeasureListItem.appendChild(ingredientText);
			ingrMeasureListItem.appendChild(joinText);
			ingrMeasureListItem.appendChild(measureText);

			//append list item to container
			ingredientList.appendChild(ingrMeasureListItem);
		}

		const addButton = document.createElement("button");
		addButton.textContent = "Add to menu";
		addButton.addEventListener("click", getPrice);

		//append to parent
		resultDiv.appendChild(resultName);
		resultDiv.appendChild(resultMethod);
		resultDiv.appendChild(resultGlass);
		resultDiv.appendChild(resultPrice);
		resultDiv.appendChild(ingredientList);
		resultDiv.appendChild(addButton);

		//apend to container
		listContainer.appendChild(resultDiv);
	});
}

function getPrice(event) {
	const userInput = prompt("Enter a price:");
	if (isNaN(userInput)) {
		alert("That's not a number!");
		return;
	}
	const parsedInput = parseFloat(userInput);

	if (parsedInput !== null && parsedInput >= 0 && parsedInput <= 99999.99) {
		addCocktailToDBFromSearch(event, parsedInput);
	} else {
		alert("No price entered or price is outside of allowable range.");
		return;
	}
}

async function addCocktailToDBFromSearch(event, price) {
	const button = event.target;
	const parent = button.parentNode;
	const children = parent.children;

	const menu_id = document.getElementById("menu_id_holder").value;

	console.log(children);
	const data = {
		add_cocktail_name: children[0].innerText,
		add_cocktail_method: cleanString(children[1].innerText),
		add_cocktail_glass: cleanString(children[2].innerText),
		add_cocktail_price: price,
		ingredients: [],
		measurements: [],
		menu_id: menu_id,
	};

	//TODO NEED TO SEPERATE MEASUREMENT FROM INGREDIENT IN RESULT LISTING, OR DELIMIT IT, BUT SEPERATION PROBABLY EASIER
	//TWO P TAGS, ONE FOR INGR AND ONE FOR MEASURE

	//THEN LOOP THROUGH THE UL for the INGREDIENTS AND MEASURES INTO ARRAY
	children[4].childNodes.forEach((listItem) => {
		console.log(listItem);
		if (listItem.childNodes[0] && listItem.childNodes[2]) {
			data.ingredients.push(listItem.childNodes[0].innerText);
			data.measurements.push(listItem.childNodes[2].innerText);
		}
	});

	console.log(data);

	try {
		//reponse is equal to the result of the promise
		const response = await fetch("/menus/add-cocktail-to-menu", {
			method: "POST",

			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(data),
		});

		//if all went well, say so
		if (response.ok == true) {
			console.log(
				"Cocktail data sent successfully, code: " + response.status
			);
			window.location.href = `/menus/editmenu?menu_id=${data.menu_id}`;
		} else {
			//if database request didnt go well
			console.log(
				"No bueno sending that cocktail chief, CODE: " +
					response.status +
					", text: " +
					response.statusText
			);
		}

		//else oh no, tell us what went wrong
	} catch (error) {
		console.error(error);
	}
}
