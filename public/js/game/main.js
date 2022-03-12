window.onload = function(){
    let roomId = window.location.pathname.slice(6, 16);
    socket.emit("playerConnected", roomId);

    document.getElementById("quitGameBtn").addEventListener('click', () => {
        socket.emit("leaveRoom", (roomId));
    })

    document.getElementById("readyBtn").addEventListener('click', () => {
        socket.emit("enemyReady");
        document.getElementById("isReady").textContent = "Yes";
    })

    gameManager.init();
}
