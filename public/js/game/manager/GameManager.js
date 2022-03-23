let gameManager = (function () {

    socket.once("connection", (index) => {
        socketManager.connect();
        playerIndex = index;
    })

    // Nombre de bateaux nécessaire pour être ready
    const playerReadyWhen = 17;

    // Déclaration des variables utilisées pour notre jeu
    let width = 10;
    let playerIndex = 0;
    let isYouReady = false;
    let gameStarted = false;



    // Statistiques (nombre de tirs / nombre de bateaux coulés)
    let amountOfFire = 0;
    let amountOfBoatPartSunken = 0;



    // Saves
    let savedSquareDiv = []
    let savedEnemySquareDiv = []
    let gridSave = undefined;
    let remainingItems = [undefined, 1, 1, 1];
    let selectedItem = undefined;
    let previousItem = undefined;



    // Utilitaires
    let previewFireCase = [];
    let previewShipPlacement = [];
    let shipPlacementCase = [];
    let shipClass = ["black", "red", "green", "orange", "blue"];
    const notAllowedCaseRadar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20, 21, 30, 31, 40, 41, 50, 51, 60, 61, 70, 71, 80, 81, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
    const notAllowedCasePlacement = [];



    // HTML Elements
    let ships = document.querySelectorAll(".ship");
    let fireOutput = document.getElementById("fireOutput");

    let gameBoards = document.getElementById("gameBoards");
    let yourBoard = document.getElementById("yourBoard");
    let enemyBoard = document.getElementById("enemyBoard");

    let itemsContainer = document.getElementById("itemContainer");
    let shipContainer = document.getElementById("shipContainer");
    let itemContainer = document.querySelectorAll(".item");
    let shipPlacementContainer = document.getElementById("shipContainer");




    // Drag section
    let draggedShip = undefined;
    let draggedShipLength = undefined;



    // DEBUG SECTION
    let rotate = false;
    let youReadySpan = document.getElementById("youReady");
    let enemyReadySpan = document.getElementById("enemyReady");

    /**
     * Permet d'éviter que le joueur modifie sa grille (le visuel)
     * Remarque: cela évite juste en soit une modification visuelle juste visible pour le client
     *           ça n'impact en aucun cas la game car la grille du joueur et de l'ennemi sont sauvegardées
     *           dans des variables inaccessibles
     */
    function noBypass() {
        // if I have the time, I'll do it
    }

    return {
        // Initialisation
        init() {
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
        getShipPlacement: () => shipPlacementCase,
        getRotateState: () => rotate,
        getReadyState: () => isYouReady,
        isAllShipArePlaced: () => shipPlacementCase.length === playerReadyWhen,
        getRemainingItems: () => remainingItems,

        // Setters
        toggleRotate: () => rotate = !rotate,
        setReadyState: (bool) => isYouReady = bool,

        // Méthodes
        createBoard(whichBoard, array) {
            // On commence à 1 car le childNodes de notre grille commence à l'index 0 avec un type text et non une div
            for (let i = 1; i <= width * width; i++) {
                let div = document.createElement("div");
                div.setAttribute("data", i.toString());
                whichBoard.appendChild(div);
                array.push(div);
            }
        },

        clearPreview() {
            if (previewShipPlacement.length !== 0) {
                for (let i = 0; i < previewShipPlacement.length; i++) {
                    yourBoard.childNodes[(previewShipPlacement[i].toString())].classList.toggle("placement__preview");
                }
                previewShipPlacement = [];
            }
        },

        clearFireCasePreview() {
            for (const element of enemyBoard.childNodes) {
                element.textContent = "";
            }
            previewFireCase = [];
        },

        updateSelectItem() {
            for (const element of itemContainer) {
                let index = parseInt(element.getAttribute("data"));
                if (remainingItems[index] === 0) {
                    element.classList.add("item__unavailable");
                }
            }
            selectedItem = 0;
            itemContainer[0].classList.toggle("item__selected");
            previousItem = itemContainer[0];
        },

        isShipAlreadyPlace(caseIndex) {
            if (draggedShipLength === undefined) return false;
            let isShipAlreadyPlacedHere = false;
            if (!rotate) {
                for (let i = 0; i < draggedShipLength; i++) {
                    let tmp = parseInt(caseIndex) + i;
                    if (shipPlacementCase.includes(parseInt(yourBoard.childNodes[tmp.toString()].getAttribute("data")))) {
                        isShipAlreadyPlacedHere = true;
                        break;
                    }
                }
            } else {
                for (let i = 0, j = 0; j < draggedShipLength; i -= 10, j++) {
                    let tmp = parseInt(caseIndex) + i;
                    if (shipPlacementCase.includes(parseInt(yourBoard.childNodes[tmp.toString()].getAttribute("data")))) {
                        isShipAlreadyPlacedHere = true;
                        break;
                    }
                }
            }
            return isShipAlreadyPlacedHere;
        },

        fireCasePreview(event) {
            // On vérifie la partie est lancée
            if (!gameStarted) {
                let target = event.target;
                let index = parseInt(target.getAttribute("data"));
                // On vérifie que c'est au tour du joueur
                if (playerIndex === 0) {
                    gameManager.clearFireCasePreview();
                    if (selectedItem !== undefined) {
                        switch (selectedItem) {
                            case 0:
                                previewFireCase.push(index);
                                break;
                            case 1:
                                if (!notAllowedCaseRadar.includes(index)) {
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
                            case 2:
                                previewFireCase.push(index);
                                break;
                            case 3:
                                if (!notAllowedCaseRadar.includes(index)) {
                                    previewFireCase.push(index);
                                    previewFireCase.push(index + 1);
                                    previewFireCase.push(index - 1);
                                    previewFireCase.push(index + 10);
                                    previewFireCase.push(index - 10);
                                }
                                break;
                            default:
                                break;
                        }
                        console.log("(previewFireCase) preview case: " + previewFireCase);
                        if (previewFireCase.length !== 0) {
                            for (let i = 0; i < previewFireCase.length; i++) {
                                enemyBoard.childNodes[(previewFireCase[i]).toString()].textContent = "X";
                            }
                        }
                        fireOutput.textContent = "Ready?"
                    } else {
                        console.log("(previewFireCase) Please, select an item!");
                        fireOutput.textContent = "Please, select an item!"
                    }
                } else {
                    //console.log("(previewFireCase) Not your go!")
                    fireOutput.textContent = "Enemy go!"
                }
            }
        },

        startGame() {
            shipPlacementContainer.style.display = "none";
            gameStarted = true;
            if (playerIndex === 0) {
                fireOutput.textContent = "Your go!"
            } else {e
                fireOutput.textContent = "Enemy go!"
            }
        },

        finishGame(enemyAmountOfFire, enemyAmountOfBoatPartSunken){
            console.log("YOU WIN!!!")
            gameBoards.remove();
            shipContainer.remove();
            itemsContainer.remove();
            console.log(enemyAmountOfFire);
            console.log(enemyAmountOfBoatPartSunken)
        },

        checkWin() {
            if (shipPlacementCase.length === 0) {
                socket.emit("winnerFound", amountOfFire, amountOfBoatPartSunken);
                gameBoards.remove();
                shipContainer.remove();
                itemsContainer.remove();
            }
        },

        /**
         * Fonction exécutée lorsque l'on clique sur le bouton fire quand c'est son tour
         */
        fireThisCase() {
            // Si la partie est commencée
            if (!gameStarted) {
                // On vérifie que c'est au tour du joueur
                if (playerIndex !== 0) {
                    console.log("(FireThisCase) Not your go!")
                    fireOutput.textContent = "Enemy go!"
                } else {
                    // Si c'est le tour du joueur, on vérifie qu'il a sélectionné une arme
                    if (selectedItem !== undefined) {

                        // On vérifie si la case n'a pas déjà été détruite
                        for (let i = 0; i < previewFireCase.length; i++) {
                            let tmp = enemyBoard.childNodes[previewFireCase[i].toString()].getAttribute("class");
                            if (tmp === "boatPartSunken" || tmp === "caseFired") {
                                previewFireCase.splice(i, 1);
                            }
                        }

                        // DEBUG
                        console.log(previewFireCase)

                        // On vérifie qu'il a bien sélectionné une case sur la quelle l'arme va tirer
                        if (previewFireCase.length !== 0) {
                            // On envoie une requête au serveur qui se charger de transmettre les données à l'ennemi
                            // En gros, on transmet des données telles que : les cases touchées par notre arme (previewFireCase) et l'arme utilisée
                            socket.emit("fireCase", previewFireCase, selectedItem);

                            // Si l'arme n'est pas une rocket (car nombre d'utilisations illimitées) on réduit de 1 le nombre d'utilisations restantes
                            if (remainingItems[selectedItem] !== undefined) {
                                // On retire une utilisation à l'objet
                                remainingItems[selectedItem] -= 1;
                                // On update l'afficheur pour sélectionner les arme i.e. la couleur de sélection verte passe au rouge si l'arme ne peut plus être utilisée
                                gameManager.updateSelectItem();
                            }

                            // On clear notre preview de l'impacte de notre arme
                            gameManager.clearFireCasePreview();

                            // On passe son tour
                            fireOutput.textContent = "Enemy go!"
                            playerIndex = 1;
                        } else {
                            // DEBUG
                            //console.log("(FireThisCase) Please, select an available case to fire!")
                            let currentValue = fireOutput.textContent;
                            fireOutput.textContent = "Please, select an available case!"
                        }
                    } else {
                        // DEBUG
                        //console.log("(FireThisCase) Please, select an item!")
                        let currentValue = fireOutput.textContent;
                        fireOutput.textContent = "Please, select an item!"
                    }
                }
            }
        },

        // Pour vous
        onFireReceive(indexArray, item) {
            // DEBUG
            console.log("(onFireReceive) IndexArray: " + indexArray);

            // Déclaration de variables pour simplifier le code / le rendre plus lisible
            let yourBoardChildNodes = yourBoard.childNodes;
            let boatPartSunken = [];
            let caseDestroyed = [];

            // Switch en fonction de l'item choisit
            switch (item) {
                // Arme: missile classique0
                case 0:
                    // On stocke la liste des classes que la case ciblée possède
                    let tmpClassList = gameManager.classListIntoArray(yourBoardChildNodes[indexArray[0]]);
                    // Si cette liste de classe n'est pas vide
                    if(tmpClassList.length !== 0){
                        // On boucle est on regarde si une des classes correspondent à une classe que doit posséder un bateau
                        for (let i = 0; i < tmpClassList.length; i++) {
                            if (shipClass.includes(tmpClassList[i])) {
                                // On retire toutes les classes de la case ciblée
                                yourBoardChildNodes[indexArray[0]].removeAttribute("class");
                                // On affiche que la case qui contenait une partie du bateau a été détruite
                                yourBoardChildNodes[indexArray[0]].classList.add("boatPartSunken");
                                // On vient donc ainsi retirer cette case de la liste des cases qui compose l'ensemble des positions où un bateau est présent
                                shipPlacementCase.filter((element) => {
                                    if (element === indexArray[0]) {
                                        shipPlacementCase.splice(shipPlacementCase.indexOf(element), 1);
                                    }
                                })
                                // On ajoute la case ciblée dans la liste des parties des bateaux détruites
                                // Sert à ce que l'ennemi puisse voir qu'il vient de détruire une case contenant une partie de bateau
                                boatPartSunken.push(indexArray[0]);
                            }
                        }
                    } else {
                        // On affiche que la case a été détruite mais ne contenait pas une partie de bateau
                        yourBoardChildNodes[indexArray[0]].removeAttribute("class");
                        yourBoardChildNodes[indexArray[0]].classList.add("caseFired");
                        caseDestroyed.push(indexArray[0]);
                    }
                    // DEBUG
                    //console.log("(onFireReceive #Missile)" + tmpClassList)
                    break;

                // Utilitaire: radar, affiche si un bateau est présent dans cases autour de la case ciblée
                case 1:
                    for (let i = 0; i < indexArray.length; i++) {
                        let tmpClassList = gameManager.classListIntoArray(yourBoardChildNodes[indexArray[i]]);
                        for (let j = 0; j < tmpClassList.length; j++) {
                            if (shipClass.includes(tmpClassList[j])) {
                                // On affiche indique au joueur par une réduction de l'opacité que la case vient d'être révélée
                                yourBoardChildNodes[indexArray[i]].classList.add("opacity");
                                boatPartSunken.push(indexArray[i]);
                            }
                        }
                        // DEBUG
                        //console.log("(onFireReceive #Radar)" + tmpClassList)
                    }
                    break;

                // Arme: Torpille
                case 2:
                    break;

                // Arme: Missile à fragmentation
                case 3:
                    for (let i = 0; i < indexArray.length; i++) {
                        let tmpClassList = gameManager.classListIntoArray(yourBoardChildNodes[indexArray[i]]);
                        if(tmpClassList.length !== 0){
                            for (let j = 0; j < tmpClassList.length; j++) {
                                if (shipClass.includes(tmpClassList[j])) {
                                    // On retire toutes les classes de la case ciblée
                                    yourBoardChildNodes[indexArray[i]].removeAttribute("class");
                                    // On affiche que la case qui contenait une partie du bateau a été détruite
                                    yourBoardChildNodes[indexArray[i]].classList.add("boatPartSunken");
                                    // On vient donc ainsi retirer cette case de la liste des cases qui compose l'ensemble des positions où un bateau est présent
                                    shipPlacementCase.filter((element) => {
                                        if (element === indexArray[i]) {
                                            shipPlacementCase.splice(shipPlacementCase.indexOf(element), 1);
                                        }
                                    })
                                    // On ajoute la case ciblée dans la liste des parties des bateaux détruites
                                    // Sert à ce que l'ennemi puisse voir qu'il vient de détruire une case contenant une partie de bateau
                                    boatPartSunken.push(indexArray[i]);
                                }
                            }
                        } else {
                            // On affiche que la case a été détruite mais ne contenait pas une partie de bateau
                            yourBoardChildNodes[indexArray[i]].removeAttribute("class");
                            yourBoardChildNodes[indexArray[i]].classList.add("caseFired");
                            caseDestroyed.push(indexArray[i]);
                        }
                    }
                    break;
                default:
                    break;
            }

            gameManager.checkWin();
            socket.emit("fireReply", boatPartSunken, caseDestroyed, item);

            fireOutput.textContent = "Your go!"
            playerIndex = 0;
        },

        classListIntoArray(element) {
            let classToArray = [];
            element.classList.forEach((element) => { classToArray.push(element); })
            return classToArray;
        },

        // Pour l'ennemi
        onFireReply(boatPartSunken, caseDestroyed, item) {
            // DEBUG
            console.log("(onFireReply) Case(s) contenant un/des parties de bateau(x): " + boatPartSunken);
            console.log("(onFireReply) Case(s) détruite(s): " + caseDestroyed);

            if (item !== 1) {
                if (boatPartSunken.length !== 0) {
                    for (let i = 0; i < boatPartSunken.length; i++) {
                        enemyBoard.childNodes[boatPartSunken[i].toString()].removeAttribute("class");
                        enemyBoard.childNodes[boatPartSunken[i].toString()].classList.add("boatPartSunken");
                    }
                }

                if (caseDestroyed.length !== 0) {
                    for (let i = 0; i < caseDestroyed.length; i++) {
                        enemyBoard.childNodes[caseDestroyed[i].toString()].classList.add("caseFired");
                    }
                }
            } else {
                for (let i = 0; i < boatPartSunken.length; i++) {
                    enemyBoard.childNodes[boatPartSunken[i].toString()].classList.add("contrast");
                }
            }

        },


        // Listeners
        selectItem(event) {
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

        dragStart() {
            gameManager.clearPreview();
            console.log("You grab your target!!")
            draggedShip = this;
            draggedShipLength = shipData[parseInt(this.getAttribute("data"))].length;
            console.log(draggedShip);
            console.log(draggedShipLength);
        },

        dragOver(event) { event.preventDefault(); },

        dragEnter(event) {
            setTimeout(function () {
                let target = event.target;
                let caseIndex = target.getAttribute("data");
                if (!rotate) {
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
            }, 2)
        },

        dragLeave() { gameManager.clearPreview(); },

        drop(event) {
            event.preventDefault();
            let droppedItem = event.target;
            try {
                //console.log(yourBoard.childNodes)
                if (draggedShip.getAttribute("class").includes("ship")) {
                    let caseIndex = droppedItem.getAttribute("data");
                    let whichColor = shipData[draggedShip.getAttribute("data")].visualization;
                    // On check si un bateau est déjà placé dans les cases
                    console.log(gameManager.isShipAlreadyPlace(caseIndex))
                    if (!gameManager.isShipAlreadyPlace(caseIndex)) {
                        if (!rotate) {
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
            } catch (error) {
                console.log(error);
            }
        },

        dragEnd() {
            draggedShip = undefined;
            draggedShipLength = undefined;
            gameManager.clearPreview();
            console.log("drag end!!")
        }

    }
})();