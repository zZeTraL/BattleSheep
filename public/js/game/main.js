import Swiper from "https://unpkg.com/swiper@8/swiper-bundle.esm.browser.min.js"

window.onload = function () {
    let roomId = window.location.pathname.slice(6, 16);
    setTimeout(() => {
        socket.emit("playerConnected", roomId);
    }, 500)

    document.getElementById("quitGameBtn").addEventListener('click', () => {
        socket.emit("leaveRoom", (roomId));
    })

    document.getElementById("rotateShip").addEventListener('click', () => {
        document.querySelectorAll(".ship").forEach((element) => {
            element.classList.toggle("rotate");
            gameManager.toggleRotate();
        })
        console.log(gameManager.getRotateState())
    })

    document.getElementById("readyBtnToStartGame").addEventListener('click', () => {
        // Si on a placé tous les bateaux (i.e. 17 cases occupés dans notre tableau)
        if(!gameManager.getReadyState()){
            if(gameManager.isAllShipArePlaced()){
                gameManager.setReadyState(true);
                socket.emit("enemyReady");
                document.getElementById("youReady").textContent = "Yes";
                console.log(gameManager.getReadyState());
            } else {
                console.log("You haven't placed all your ships!")
            }
        } else {
            console.log("You are already ready!")
        }
        /* TODO
         *  - inform the player that he hasn't placed all his ships
         */
    })

    // Init the board for both players
    gameManager.init();

    gameManager.getAllShip().forEach(element => {
        element.addEventListener('dragstart', gameManager.dragStart);
        element.addEventListener('dragend', gameManager.dragEnd);
    })

    gameManager.getSavedSquare().forEach(element => {
        element.addEventListener('click', () => {
            console.log("clicked! (" + element.getAttribute("data") + ")")
        })
        element.addEventListener('drop', gameManager.drop);
        element.addEventListener('dragenter', gameManager.dragEnter);
        element.addEventListener('dragleave', gameManager.dragLeave);
        element.addEventListener('dragend', gameManager.dragEnd);
        element.addEventListener('dragover', gameManager.dragOver);
    })

    gameManager.getSavedEnemySquare().forEach(element => {
        element.addEventListener('click', () => {
            console.log("clicked! (" + element.getAttribute("data") + ")");
            gameManager.fireThisCase();
        })
    })
}

window.onunload = function(){
    alert("sure")
};