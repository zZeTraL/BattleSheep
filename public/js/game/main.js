window.onload = function () {

    let joinQueueButton = document.getElementById("joinQueueButton");
    joinQueueButton.addEventListener('click', waitingRoomManager.onClick);

}

let form = document.getElementById("form");
form.addEventListener('submit', (e) => {
    e.preventDefault();
    chatManager.sendMessage();
});