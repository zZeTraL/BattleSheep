let socketManager = (function () {

    let roomId = window.location.pathname.slice(6, 16);

    // DEBUG SECTION
    let enemyConnectedSpan = document.getElementById("enemyConnected");
    let enemyReadySpan = document.getElementById("enemyReady")
    let youConnectedSpan = document.getElementById("youConnected");
    let youReadySpan = document.getElementById("youReady");



    //================
    // Utilitaires
    //================
    socket.once("requestResult", (res) => {
        console.log(res);
    })

    //================
    // Update
    //================
    socket.once("enemyConnected", () => {
        enemyConnectedSpan.textContent = "Yes";
    })

    socket.once("enemyReady", () => {
        enemyReadySpan.textContent = "Yes";
        // Si le joueur a placé tous ses bateaux, il est donc prêt
        if(gameManager.isAllShipArePlaced()){
            socket.emit("startGame", roomId);
        }
    })

    socket.once("startGame", () => {
        console.log("start the game")
        gameManager.startGame();
    })






    socket.once("leaveRoom", () => {
        window.location = "/";
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