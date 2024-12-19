function setUserSearch(){
    let input = document.getElementById("searchQuery")
    input.setAttribute("placeholder", "Type a username to search for...")
    input.setAttribute("style", "display: block")
    input.setAttribute("maxlength", "16")

    let text = document.getElementById("searchLabel")
    text.innerText = "User search:"

    let type = document.getElementById("type")
    type.setAttribute("value", "user")
}

function setMenuSearch(){
    let input = document.getElementById("searchQuery")
    input.setAttribute("placeholder", "Type a menu name to search for...")
    input.setAttribute("style", "display: block")
    input.setAttribute("maxlength", "50")

    let text = document.getElementById("searchLabel")
    text.innerText = "Menu search:"
    type.setAttribute("value", "menu")
}

function setDrinkSearch(){
    let input = document.getElementById("searchQuery")
    input.setAttribute("placeholder", "Type a drink name to search for...")
    input.setAttribute("style", "display: block")
    input.setAttribute("maxlength", "64")

    let text = document.getElementById("searchLabel")
    text.innerText = "Drink search:"
    type.setAttribute("value", "drink")
}