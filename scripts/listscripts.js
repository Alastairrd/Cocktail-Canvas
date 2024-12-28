  function toggleList(activeDiv, activeButton) {
    const divArray = [
      "user-list-div",
      "menu-list-div",
      "drink-list-div",
    ];

    const buttonArray = [
      "users-button",
      "menus-button",
      "drinks-button",
    ];
    console.log(activeButton);

    //sets the selected div to display and all others to no display
    for (i = 0; i < buttonArray.length; i++) {
      if(buttonArray[i] == activeButton) {
        console.log("true");
        button = document.getElementById(activeButton)
        console.log(button);
        button.classList.add("activeNow")
        console.log(button);
      } else {
        document.getElementById(buttonArray[i]).classList.remove("activeNow")
      }
    }

	  //sets the selected div to display and all others to no display
    for (i = 0; i < divArray.length; i++) {
      if (divArray[i] == activeDiv) {
        document.getElementById(divArray[i]).style.display =
          "inline";
        document.getElementById("list-heading").innerText = "List Page: " + divArray[i].charAt(0).toUpperCase() + divArray[i].substring(1, divArray[i].indexOf("-")) + "s";
      } else {
        document.getElementById(divArray[i]).style.display = "none";
      }
    }
  }

  function toggleCocktail(selectedDrink){
    let item = document.getElementById(selectedDrink)

    if(item.getAttribute("activeNow") == 0){
        let method = document.getElementById(selectedDrink).querySelector('.cocktail-item-method')
        method.setAttribute("style", "display: inline")
        let glass = document.getElementById(selectedDrink).querySelector('.cocktail-item-glass')
        glass.setAttribute("style", "display: inline")
        let ingrlist = document.getElementById(selectedDrink).querySelector('.cocktail-item-ingrlist')
        ingrlist.setAttribute("style", "display: inline")
        let button = document.getElementById(selectedDrink).querySelector('.show-button-drink')
        button.innerText = "Show less"
        item.setAttribute("activeNow", 1)
    } else {
        let method = document.getElementById(selectedDrink).querySelector('.cocktail-item-method')
        method.setAttribute("style", "display: none")
        let glass = document.getElementById(selectedDrink).querySelector('.cocktail-item-glass')
        glass.setAttribute("style", "display: none")
        let ingrlist = document.getElementById(selectedDrink).querySelector('.cocktail-item-ingrlist')
        ingrlist.setAttribute("style", "display: none")
        let button = document.getElementById(selectedDrink).querySelector('.show-button-drink')
        button.innerText = "Show more"
        item.setAttribute("activeNow", 0)
    }
  }
