let socketManager = (function () {

    // DEBUG SECTION
    let enemyConnectedSpan = document.getElementById("enemyConnected");
    let enemyReadySpan = document.getElementById("enemyReady")

    let youConnectedSpan = document.getElementById("youConnected");
    let youReadySpan = document.getElementById("youReady");

    // IMP
    let quitGameBtn = document.getElementById("quitGameBtn");

    //================
    // Utilitaires
    //================
    socket.once("connection", () => {
        socketManager.connect();
    })
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
        enemyReadySpan.textContent = "READY"
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