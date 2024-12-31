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

    //sets the selected div to display and all others to no display
    for (i = 0; i < buttonArray.length; i++) {
      if(buttonArray[i] == activeButton) {
        button = document.getElementById(activeButton)
        button.classList.add("activeNow")
      } else {
        document.getElementById(buttonArray[i]).classList.remove("activeNow")
      }
    }

	  //sets the selected div to display and all others to no display
    for (i = 0; i < divArray.length; i++) {
      if (divArray[i] == activeDiv) {
        document.getElementById(divArray[i]).style.display =
          "flex";
        document.getElementById("list-heading").innerText = "List Page: " + divArray[i].charAt(0).toUpperCase() + divArray[i].substring(1, divArray[i].indexOf("-")) + "s";
      } else {
        document.getElementById(divArray[i]).style.display = "none";
      }
    }
  }

  function toggleCocktail(selectedDrink, showButtonId, hideButtonId){
    let item = document.getElementById(selectedDrink)

    if(item.getAttribute("activeNow") == 0){
        let method = document.getElementById(selectedDrink).querySelector('.cocktail-item-method')
        method.setAttribute("style", "display: inline")
        let glass = document.getElementById(selectedDrink).querySelector('.cocktail-item-glass')
        glass.setAttribute("style", "display: inline")
        let ingrlist = document.getElementById(selectedDrink).querySelector('.cocktail-item-ingrlist')
        ingrlist.setAttribute("style", "display: inline")
        let button = document.getElementById(showButtonId)
        button.setAttribute("style", "display: none")
        let hideButton = document.getElementById(hideButtonId)
        hideButton.setAttribute("style", "display: inline-block")
        item.setAttribute("activeNow", 1)
    } else {
        let method = document.getElementById(selectedDrink).querySelector('.cocktail-item-method')
        method.setAttribute("style", "display: none")
        let glass = document.getElementById(selectedDrink).querySelector('.cocktail-item-glass')
        glass.setAttribute("style", "display: none")
        let ingrlist = document.getElementById(selectedDrink).querySelector('.cocktail-item-ingrlist')
        ingrlist.setAttribute("style", "display: none")
        let button = document.getElementById(showButtonId)
        button.setAttribute("style", "display: inline-block")
        let hideButton = document.getElementById(hideButtonId)
        hideButton.setAttribute("style", "display: none")
        item.setAttribute("activeNow", 0)
    }
  }
