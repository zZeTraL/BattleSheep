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
    let gameStarted = false;

    let ships = document.querySelectorAll(".ship");

    let draggedShip = undefined;
    let draggedShipLength = undefined;
    
    // Saves
    let savedSquareDiv = []
    let savedEnemySquareDiv = []
    let gridSave = undefined;
    let remainingItems = [undefined, 1, 1, 0];
    let selectedItem = undefined;
    let previousItem = undefined;

    // Utilitaires
    let previewFireCase = [];
    let previewShipPlacement = [];
    let shipPlacementCase = [];
    let shipClass = ["black", "red", "green", "orange", "blue"];
    const notAllowedCaseRadar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20, 21, 30, 31, 40, 41, 50, 51, 60, 61, 70, 71, 80, 81, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
    const notAllowedCasePlacement = [];

    // Déclaration des div
    let yourBoard = document.getElementById("yourBoard");
    let enemyBoard = document.getElementById("enemyBoard");
    let shipPlacementContainer = document.getElementById("shipContainer");
    let itemContainer = document.querySelectorAll(".item");

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
            console.log("Game has been initialized successfully!");
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
        getRemainingItems: () => remainingItems,

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

        clearFireCasePreview(){
            for (const element of enemyBoard.childNodes) {
                element.textContent = "";
            }
            previewFireCase = [];
        },

        updateSelectItem(){
            for (const element of itemContainer) {
                let index = parseInt(element.getAttribute("data"));
                if(remainingItems[index] === 0){
                    element.classList.add("item__unavailable");
                }
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

        /*  TODO
         *   - Need to enhance the preview
         */
        fireCasePreview(event){
            // On vérifie la partie est lancée
            if(!gameStarted){
                let target = event.target;
                let index = parseInt(target.getAttribute("data"));
                // On vérifie que c'est au tour du joueur
                if(playerIndex === 0) {
                    gameManager.clearFireCasePreview();
                    if(selectedItem !== undefined) {
                        switch (selectedItem){
                            case 0:
                                previewFireCase.push(index);
                                break;
                            case 1:
                                if(!notAllowedCaseRadar.includes(index)){
                                    previewFireCase.push(index);
                                    previewFireCase.push(index + 1);
                                    previewFireCase.push(index - 1);
                                    previewFireCase.push(index - 10);
                                    previewFireCase.push(index - 11);
                                    previewFireCase.push(index - 9);
                                    previewFireCase.push(index + 10);
                                    previewFireCase.push(index + 11);
                                    previewFireCase.push(index + 9);
                                }
                                break;
                            default:
                                break;
                        }
                        console.log(previewFireCase.length);
                        if(previewFireCase.length !== 0){
                            for (let i = 0; i < previewFireCase.length; i++) {
                                enemyBoard.childNodes[(previewFireCase[i]).toString()].textContent = "X";
                            }
                        }
                    } else {
                        console.log("(FirePreview) Please, select an item to select this case to explode!");
                    }
                } else {
                    console.log("(FirePreview) Not your go!")
                }
            }
        },

        startGame(){
            shipPlacementContainer.style.display = "none";
            gameStarted = true;
            if(playerIndex === 0){
                console.log("your go")
            } else {
                console.log("enemy go")
            }
        },

        fireThisCase(){
            // A SUPP
            if(!gameStarted){
                // On vérifie que c'est le tour du joueur
                if(playerIndex !== 0){
                    console.log("(FireThisCase) Not your go!")
                } else {
                    if(selectedItem !== undefined){
                        if(previewFireCase.length !== 0) {
                            // Si l'item est le radar on envoie une requête différente car le radar affiche au joueurs les cases et non à l'ennemi
                            /*if(selectedItem === 1){
                                socket.emit("radarScan", previewFireCase);
                            } else {
                                // Sinon on affiche les cases touché
                                for (const element of previewFireCase) {
                                    enemyBoard.childNodes[element.toString()].classList.add("caseFired");
                                }

                            }*/

                            if(remainingItems[selectedItem] !== undefined){
                                remainingItems[selectedItem] -= 1;
                                gameManager.updateSelectItem(undefined, true);
                            }

                            socket.emit("fireCase", previewFireCase, selectedItem);
                            gameManager.clearFireCasePreview();

                            playerIndex = 1;
                        } else {
                            console.log("(FireThisCase) Please, select a case to fire!")
                        }
                    } else {
                        console.log("(FireThisCase) Please, select an item!")
                    }
                }
            }
        },

        onFireReceive(indexArray, item){
            console.log("onFire index: " + indexArray[0]);
            switch (item){
                case 0:
                    console.log("0 = rocket");
                    //
                    console.log(indexArray);
                    let caseDestroyed = undefined;
                    if(shipClass.includes(yourBoard.childNodes[indexArray[0].toString()].getAttribute("class"))){
                        yourBoard.childNodes[indexArray[0].toString()].classList.add("caseFired");
                        shipPlacementCase.filter((element) => {
                            console.log(element);
                            if (element === indexArray[0]) {
                                caseDestroyed = shipPlacementCase.indexOf(element);
                                shipPlacementCase.splice(shipPlacementCase.indexOf(element), 1);
                            }
                        })
                    }
                    console.log("Case destroyed is: " + caseDestroyed)
                    console.log("Case ShipPlacement: " + shipPlacementCase)
                    break;
                case 1:
                    console.log("1 = radar");
                    break;
                case 2:
                    console.log("2 = torpille");
                    break;
                case 3:
                    console.log("3 = frag");
                    break;
                default:
                    break;
            }
            //socket.emit("onFireReply")
            playerIndex = 0;
        },









        // Listeners
        selectItem(event){
            let target = event.target;
            let index = parseInt(target.getAttribute("data"));
            let remainingAmount = gameManager.getRemainingItems()[index];
            gameManager.clearFireCasePreview();
            if (remainingAmount !== undefined && remainingAmount === 0) {
                target.classList.add("item__unavailable");
            } else {
                if (previousItem === undefined) {
                    previousItem = target;
                    target.classList.add("item__selected");
                    selectedItem = index;
                } else {
                    previousItem.classList.remove("item__selected");
                    previousItem = target;
                    target.classList.add("item__selected");
                    selectedItem = index;
                }
            }
        },

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