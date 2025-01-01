//on load, get the ingredients container and button for adding ingredient
document.addEventListener("DOMContentLoaded", function () {
	const ingredientsContainer = document.getElementById(
		"ingredients-container"
	);

	//setting up suggestions from databases for glass input
	const glassInput = document.getElementById("add_cocktail_glass");
	const glassSuggestions = document.getElementById("glassSuggestions");
	glassInput.setAttribute("list", "glassSuggestions");

	//listener for glass input
	glassInput.addEventListener("input", async function () {
		const typedValue = glassInput.value.trim();

		//if input is empty clear the list
		if (typedValue == "") {
			document.getElementById("glassSuggestions").innerHTML = "";
			return;
		}

		try {
			const response = await fetch(
				"../api/glasses/search?keyword=" +
					encodeURIComponent(typedValue) //fetch glasses from typed input
			);

			if (!response.ok) {
				throw new Error(
					`Request failed with status: ${response.status}`
				); //error if bad response
			}

			const data = await response.json(); //json response

			//clear list of old suggestions
			const dataList = document.getElementById("glassSuggestions");
			dataList.innerHTML = "";

			//fill with new glasses from fetch
			data.glasses.forEach((item) => {
				const option = document.createElement("option");
				option.value = item.glass_name;
				dataList.appendChild(option);
			});
		} catch (error) {
			console.error("Error fetching suggestions:", error);
		}
	});

	const addIngredientBtn = document.getElementById("add-ingredient-btn");
	//add a new div for storing ingredients and measurements as a pair
	addIngredientBtn.addEventListener("click", function () {
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
		ingredientInput.addEventListener("input", async function () {
			const typedValue = ingredientInput.value.trim();

			//if input is empty clear the list
			if (typedValue == "") {
				document.getElementById("ingredientSuggestions").innerHTML = "";
				return;
			}

			try {
				const response = await fetch(
					"../api/ingredients/search?keyword=" +
						encodeURIComponent(typedValue) //fetch ingredients from typed input
				);

				if (!response.ok) {
					throw new Error(
						`Request failed with status: ${response.status}`
					); //error if bad response
				}

				const data = await response.json(); //json response

				//clear list of old suggestions
				const dataList = document.getElementById(
					"ingredientSuggestions"
				);
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

		//measurement input element, set length constraint, measurements as array to take multiple
		const measurementInput = document.createElement("input");
		measurementInput.type = "text";
		measurementInput.name = "measurements[]";
		measurementInput.placeholder = "Measurement";
		measurementInput.maxLength = 32;

		//button to remove the pair of ingredients and measurements
		const removeBtn = document.createElement("button");
		removeBtn.type = "button";
		removeBtn.classList.add("remove-btn", "basic-button");
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

async function onlineDBFetch(event) {
	event.preventDefault(); //stop reload of page
	//get keyword for cocktail seearch
	const keyword = document.getElementById("api-keyword").value.trim();
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

//fetching drinks from internal DB
async function internalDBFetch(event) {
	event.preventDefault(); //stop reload of page
	//get keyword for cocktail seearch
	const keyword = document.getElementById("internal-keyword").value.trim();
	//url for api call
	const url = `../api/drinks/search?keyword=${encodeURIComponent(keyword)}`; //encode keyword

	let response;
	try {
		response = await fetch(url);

		//check everything is good
		if (response.ok == true) {
			console.log("http success: ", response.status);
			const data = await response.json();

			const parsedData = parseInternalDBResponse(data);

			listParsedResults(parsedData);
		} else {
			console.log("http error: ", response.status); //log response if not
		}
		//log the error
	} catch (error) {
		console.log("error in fetch: ", error);
	}
}

//parse SQL data from internal DB
function parseInternalDBResponse(data) {
	//initialise a drinkList for holding objects
	//turns drink sql row data into object featuring lists for ingredients and measurements for ease of html display
	let resDrinkList = [];
	data.drinks.forEach((entry) => {
		//find if there is an object in drink list with a matching id already
		let existingDrink = resDrinkList.find(
			(drink) => drink.drink_id === entry.drink_id
		);

		//if not
		if (!existingDrink) {
			//create an object, take necessary details from entry
			resDrinkList.push({
				drink_id: entry.drink_id,
				drink_name: entry.drink_name,
				drink_method: entry.drink_method,
				drink_glass: entry.glass_name,
				drink_price: entry.price,
				ingredients: [entry.ingr_name],
				measurements: [entry.measure],
			});
		} else {
			//if we have an existing drink object in drink list with matching menu id, add ingredients and measure to lsits
			existingDrink.ingredients.push(entry.ingr_name);
			existingDrink.measurements.push(entry.measure);
		}
	});
	return resDrinkList;
}

//parse JSON data from external API
function parseCocktailApiResponse(apiResponse) {
	//init the drink list for response
	//turns drink api data into object featuring lists for ingredients and measurements for ease of html display
	let resDrinkList = [];

	if (apiResponse.drinks == null) {
		return resDrinkList;
	}

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
	return str.replace(/^Method:\s*/i, "").replace(/^Glass:\s*/i, "");
}

//from https://stackoverflow.com/questions/69596160/how-to-remove-all-the-child-nodes-of-an-element - Yasin Br
function recursiveChildRemoval(element) {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}

//listing parsed drink results from either external API or internal DB on edit menu page
function listParsedResults(resultList) {
	//container for search list results
	const listContainer = document.getElementById("result-list-container");
	listContainer.classList.add("result-list-div");

	//remove all child nodes to clear list of previous results
	recursiveChildRemoval(listContainer);

	//objects for holding list
	const ulObject = document.createElement("ul");
	ulObject.classList.add("cocktail-list");
	listContainer.appendChild(ulObject);
	if (resultList.length < 1) {
		let message = document.createElement("p");
		message.innerText = "No results found."; //if no results
		ulObject.appendChild(message);
	}

	//list results
	resultList.forEach((result) => {
		const listItem = document.createElement("li");
		//create parent div
		const resultDiv = document.createElement("div");
		resultDiv.classList.add("cocktail-item-div");

		const textAlignDiv = document.createElement("div");
		textAlignDiv.classList.add("text-align-centre");

		//create the cocktail details bits
		const resultName = document.createElement("p");
		resultName.classList.add("cocktail-item-name", "edit-menu-cocktail");
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
		ingredientList.classList.add("ingr-list");
		//if there exists an ingredient and measurement
		if (result.ingredients && result.measurements) {
			for (let i = 0; i < result.ingredients.length; i++) {
				//create list item for ingredient measurement pair
				const ingrMeasureListItem = document.createElement("li");
				ingrMeasureListItem.classList.add(
					"ingredient-list-item",
					"flex-row"
				);
				//text item for ingredient and measurement
				const ingredientText = document.createElement("p");
				ingredientText.classList.add("result-ingredient");
				ingredientText.innerText = `${result.ingredients[i]}`;
				const joinText = document.createElement("p");
				joinText.classList.add("result-ingredient");
				joinText.innerText = ` : `;
				const measureText = document.createElement("p");
				measureText.classList.add("result-ingredient");
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
			ingrMeasureListItem.classList.add(
				"ingredient-list-item",
				"flex-row"
			);

			//text item for ingredient and measurement
			const ingredientText = document.createElement("p");
			ingredientText.classList.add("result-ingredient");
			ingredientText.innerText = `No ingredient found.`;
			const joinText = document.createElement("p");
			joinText.classList.add("result-ingredient");
			joinText.innerText = ` : `;
			const measureText = document.createElement("p");
			measureText.classList.add("result-ingredient");
			measureText.innerText = `No measurement found.`;
			//append text to list item
			ingrMeasureListItem.appendChild(ingredientText);
			ingrMeasureListItem.appendChild(joinText);
			ingrMeasureListItem.appendChild(measureText);

			//append list item to container
			ingredientList.appendChild(ingrMeasureListItem);
		}
		//button for adding drink to menu
		const addButton = document.createElement("button");
		addButton.classList.add("basic-button", "full-width");
		addButton.textContent = "Add to menu";
		addButton.addEventListener("click", getPrice);

		//append to parent
		textAlignDiv.appendChild(resultName);
		resultDiv.appendChild(textAlignDiv);
		resultDiv.appendChild(resultMethod);
		resultDiv.appendChild(resultGlass);
		resultDiv.appendChild(resultPrice);
		resultDiv.appendChild(ingredientList);
		resultDiv.appendChild(addButton);

		listItem.appendChild(resultDiv);

		//apend to container
		ulObject.appendChild(listItem);
	});
}

//prompt user for price entry before adding drink to a menu
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

//check internal DB for duplicate drink entry, return an id or -1 if no duplicate found
async function duplicateDrinkCheck(data) {
	//fetch drink search from drink_name
	//url for api call
	const url = `../api/drinks/search?keyword=${encodeURIComponent(
		data.drink_name
	)}`; //encode keyword

	let response;
	try {
		response = await fetch(url);

		//check everything is good
		if (response.ok == true) {
			console.log("http success: ", response.status);
			const DBdata = await response.json();

			//parse results into object list
			const parsedData = parseInternalDBResponse(DBdata);

			let drinkId = -1; //-1 is default, means no duplicate
			const paramList = [
				"drink_method",
				"drink_glass",
				"ingredients",
				"measurements",
			];
			console.log(parsedData);
			console.log(data);
			for (const entry of parsedData) {
				let allMatch = true; //will change to false if something doesn't match at any point

				for (let i = 0; i < paramList.length; i++) {
					const param = paramList[i];

					//if array compare with json stringify
					if (param == "ingredients" || param == "measurements") {
						if (
							JSON.stringify(entry[param]) !=
							JSON.stringify(data[param])
						) {
							allMatch = false;
							console.log("false");
							console.log(JSON.stringify(entry[param]), JSON.stringify(data[param]));
							break;
						}
					} else {
						//otherwise normal check
						if (entry[param] != data[param]) {
							allMatch = false;
							console.log("false");
							console.log(entry[param], data[param]);
							break;
						}
					}
				}

				if (allMatch) {
					//return the id of the existing drink matching the one trying to be added
					drinkId = entry.drink_id;
					return drinkId;
				}
			}
			return drinkId; //else return -1 for no duplicate
		} else {
			console.log("http error: ", response.status); //log response if not
		}
		//log the error
	} catch (error) {
		console.log("error in fetch: ", error);
	}
}

//adding a cocktail to DB
async function addCocktailToDBFromSearch(event, price) {
	const button = event.target;
	const parent = button.parentNode;
	const children = parent.children;

	const menu_id = document.getElementById("menu_id_holder").value;

	const data = {
		drink_id: -1,
		drink_name: children[0].innerText,
		drink_method: cleanString(cleanString(children[1].innerText)),
		drink_glass: cleanString(cleanString(children[2].innerText)),
		drink_price: price,
		ingredients: [],
		measurements: [],
		menu_id: menu_id,
	};

	//THEN LOOP THROUGH THE UL for the INGREDIENTS AND MEASURES INTO ARRAY
	children[4].childNodes.forEach((listItem) => {
		if (listItem.childNodes[0] && listItem.childNodes[2]) {
			data.ingredients.push(listItem.childNodes[0].innerText);
			data.measurements.push(listItem.childNodes[2].innerText);
		}
	});

	//fucntion to check for duplicates, return drink_id if found
	let drinkId = await duplicateDrinkCheck(data);
	if (drinkId != -1) {
		data.drink_id = drinkId;
	}

	try {
		//reponse is equal to the result of the promise
		const response = await fetch("./add-cocktail-to-menu", {
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
			window.location.reload();
		} else {
			//if database request didnt go well
			console.log(
				"No bueno sending that cocktail chief, CODE: " +
					response.status +
					", text: " +
					response.statusText
			);
			let errorContainer = document.getElementById("error-container");
			errorContainer.innerHTML = "";
			const p = document.createElement("p");
			p.classList.add("full-width");
			const errorMessage = await response.text();
			p.textContent = `Error: (${errorMessage.innerText})`;
			errorContainer.appendChild(p);
		}

		//else oh no, tell us what went wrong
	} catch (error) {
		console.error(error);
	}
}

//removing a drink from menu
async function removeDrinkFromMenu(event) {
	const button = event.target;
	const parent = button.parentNode;

	const drinkId = parent
		.querySelector(".cocktail-item-name")
		.getAttribute("drinkId");
	const menuId = document.getElementById("menu_id_holder").value;

	const data = {
		drink_id: drinkId,
		menu_id: menuId,
	};

	try {
		//reponse is equal to the result of the promise
		const response = await fetch("./remove-cocktail-from-menu", {
			method: "POST",

			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify(data),
		});

		//if all went well, say so
		if (response.ok == true) {
			console.log(
				"Cocktail data removed successfully, code: " + response.status
			);
			window.location.reload();
		} else {
			//if database request didnt go well
			console.log(
				"No bueno removing that cocktail chief, CODE: " +
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

//error handling on edit menu page
document.addEventListener("DOMContentLoaded", function () {
	document
		.getElementById("add-cocktail-form")
		.addEventListener("submit", async function (event) {
			//stop default submission of form
			event.preventDefault();

			const errorContainer = document.getElementById("error-container");
			//clear previous error messages
			errorContainer.innerHTML = "";

			const form = event.target;
			const formData = new FormData(form);

			//convert the form to json data
			const data = {};
			formData.forEach((value, key) => {
				if (key.endsWith("[]")) {
					//if array
					const cleanKey = key.slice(0, -2); //remove array tags
					if (!data[cleanKey]) data[cleanKey] = []; //initialise array in data
					data[cleanKey].push(value); //add value to array
				} else {
					data[key] = value;
				}
			});

			//fetch call to original url ( add-cocktail-to-menu)
			//handling json results and reloading page if needed or populating error handler
			try {
				const response = await fetch(form.action, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(data),
				});

				if (response.ok) {
					const menu_id = form.querySelector(
						'input[name="menu_id"]'
					).value;
					window.location.reload();
				} else if (response.status == 400) {
					const result = await response.json();
					if (result.errors && Array.isArray(result.errors)) {
						//if we have errors and they are an array
						result.errors.forEach((error) => {
							//create error messages to be displayed
							const p = document.createElement("p");
							p.classList.add("full-width");
							p.textContent = `Error: ${error.msg} at (${error.path})`;
							errorContainer.appendChild(p);
						});
					}
				} else {
					errorContainer.innerHTML =
						'<p class="full-width">An unexpected error occurred.</p>';
				}
			} catch (error) {
				console.error("Fetch error:", error);
				errorContainer.innerHTML =
					'<p class="full-width">Failed to submit. Please try again.</p>';
			}
		});
});
