import Swiper from "https://unpkg.com/swiper@8/swiper-bundle.esm.browser.min.js"

window.onload = function () {
    let roomId = window.location.pathname.slice(6, 16);
    setTimeout(() => {
        socket.emit("playerConnected", roomId);
    }, 500)

    // All buttons listeners
    registerEvents(roomId);

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
        element.addEventListener('click', gameManager.fireCasePreview);
    })
}