let socketManager = (function () {

    // Id de la room dans laquelle sont nos joueurs
    let roomId = window.location.pathname.slice(6, 16);

    // DEBUG SECTION
    let enemyConnectedSpan = document.getElementById("enemyConnected");
    let enemyReadySpan = document.getElementById("enemyReady")
    let youConnectedSpan = document.getElementById("youConnected");

    //================
    // Utilitaire
    //================
    // Utile pour envoyer des requêtes aux serveur
    socket.once("requestResult", (res) => {
        console.log(res);
    })

    //================
    // Update
    //================
    // Reception d'une requête qui va afficher dans le debug (notre table) que l'ennemi est connecté
    socket.once("enemyConnected", () => {
        enemyConnectedSpan.textContent = "Yes";
    })

    // Reception d'une requête qui va afficher dans le debug (notre table) que l'ennemi est prêt
    socket.once("enemyReady", () => {
        enemyReadySpan.textContent = "Yes";
        // Si le joueur a placé tous ses bateaux, il est donc prêt
        if(gameManager.isAllShipArePlaced()){
            socket.emit("startGame", roomId);
        }
    })

    // Permet de lancer la partie pour nos deux joueurs
    socket.once("startGame", () => {
        // DEBUG
        //console.log("Game is starting...")
        gameManager.startGame();
    })

    // Lorsque le joueur se fait tirer dessus par l'ennemi
    // Cette reception permet d'afficher au joueur les cases détruites par le tir de l'ennemi
    socket.on("onFireReceive", (indexArray, item) => {
        gameManager.onFireReceive(indexArray, item);
    })

    // A l'inverse de la requête au-dessus celle-ci affiche les cases détruites à l'ennemi (celui qui tire)
    socket.on("onFireReply", (boatPartSunken, caseDestroyed, item) => {
        gameManager.onFireReply(boatPartSunken, caseDestroyed, item);
    })

    // Permet d'informer aux deux joueurs qu'un gagnant a été trouvé
    socket.once("youWin", () => {
      gameManager.finishGame();
    })

    // Permet de quitter la partie une fois la partie terminé ou si le joueur rage quit :)
    socket.once("leaveRoom", () => {
        window.location = "/play";
    })

    return {
        connect() {
            console.log("Socket has been initialized (ID: " + socket.id + ")")
            socket.emit("enemyConnected")
            youConnectedSpan.textContent = "Yes";
        },

        request: (req) => socket.emit(req),
    }
})();