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

    let label = document.getElementById("searchLabel")
    label.setAttribute("style", "display: block")
    label.innerText = "Search for drink: "
}