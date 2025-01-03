//if user search selected, edit elements to reflect it
function setUserSearch(){
    let input = document.getElementById("searchQuery")
    input.setAttribute("placeholder", "Type a username to search for...")
    input.setAttribute("style", "display: block")
    input.setAttribute("maxlength", "16")

    let type = document.getElementById("type")
    type.setAttribute("value", "user")

    let button = document.getElementById("searchButton")
    button.setAttribute("style", "display: block")
    

    let userButton = document.getElementById("userButton")
    userButton.setAttribute("activeNow", 1)
    userButton.classList.add("activeNow")
    let menuButton = document.getElementById("menuButton")
    menuButton.setAttribute("activeNow", 0)
    menuButton.classList.remove("activeNow")
    let drinkButton = document.getElementById("drinkButton")
    drinkButton.setAttribute("activeNow", 0)
    drinkButton.classList.remove("activeNow")

    let label = document.getElementById("searchLabel")
    label.setAttribute("style", "display: block")
    label.innerText = "Search for user: "
}
//if menu search selected, edit elements to reflect it
function setMenuSearch(){
    let input = document.getElementById("searchQuery")
    input.setAttribute("placeholder", "Type a menu name to search for...")
    input.setAttribute("style", "display: block")
    input.setAttribute("maxlength", "50")

    let type = document.getElementById("type")
    type.setAttribute("value", "menu")

    let button = document.getElementById("searchButton")
    button.setAttribute("style", "display: block")

    let userButton = document.getElementById("userButton")
    userButton.setAttribute("activeNow", 0)
    userButton.classList.remove("activeNow")
    let menuButton = document.getElementById("menuButton")
    menuButton.setAttribute("activeNow", 1)
    menuButton.classList.add("activeNow")
    let drinkButton = document.getElementById("drinkButton")
    drinkButton.setAttribute("activeNow", 0)
    drinkButton.classList.remove("activeNow")

    let label = document.getElementById("searchLabel")
    label.setAttribute("style", "display: block")
    label.innerText = "Search for menu: "
}
//if drink search selected, edit elements to reflect it
function setDrinkSearch(){
    let input = document.getElementById("searchQuery")
    input.setAttribute("placeholder", "Type a drink name to search for...")
    input.setAttribute("style", "display: block")
    input.setAttribute("maxlength", "64")

    let type = document.getElementById("type")
    type.setAttribute("value", "drink")

    let button = document.getElementById("searchButton")
    button.setAttribute("style", "display: block")

    let userButton = document.getElementById("userButton")
    userButton.setAttribute("activeNow", 0)
    userButton.classList.remove("activeNow")
    let menuButton = document.getElementById("menuButton")
    menuButton.setAttribute("activeNow", 0)
    menuButton.classList.remove("activeNow")
    let drinkButton = document.getElementById("drinkButton")
    drinkButton.setAttribute("activeNow", 1)
    drinkButton.classList.add("activeNow")

    let label = document.getElementById("searchLabel")
    label.setAttribute("style", "display: block")
    label.innerText = "Search for drink: "
}