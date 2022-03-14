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
    let draggedShip = null;
    let draggedShipLength = null;

    let previewShipPlacement = [];
    const notAllowedCase = [];

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
        getPreviousPreview: () => previewShipPlacement,

        // Méthodes
        createBoard(whichBoard, array){
            for (let i = 0; i < width * width ; i++) {
                let div = document.createElement("div");
                div.setAttribute("data", i.toString());
                whichBoard.appendChild(div);
                array.push(div);
            }
        },

        clearPreview(){

        },

        // Listeners
        dragStart(){
            console.log("Grab it!!")
            draggedShip = this;
            draggedShipLength = shipData[parseInt(this.getAttribute("data"))].length;
            console.log(draggedShip);
            console.log(draggedShipLength);
        },

        dragOver(event){
            event.preventDefault()
        },

        dragEnter(event){
            setTimeout(function(){
                let target = event.target;
                let caseIndex = parseInt(target.getAttribute("data")) + 1;
                for (let i = 0; i < draggedShipLength; i++) {
                    yourBoard.childNodes[caseIndex.toString()].classList.add("placement__preview");
                    previewShipPlacement.push(caseIndex);
                    ++caseIndex;
                }
                console.log("dragEnter [" + previewShipPlacement + "]")
            },5)
        },

        dragLeave(){
            for (let i = 0; i < previewShipPlacement.length; i++) {
                yourBoard.childNodes[(previewShipPlacement[i].toString())].classList.remove("placement__preview");
            }
            previewShipPlacement = [];
            console.log("dragLeave")
        },

        drop(event){
            let droppedCase = event.target;
            let caseIndex = droppedCase.getAttribute("data");
            console.log("You have dropped your ship on the case: " + caseIndex);
            console.log(yourBoard.childNodes[++caseIndex]);
            yourBoard.childNodes[caseIndex].setAttribute("class", "test");
            gameManager.clearPreview()
        },

        dragEnd(){
            if(previewShipPlacement.length !== 0){
                for (let i = 0; i < previewShipPlacement.length; i++) {
                    yourBoard.childNodes[(previewShipPlacement[i].toString())].classList.remove("placement__preview");
                }
                previewShipPlacement = [];
            }
        }

    }
})();