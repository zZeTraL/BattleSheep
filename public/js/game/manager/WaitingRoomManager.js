let waitingRoomManager = (function() {

    let waitingRoomContainer = document.querySelector(".room__container");
    let beforeWaitingRoomContainer = waitingRoomContainer.parentElement;
    let debug = document.getElementById("output");

    socket.on("joinQueue", () => {
        debug.textContent = "You have joined the waiting room!"
    })

    return {
        onClick(event){
            socket.emit('joinQueue');
        }
    }
})();