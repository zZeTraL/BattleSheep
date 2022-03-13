let gameManager = (function () {

    socket.once("connection", (index) => {
        socketManager.connect();
        playerIndex = index;
    })

    // Déclaration des variables utilisées pour notre jeu
    let width = 10;
    let playerIndex = 0;
    let savedSquareDiv = []
    let savedEnemySquareDiv = []
    let ships = document.querySelectorAll(".ship");
    let dragedShip = null;
    let dragedShipLength = null;

    // Déclaration des div
    let yourBoard = document.getElementById("yourBoard");
    let enemyBoard = document.getElementById("enemyBoard");

    // DEBUG SECTION
    let youReadySpan = document.getElementById("youReady");
    let enemyReadySpan = document.getElementById("enemyReady");

    return {
        // Initialisation
        init(){
            this.createBoard(yourBoard, savedSquareDiv);
            this.createBoard(enemyBoard, savedEnemySquareDiv);
            console.log(shipData[0].name);
        },

        // Getters
        getPlayerIndex: () => playerIndex,
        getGridWidth: () => width,
        getSavedSquare: () => savedSquareDiv,
        getSavedEnemySquare: () => savedEnemySquareDiv,
        getAllShip: () => ships,

        // Méthodes
        createBoard(whichBoard, array){
            for (let i = 0; i < width * width ; i++) {
                let div = document.createElement("div");
                div.setAttribute("data", i);
                whichBoard.appendChild(div);
                array.push(div);
            }
        },

        // Listeners
        dragStart(){
            console.log("Grab it!!")
            dragedShip = this;
            dragedShipLength = shipData[this.getAttribute("data")].length;
            console.log(dragedShip)
            console.log(dragedShipLength)
        },

        dragOver(event){
            event.preventDefault()
        },

        dragEnter(event){
            event.preventDefault()
        },

        dragLeave(){
            console.log("drag leave!!")
        },

        drop(){
            console.log("DROP!!")
        },

        dragEnd(){
            console.log("drag end!!")
        }

    }
})();