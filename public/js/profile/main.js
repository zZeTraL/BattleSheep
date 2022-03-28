// On sauvegarde l'id de la popup change password
let changePasswordModal = document.getElementById("changePasswordModal");
// Par défaut la popup est cachée
changePasswordModal.style.setProperty("display", "none")

// On sélectionne toutes les balises <i>
document.querySelectorAll("i").forEach((iElement) => {
    if(iElement.getAttribute("data") === "showPassword"){
        iElement.addEventListener('click', (ignored) => {
            document.querySelectorAll("input").forEach((inputElement) => {
                if(inputElement.getAttribute("type") === "password"){
                    inputElement.setAttribute("type", "text");
                } else {
                    inputElement.setAttribute("type", "password");
                }
            })
        })
    }
})

// Listener qui affiche la popup lorsque l'utilisateur
document.getElementById("password").addEventListener('click', (ignored) => {
    revealOrHidePasswordModal();
})

// Listener pour fermer la popup lorsque celle-ci est ouverte
document.getElementById("close").addEventListener('click', (ignored) => {
    revealOrHidePasswordModal();
})


/**
 * Permet d'afficher et de fermer la popup permettant de changer de mot de passe
 */
function revealOrHidePasswordModal(){
    if (changePasswordModal.style.getPropertyValue("display") === "none") {
        changePasswordModal.style.setProperty("display", "flex")
    } else {
        changePasswordModal.style.setProperty("display", "none")
    }
}