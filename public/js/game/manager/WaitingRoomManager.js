let waitingRoomManager = (function () {

    let waitingRoomContainer = document.querySelector(".room__container");
    let beforeWaitingRoomContainer = waitingRoomContainer.parentElement;
    let debug = document.getElementById("output");

    socket.on("joinQueue", () => {
        debug.textContent = "You have joined the waiting room!"
    })

    socket.on("leaveQueue", () => {
        try {
            console.log('[socket]', 'leave room :', "waitingRoom");
            socket.leave("waitingRoom");
        } catch (e) {
            console.log('[error]', 'leave room :', e);
        }
        socket.emit("joinGame");
    })

    return {
        onClick(event) {
            socket.emit('joinQueue');
        }
    }
})();