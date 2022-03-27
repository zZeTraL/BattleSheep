let waitingRoomManager = (function () {

    let waitingRoomContainer = document.querySelector(".room__container");
    let beforeWaitingRoomContainer = waitingRoomContainer.parentElement;
    let debug = document.getElementById("output");

    socket.on("connection", () => {
        console.log("Socket has been initialized (ID: " + socket.id + ")")
    })

    socket.on("joinQueue", () => {
        debug.textContent = "You have joined the queue!"
    })

    socket.on("alreadyInQueue", () => {
        debug.textContent = "You are already joined the queue!"
    })

    socket.on("leaveQueue", () => {
        socket.emit("leaveQueue");
    })

    socket.on("joinPrivateRoom", (privateRoomName) => {
        socket.emit("joinPrivateRoom", privateRoomName)
    })

    socket.on("redirectToRoom", (privateRoomName) => {
        window.location = "play/" + privateRoomName;
    })

    return {
        onClick() {
            socket.emit("joinQueue");
        }
    }
})();