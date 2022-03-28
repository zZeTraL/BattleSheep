let chatManager = (function () {

    // Déclaration des variables
    const maxChar = 100; // with space
    let input = document.getElementById("input");
    let chat = document.getElementById("chatDiv");
    let currentChar = document.getElementById("currentChar");

    // Reception d'une requête émise par le serveur contenant le message de l'autre utilisateur et son pseudo à afficher sur notre page
    socket.on("messageReceived", (username, msg) => {
        let p = document.createElement("p");
        p.textContent = "[" + username + "] > " + msg;
        chat.appendChild(p);
    })

    return {

        // Getters
        getMaxChar: () => maxChar,
        getMessage: () => input.value,
        getLength: () => input.value.length,

        // Methods
        resetInput() {
            input.value = "";
            currentChar.textContent = "0/" + maxChar;
        },

        /**
         * Envoie une requête au serveur contenant le message et l'id de la room (chaque room à son propre chat)
         *
         * @param {string} roomId
         */
        sendMessage(roomId) {
            // On vérifie que le message envoyé n'est pas vide (sans caractère) et
            if (input.value && input.value.length <= maxChar) {
                socket.emit("messageSent", input.value, roomId);
                // On reset l'input i.e. on supprime le contenu de notre input
                this.resetInput();
            } else {
                // Si le message est video on envoie dans la console de l'utilisateur une erreur pour le notifier
                console.error("ArrayIndexOutOfBoundsException:chatManager:13")
            }
        },

        // Listener qui se déclenche lorsque le joueur ecrit un message
        onTyping() {
            // Si l'utilisateur dépasse la limite de caractères
            if (input.value.length > maxChar) {
                // On affiche avec un changement de couleur
                currentChar.classList.toggle("animate__animated");
                currentChar.classList.toggle("animate__shakeX");
                currentChar.style.color = "red";
                currentChar.textContent = input.value.length + "/" + maxChar;
            } else {
                currentChar.style.color = "black";
                currentChar.textContent = input.value.length + "/" + maxChar;
            }
        },
    }
})();