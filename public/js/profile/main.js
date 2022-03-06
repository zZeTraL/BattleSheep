let changePasswordModal = document.getElementById("changePasswordModal");
changePasswordModal.style.setProperty("display", "none")

document.getElementById("password").addEventListener('click', (ignored) => {
    revealOrHidePasswordModal();
})

document.getElementById("close").addEventListener('click', (ignored) => {
    revealOrHidePasswordModal();
})

document.querySelectorAll("input").forEach((element) => {
    if(element.getAttribute("id") === "passwordInput" || element.getAttribute("id") === "passwordConfirmInput"){
        element.addEventListener('click', (ignored) => {
            if(element.getAttribute("type") === "password"){
                element.setAttribute("type", "text");
            } else {
                element.setAttribute("type", "password");
            }
        })
    }
})

function revealOrHidePasswordModal(){
    if (changePasswordModal.style.getPropertyValue("display") === "none") {
        changePasswordModal.style.setProperty("display", "flex")
    } else {
        changePasswordModal.style.setProperty("display", "none")
    }
}