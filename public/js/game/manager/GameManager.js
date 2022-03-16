let gameManager = (function () {

    socket.once("connection", (index) => {
        socketManager.connect();
        playerIndex = index;
    })

    // Déclaration des constantes
    // Nombre de bateaux nécessaire pour commencer être ready
    const playerReadyWhen = 17;

    // Déclaration des variables utilisées pour notre jeu
    let width = 10;
    let playerIndex = 0;
    let rotate = false;
    let isEnemyReady = false;
    let isYouReady = false;

    let ships = document.querySelectorAll(".ship");

    let draggedShip = undefined;
    let draggedShipLength = undefined;

    // Saves
    let savedSquareDiv = []
    let savedEnemySquareDiv = []
    let gridSave = undefined;

    // Utilitaires
    let previewShipPlacement = [];
    let shipPlacementCase = [];
    const notAllowedCase = [];

    // Déclaration des div
    let yourBoard = document.getElementById("yourBoard");
    let enemyBoard = document.getElementById("enemyBoard");
    let shipPlacementContainer = document.getElementById("shipContainer");

    // DEBUG SECTION
    let youReadySpan = document.getElementById("youReady");
    let enemyReadySpan = document.getElementById("enemyReady");

    /**
     * Permet d'éviter que le joueur modifie sa grille (le visuel)
     * Remarque: cela évite juste en soit une modification visuelle juste visible pour le client
     *           ça n'impact en aucun cas la game car la grille du joueur et de l'ennemi sont sauvegardées
     *           dans des variables inaccessibles
     */
    function noBypass(){
        // if I have the time, I'll do it
    }

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
        getPlacementPreview: () => previewShipPlacement,
        getRotateState: () => rotate,
        getReadyState: () => isYouReady,
        isAllShipArePlaced: () => shipPlacementCase.length === playerReadyWhen,

        // Setters
        toggleRotate: () => rotate = !rotate,
        setReadyState: (bool) => isYouReady = bool,
        setEnemyReadyState: (bool) => isEnemyReady = bool,

        // Méthodes
        createBoard(whichBoard, array){
            // On commence à 1 car le childNodes de notre grille commence à l'index 0 avec un type text et non une div
            for (let i = 1; i <= width * width ; i++) {
                let div = document.createElement("div");
                div.setAttribute("data", i.toString());
                whichBoard.appendChild(div);
                array.push(div);
            }
        },

        clearPreview(){
            if(previewShipPlacement.length !== 0){
                for (let i = 0; i < previewShipPlacement.length; i++) {
                    yourBoard.childNodes[(previewShipPlacement[i].toString())].classList.toggle("placement__preview");
                }
                previewShipPlacement = [];
            }
        },

        isShipAlreadyPlace(caseIndex){
            if(draggedShipLength === undefined) return false;
            let isShipAlreadyPlacedHere = false;
            if(!rotate){
                for (let i = 0; i < draggedShipLength; i++) {
                    let tmp = parseInt(caseIndex) + i;
                    if(shipPlacementCase.includes(parseInt(yourBoard.childNodes[tmp.toString()].getAttribute("data")))){
                        isShipAlreadyPlacedHere = true;
                        break;
                    }
                }
            } else {
                for (let i = 0, j = 0; j < draggedShipLength; i -= 10, j++) {
                    let tmp = parseInt(caseIndex) + i;
                    if(shipPlacementCase.includes(parseInt(yourBoard.childNodes[tmp.toString()].getAttribute("data")))){
                        isShipAlreadyPlacedHere = true;
                        break;
                    }
                }
            }
            return isShipAlreadyPlacedHere;
        },

        startGame(){
            shipPlacementContainer.style.display = "none";
            if(playerIndex === 0){
                console.log("your go")
            } else {
                console.log("enemy go")
            }
        },

        fireThisCase(){

        },










        // Listeners
        dragStart(){
            gameManager.clearPreview();
            console.log("You grab your target!!")
            draggedShip = this;
            draggedShipLength = shipData[parseInt(this.getAttribute("data"))].length;
            console.log(draggedShip);
            console.log(draggedShipLength);
        },

        dragOver(event){
            event.preventDefault();
        },

        dragEnter(event){
            setTimeout(function(){
                let target = event.target;
                let caseIndex = target.getAttribute("data");
                if(!rotate){
                    for (let i = 0; i < draggedShipLength; i++) {
                        let tmp = parseInt(caseIndex) + i;
                        yourBoard.childNodes[tmp.toString()].classList.toggle("placement__preview");
                        previewShipPlacement.push(tmp);
                    }
                } else {
                    for (let i = 0, j = 0; j < draggedShipLength; i -= 10, j++) {
                        let tmp = parseInt(caseIndex) + i;
                        yourBoard.childNodes[tmp.toString()].classList.toggle("placement__preview");
                        previewShipPlacement.push(tmp);
                    }
                }
                console.log("dragEnter [" + previewShipPlacement + "]")
            },2)
        },

        dragLeave(){
            gameManager.clearPreview();
            console.log("drag leave!!")
        },

        drop(event){
            event.preventDefault();
            let droppedItem = event.target;
            try {
                //console.log(yourBoard.childNodes)
                if(draggedShip.getAttribute("class").includes("ship")) {
                    let caseIndex = droppedItem.getAttribute("data");
                    let whichColor = shipData[draggedShip.getAttribute("data")].visualization;
                    // On check si un bateau est déjà placé dans les cases
                    console.log(gameManager.isShipAlreadyPlace(caseIndex))
                    if(!gameManager.isShipAlreadyPlace(caseIndex)){
                        if(!rotate){
                            for (let i = 0; i < draggedShipLength; i++) {
                                let tmp = parseInt(caseIndex) + i;
                                yourBoard.childNodes[tmp.toString()].classList.add(whichColor);
                                shipPlacementCase.push(tmp);
                            }
                        } else {
                            for (let i = 0, j = 0; j < draggedShipLength; i -= 10, j++) {
                                let tmp = parseInt(caseIndex) + i;
                                yourBoard.childNodes[tmp.toString()].classList.add(whichColor);
                                shipPlacementCase.push(tmp);
                            }
                        }
                        // On supprime le listener associé au bateau qu'on vient de placer
                        draggedShip.removeEventListener('dragstart', gameManager.dragStart);
                        draggedShip.removeAttribute("draggable");
                    } else {
                        console.log("A ship is already placed in those cases")
                    }

                    console.log(gameManager.isShipAlreadyPlace(caseIndex));
                    console.log("You have dropped your ship on the case: " + caseIndex);
                    console.log(yourBoard.childNodes[caseIndex]);
                    console.log(shipPlacementCase);
                }
                gameManager.clearPreview();
            } catch(error){
                console.log(error);
            }
        },

        dragEnd(){
            draggedShip = undefined;
            draggedShipLength = undefined;
            gameManager.clearPreview();
            console.log("drag end!!")
        }

    }
})();