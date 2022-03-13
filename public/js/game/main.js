window.onload = function() {

    let roomId = window.location.pathname.slice(6, 16);
    setTimeout(() => {
        socket.emit("playerConnected", roomId);
    }, 500)

    // Setting up quit and ready button
    document.getElementById("quitGameBtn").addEventListener('click', () => {
        socket.emit("leaveRoom", (roomId));
    })

    document.getElementById("readyBtn").addEventListener('click', () => {
        socket.emit("enemyReady");
        document.getElementById("youReady").textContent = "Yes";
    })

    // Init the board for both players
    gameManager.init();

    gameManager.getAllShip().forEach(element => {
        element.addEventListener('dragstart', gameManager.dragStart);
    })

    gameManager.getSavedSquare().forEach(element => {
        element.addEventListener('click', () => {
            console.log("clicked! (" + element.getAttribute("data") + ")")
        })
        element.addEventListener('dragstart', gameManager.dragStart);
        element.addEventListener('dragover', gameManager.dragOver);
        element.addEventListener('dragenter', gameManager.dragEnter);
        element.addEventListener('dragleave', gameManager.dragLeave);
        element.addEventListener('drop', gameManager.drop);
        element.addEventListener('dragend', gameManager.dragEnd);
    })

    gameManager.getSavedEnemySquare().forEach(element => {
        element.addEventListener('click', () => {
            console.log("clicked! (" + element.getAttribute("data") + ")");
        })
    })
}