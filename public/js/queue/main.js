window.onload = function () {

    socket.emit("joinWaitingRoom");
    socket.emit("id");

    if(!isUserOnMobile()){
        let joinQueueButton = document.getElementById("joinQueueButton");
        let form = document.getElementById("form");

        joinQueueButton.addEventListener('click', waitingRoomManager.onClick);
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            chatManager.sendMessage("waitingRoom");
        });
    } else {
        document.querySelector(".play__container").remove();
        let p = document.createElement("p");
        p.setAttribute("class", "game__not__playable");
        p.textContent = "Biipp Boop Bip : Le jeu n'est pas disponible sur mobile !"
        document.body.childNodes[3].appendChild(p);
    }
}

/**
 *
 * isUserOnMobile allows to know if user is on a mobile device
 *
 * @returns {Boolean}
 */
function isUserOnMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
