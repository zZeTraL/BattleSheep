window.onload = function () {
    if(!isUserOnMobile()){
        let joinQueueButton = document.getElementById("joinQueueButton");
        let form = document.getElementById("form");

        joinQueueButton.addEventListener('click', waitingRoomManager.onClick);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            chatManager.sendMessage();
        });
    }
}

/**
 *
 * isUserOnMobile allows to know if user is on a mobile device
 *
 * @returns {Boolean}
 */
function isUserOnMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        document.querySelector(".play__container").remove();
        let p = document.createElement("p");
        p.textContent = "Biipp Boop Bip : Le jeu n'est pas disponible sur mobile !"
        document.body.appendChild(p);
        return true;
    }
    return false;
}
