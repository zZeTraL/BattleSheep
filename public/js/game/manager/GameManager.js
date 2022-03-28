let gameManager = (function () {

    // Reception unique d'une requête envoyée par le serveur
    // Le serveur choisi le joueur qui va commencer en premier
    socket.once("connection", (index) => {
        socketManager.connect();
        playerIndex = index;
    })

    // Reception unique d'une requête envoyée par le serveur
    // Met à jour les statistiques du joueur pour l'affichage du scoreboard en fin de partie
    socket.once("receiveStatistic", (eFireCount, eBoatSunkenCount) => {
        // DEBUG
        //console.log("statistics received")
        enemyBoatSunkenCount = eBoatSunkenCount;
        enemyFireCount = eFireCount;
    })

    // Nombre de bateaux nécessaire pour pouvoir appuyer sur le bouton ready lors de la phase de sélection
    const playerReadyWhen = 17;

    // Déclaration des variables
    // Longueur et largeur de notre grille
    let width = 10;
    // Indique le tour du joueur : 0 = son tour / 1 = tour de l'ennemi / -1 = perdant!!
    let playerIndex = 0;
    // Booléens pour savoir si le joueur/ennemi est prêt
    let isYouReady = false;
    let isEnemyReady = false;
    // indique si la partie est en cours
    let gameStarted = false;

    // Statistiques (nombre de tirs / nombre de bateaux coulés)
    let fireCount = 0;
    let boatSunkenCount = 0;
    // Pour l'ennemi
    let enemyFireCount = 0;
    let enemyBoatSunkenCount = 0;

    // Sauvegardes
    /*
     * Sauvegarde de la grille du joueur avant la phase de placement i.e. elle est vide.
     * Ces deux variables ne sont pas très utile mais l'auraient pu être,
     * si nous avons ajoutés un système de revanche au lieu d'être redirigé au lobby
     */
    let savedSquareDiv = []
    let savedEnemySquareDiv = []
    // Sauvegarde la grille du joueur après la phase de placement
    // [UNUSED] let gridSave = undefined;

    // Array qui contient le nombre d'utilisations de nos armes
    // 0 = missile / 1 = radar / 2 = torpille / 3 = frag
    let remainingItems = [undefined, 1, 1, 1];
    // Indique quel item le joueur a sélectionné
    let selectedItem = undefined;
    // Indique l'ancien item que le joueur avait sélectionné
    let previousItem = undefined;

    // Utilitaires (super important!)
    // Array qui contient les cases impactées par le tir d'une arme (preview de la zone de tir)
    let previewFireCase = [];
    // Array qui contient les cases où l'on souhaite placer un bateau (preview lors du placement d'un bateau)
    let previewShipPlacement = [];
    // !IMPORTANT! Cette array contient les cases qui contiennent les bateaux
    let shipPlacementCase = [];
    // Array qui contient les différentes classes qui représentes un bateau (css)
    let shipClass = ["black", "red", "green", "orange", "blue"];

    // Quelques constantes qui servent à restreindre
    /*
     *  notAllowedCaseRadar, array qui contiennent les cases sur lesquelles on ne peut pas placer le radar
     *  rightCase, array qui contient toutes les cases à droite
     *  leftCase, array qui contient toutes les cases à gauche
     */
    const notAllowedCaseRadar = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 20, 21, 30, 31, 40, 41, 50, 51, 60, 61, 70, 71, 80, 81, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100];
    const rightCase = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    const leftCase = [0, 11, 21, 31, 41, 51, 61, 71, 81, 91]


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

    // Indique si nos bateaux doivent être placés verticalement
    let rotate = false;
    // Contient les informations concernant le bateau que le joueur est en train de déplacer
    // data: ship__length / ship__name etc...
    let draggedShip = undefined;
    let draggedShipLength = undefined;

    // DEBUG SECTION
    let debugTable = document.getElementById("debugTable");

    /**
     * Permet d'éviter que le joueur modifie sa grille (le visuel)
     * Remarque: cela évite juste en soit une modification visuelle juste visible pour le client
     *           ça n'impact en aucun cas la partie car la grille du joueur et de l'ennemi sont sauvegardées
     *           dans des variables inaccessibles
     */
    //function noBypass() { // if I have the time, I'll do it }

    return {
        /*
         * Initialisation de la partie / des grilles des joueurs
         */
        init() {
            this.createBoard(yourBoard, savedSquareDiv);
            this.createBoard(enemyBoard, savedEnemySquareDiv);
            // DEBUG
            // console.log("Game has been initialized successfully!");
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
        getEnemyReadyState: () => isEnemyReady,
        isAllShipArePlaced: () => shipPlacementCase.length === playerReadyWhen,
        getRemainingItems: () => remainingItems,

        // Setters
        toggleRotate: () => rotate = !rotate,
        setReadyState: (bool) => isYouReady = bool,
        setEnemyReadyState: (bool) => isEnemyReady = bool,

        /**
         * Fonction qui créer les grilles respectifs des joueurs
         *
         * @param whichBoard
         * @param array
         */
        createBoard(whichBoard, array) {
            // On commence à 1 car le childNodes de notre grille commence à l'index 0 avec un type text et non une div
            // RQ: j'ai remarqué qu'on aurait pu utiliser la méthode suivante: element.children qui retourne tous les enfants de notre parent sans les __text
            for (let i = 1; i <= width * width; i++) {
                let div = document.createElement("div");
                // Chaque case possède son propre attribut data allant de 1 à 100 (numérotation des cases)
                div.setAttribute("data", i.toString());
                // On ajoute la case qui vient d'être créée à notre grille
                whichBoard.appendChild(div);
                // On la sauvegarde dans une array (savedSquareDiv/savedEnemySquareDiv)
                array.push(div);
            }
        },

        /**
         * Comme son nom l'indique cette fonction va nous permettre de reset la preview lors du placement des bateaux
         */
        clearPreview() {
            if (previewShipPlacement.length !== 0) {
                for (let i = 0; i < previewShipPlacement.length; i++) {
                    yourBoard.childNodes[(previewShipPlacement[i].toString())].classList.toggle("placement__preview");
                }
                previewShipPlacement = [];
            }
        },

        /**
         * De la même manière cette méthode concerne le reset de l'affichage de l'impact d'un tir
         */
        clearFireCasePreview() {
            for (const element of enemyBoard.childNodes) {
                element.textContent = "";
            }
            previewFireCase = [];
        },

        /**
         * Permet de mettre à jour les variables concernant la sélection des items
         */
        updateSelectItem() {
            // Je parcoure mon array qui contient chaque item (son code html)
            for (const element of itemContainer) {
                // Je récupère la valeur de l'attribut "data"
                let index = parseInt(element.getAttribute("data"));
                // Si l'item sélectionné n'a pu d'utilisation on l'affiche au joueur par changement de couleur de la border
                if (remainingItems[index] === 0) {
                    element.classList.add("item__unavailable");
                }
            }
            // Par défaut, on sélectionne le missile car nombre d'utilisations infini
            selectedItem = 0;
            itemContainer[0].classList.toggle("item__selected");
            previousItem = itemContainer[0];
        },

        /**
         * Cette fonction permet de vérifier que le joueur peut placer son bateau
         *
         * @param caseIndex
         * @returns {boolean}
         */
        isShipAlreadyPlace(caseIndex) {
            if (draggedShipLength === undefined) return false;

            // Par défaut, on considère que l'on peut placer notre bateau
            let isShipAlreadyPlacedHere = false;
            // Si le placement n'est pas verticale
            if (!rotate) {
                // On boucle
                for (let i = 0; i < draggedShipLength; i++) {
                    // On sauvegarde la case visée par la preview
                    let tmp = parseInt(caseIndex) + i;
                    // Si la case contient déjà un bateau;
                    if (shipPlacementCase.includes(parseInt(yourBoard.childNodes[tmp.toString()].getAttribute("data")))) {
                        isShipAlreadyPlacedHere = true;
                        // On quitte notre boucle afin de faire le moins d'itération possible
                        break;
                    }
                }
            // Si le placement est verticale
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

        /**
         * Fonction qui permet d'afficher une preview de la zone d'impacte d'un tir
         *
         * @param event
         */
        fireCasePreview(event) {
            // On vérifie que la partie est bien lancée
            if (gameStarted) {
                // On sauvegarde l'élément visé
                let target = event.target;
                // On sauvegarde la valeur de l'attribut "data" de la cible
                let index = parseInt(target.getAttribute("data"));
                // On vérifie que c'est bien au tour du joueur
                if (playerIndex === 0) {
                    // On clear la preview des anciens impacte
                    gameManager.clearFireCasePreview();
                    // On vérifie que le joueur a sélectionné un item
                    if (selectedItem !== undefined) {
                        // Enchainement de conditions sur notre item
                        switch (selectedItem) {

                            // Missile
                            case 0:
                                // une case à afficher
                                previewFireCase.push(index);
                                break;

                            // Radar
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

                            // Torpille
                            case 2:
                                previewFireCase.push(index);
                                break;

                            // Frag
                            case 3:
                                // Une case forcément ciblée
                                previewFireCase.push(index);
                                /*
                                 * Cette boucle permet d'avoir un placement réaliste, je m'explique comme notre grille est
                                 * similaire à une array lorsque l'on souhaite avoir une preview d'un tir (sur une case située sur les côtes et aux extrémités)
                                 * notre preview déborde sur la ligne d'en dessous, il y a dépassement de notre grille
                                 */
                                for (let i = [index + 1, index - 1, index + 10, index - 10], j = 0; j < i.length; j++, i[j]) {
                                    if (i[j] > 0 && i[j] <= 100) {
                                        if(rightCase.includes(index)){
                                            if(i[j] !== index + 1){
                                                previewFireCase.push(i[j]);
                                            }
                                        } else if (leftCase.includes(index)){
                                            if(i[j] !== index - 1){
                                                previewFireCase.push(i[j]);
                                            }
                                        } else {
                                            previewFireCase.push(i[j]);
                                        }
                                    }
                                }
                                break;
                            default:
                                break;
                        }

                        // DEBUG
                        //console.log("(previewFireCase) preview case: " + previewFireCase);
                        // On affiche la zone d'impacte de notre tir
                        if (previewFireCase.length !== 0) {
                            for (let i = 0; i < previewFireCase.length; i++) {
                                enemyBoard.childNodes[(previewFireCase[i]).toString()].textContent = "X";
                            }
                        }
                        fireOutput.textContent = "Ready?"
                        fireOutput.style.color = "#27ae60";
                    } else {
                        // DEBUG
                        //console.log("(previewFireCase) Please, select an item!");
                        fireOutput.textContent = "Please, select an item!"
                        fireOutput.style.color = "#c0392b";
                    }
                } else {
                    // DEBUG
                    //console.log("(previewFireCase) Not your go!")
                    fireOutput.textContent = "Enemy go!"
                    fireOutput.style.color = "#c0392b";
                }
            }
        },

        // Permet de lancer la partie
        startGame() {
            // On cache le container qui contient les bateaux lors de phase de placement
            shipPlacementContainer.removeAttribute("class");
            shipPlacementContainer.classList.add("display__none");
            // On affiche le menu de sélection des armes
            itemsContainer.removeAttribute("class");
            itemsContainer.classList.add("item__selection__container");
            // On met à jour la valeur de notre booléen
            gameStarted = true;
            // Si c'est au tour du joueur
            if (playerIndex === 0) {
                fireOutput.textContent = "Your go!"
                fireOutput.style.color = "#27ae60";
            } else {
                fireOutput.textContent = "Enemy go!"
                fireOutput.style.color = "#c0392b";
            }
        },

        // Lorsque la partie est terminée
        finishGame() {
            // On get le container du scoreboard
            let scoreboardWinLoose = document.getElementById("scoreboardWinLoose");
            // Si le joueur n'est pas le perdant
            if (playerIndex !== -1) {
                // DEBUG
                // console.log("You win!!")
                scoreboardWinLoose.textContent = "Great job!! You have won this game!"
                fireOutput.style.color = "#27ae60";
                // On met à jour notre base de donnée WIN/LOOSE
                socket.emit("updateWinCount");
            } else {
                // DEBUG
                //console.log("You lose!!")
                scoreboardWinLoose.textContent = "Maybe next time, you will be more focused!"
                fireOutput.style.color = "#c0392b";
                socket.emit("updateLooseCount");
            }

            // On envoie nos stats de la partie à l'autre joueur
            socket.emit("sendStatistic", fireCount, boatSunkenCount);

            // On exécute en retard ce bout de code en attendant la réponse du serveur
            setTimeout(function(){
                // On supprimer tout les éléments HTML
                gameBoards.remove();
                shipContainer.remove();
                itemsContainer.remove();
                debugTable.remove();

                console.log("Fire count: " + fireCount);
                console.log("Boat sunken count: " + boatSunkenCount);
                console.log("Enemy fire count: " + enemyFireCount);
                console.log("Enemy boat sunken count: " + enemyBoatSunkenCount)

                // On affiche le scoreboard
                document.getElementById("yourScore").textContent = fireCount + "/" + boatSunkenCount;
                document.getElementById("enemyScore").textContent = enemyFireCount + "/" + enemyBoatSunkenCount;
                document.getElementById("scoreboard").removeAttribute("class");
                document.getElementById("scoreboard").classList.add("game__scoreboard");
            }, 100)
        },

        // Fonction qui permet de déterminer si un joueur est le gagnant
        checkWin() {
            if (shipPlacementCase.length === 0) {
                playerIndex = -1;
                console.log(playerIndex)
                socket.emit("winnerFound");
                gameManager.finishGame();
                return true;
            }
            return false;
        },

        /**
         * Fonction exécutée lorsque l'on clique sur le bouton fire quand c'est son tour
         */
        fireThisCase() {
            // Si la partie est commencée
            if (gameStarted) {
                // On vérifie que c'est au tour du joueur
                if (playerIndex !== 0) {
                    console.log("(FireThisCase) Not your go!")
                    fireOutput.textContent = "Enemy go!"
                    fireOutput.style.color = "#c0392b";
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
                            fireOutput.style.color = "#c0392b";
                            fireCount += 1;
                            playerIndex = 1;
                        } else {
                            // DEBUG
                            //console.log("(FireThisCase) Please, select an available case to fire!")
                            let currentValue = fireOutput.textContent;
                            fireOutput.textContent = "Please, select an available case!"
                            fireOutput.style.color = "#c0392b";
                        }
                    } else {
                        // DEBUG
                        //console.log("(FireThisCase) Please, select an item!")
                        let currentValue = fireOutput.textContent;
                        fireOutput.textContent = "Please, select an item!"
                        fireOutput.style.color = "#c0392b";
                    }
                }
            }
        },

        /**
         * Fais le rendu du tir au joueur qui reçoit le tir
         *
         * @param indexArray
         * @param item
         */
        onFireReceive(indexArray, item) {
            // DEBUG
            //console.log("(onFireReceive) IndexArray: " + indexArray);

            // Déclaration de variables pour simplifier le code / le rendre plus lisible
            let yourBoardChildNodes = yourBoard.childNodes;
            // Array qui contient les cases contenant une partie du bateau qui ont été détruite
            // Cette array sera transmise au joueur à l'origine du tir
            let boatPartSunken = [];
            // Array qui contient les cases ne contenant pas une partie du bateau
            // Cette array sera transmise au joueur à l'origine du tir
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
                    let classList = gameManager.classListIntoArray(yourBoardChildNodes[indexArray[0]]);
                    let caseToDestroy = [];
                    if (classList.length !== 0) {
                        // On boucle est on regarde si une des classes correspondent à une classe que doit posséder un bateau
                        for (let i = 0; i < classList.length; i++) {
                            if (shipClass.includes(classList[i])) {
                                caseToDestroy.push(indexArray[0])
                                // Boucle qui va regarde à l'endroit
                                for (let j = [indexArray[0] + 1, indexArray[0] - 1, indexArray[0] + 10, indexArray[0] - 10], k = 0; k < j.length; k++, j[k]) {
                                    console.log(j[k]);
                                    // Position valide, on ne va tirer sur une case du tableau du joueur qui n'existe pas
                                    if (j[k] > 0 && j[k] <= 100) {
                                        console.log("valid position: " + j[k])
                                        classList = gameManager.classListIntoArray(yourBoardChildNodes[j[k]]);
                                        for (let l = 0; l < classList.length; l++) {
                                            // La case contient une partie bateau
                                            if (shipClass.includes(classList[l])) {
                                                caseToDestroy.push(j[k])
                                            }
                                        }
                                    }
                                }
                                // DEBUG
                                //console.log("case destroy length " + caseToDestroy.length)
                                if(caseToDestroy.length === 2){
                                    // On retire toutes les classes de la case ciblée
                                    yourBoardChildNodes[caseToDestroy[0]].removeAttribute("class");
                                    yourBoardChildNodes[caseToDestroy[1]].removeAttribute("class");
                                    // On affiche que la case qui contenait une partie du bateau a été détruite
                                    yourBoardChildNodes[caseToDestroy[0]].classList.add("boatPartSunken");
                                    yourBoardChildNodes[caseToDestroy[1]].classList.add("boatPartSunken");
                                    // On vient donc ainsi retirer cette case de la liste des cases qui compose l'ensemble des positions où un bateau est présent
                                    shipPlacementCase.filter((element) => {
                                        if (element === caseToDestroy[0]) {
                                            shipPlacementCase.splice(shipPlacementCase.indexOf(element), 1);
                                        }
                                    })

                                    shipPlacementCase.filter((element) => {
                                        if (element === caseToDestroy[1]) {
                                            shipPlacementCase.splice(shipPlacementCase.indexOf(element), 1);
                                        }
                                    })

                                    // On ajoute la case ciblée dans la liste des parties des bateaux détruites
                                    // Sert à ce que l'ennemi puisse voir qu'il vient de détruire une case contenant une partie de bateau
                                    boatPartSunken.push(caseToDestroy[0]);
                                    boatPartSunken.push(caseToDestroy[1]);
                                } else {
                                    yourBoardChildNodes[indexArray[0]].removeAttribute("class");
                                    yourBoardChildNodes[indexArray[0]].classList.add("boatPartSunken");
                                    shipPlacementCase.filter((element) => {
                                        if (element === indexArray[0]) {
                                            shipPlacementCase.splice(shipPlacementCase.indexOf(element), 1);
                                        }
                                    })
                                    boatPartSunken.push(indexArray[0]);
                                }
                                console.log(caseToDestroy)
                            }
                        }
                    } else {
                        // On affiche que la case a été détruite mais ne contenait pas une partie de bateau
                        yourBoardChildNodes[indexArray[0]].removeAttribute("class");
                        yourBoardChildNodes[indexArray[0]].classList.add("caseFired");
                        caseDestroyed.push(indexArray[0]);
                    }
                    // DEBUG
                    //console.log("(onFireReceive #Torpille)" + tmpClassList)
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

            // On envoie un requête au serveur contenant trois variables
            // Les cases où les bateaux sont détruits
            // Les cases où il n'y a aucun bateau mais qui sont détruite
            // L'item utilisé par le joueur initiateur du tir
            socket.emit("fireReply", boatPartSunken, caseDestroyed, item);

            // On check si on a trouvé un gagnant
            if(gameManager.checkWin()) return;

            //Sinon on continue la partie
            fireOutput.textContent = "Your go!"
            fireOutput.style.color = "#27ae60";
            playerIndex = 0;
        },

        /**
         * Permet de convertir un type DOM LIST en Array
         *
         * @param element
         * @returns {[]}
         */
        classListIntoArray(element) {
            let classToArray = [];
            element.classList.forEach((element) => { classToArray.push(element); })
            return classToArray;
        },

        /**
         * Affiche le rendu de votre tir
         *
         * @param boatPartSunkenArray
         * @param caseDestroyedArray
         * @param item
         */
        onFireReply(boatPartSunkenArray, caseDestroyedArray, item) {
            // DEBUG
            //console.log("(onFireReply) Case(s) contenant un/des parties de bateau(x): " + boatPartSunkenArray);
            //console.log("(onFireReply) Case(s) détruite(s): " + caseDestroyedArray);

            // Si l'item n'est pas le radar
            if (item !== 1) {
                // Si notre tir a touché un bateau
                if (boatPartSunkenArray.length !== 0) {
                    for (let i = 0; i < boatPartSunkenArray.length; i++) {
                        enemyBoard.childNodes[boatPartSunkenArray[i].toString()].removeAttribute("class");
                        enemyBoard.childNodes[boatPartSunkenArray[i].toString()].classList.add("boatPartSunken");
                    }
                    boatSunkenCount += boatPartSunkenArray.length;
                }

                if (caseDestroyedArray.length !== 0) {
                    for (let i = 0; i < caseDestroyedArray.length; i++) {
                        enemyBoard.childNodes[caseDestroyedArray[i].toString()].classList.add("caseFired");
                    }
                }
            // Si l'item est le radar
            } else {
                // On vient faire une boucle qui parcoure toutes les cases qui contiennent un bateau pour pouvoir les afficher au joueur adverse
                // Contrairement à un tir le radar ne détruit par les bateau mais les localises
                for (let i = 0; i < boatPartSunkenArray.length; i++) {
                    enemyBoard.childNodes[boatPartSunkenArray[i].toString()].classList.add("contrast");
                }
            }

        },


        // Listeners
        /**
         * Listener qui réagit lorsque l'on sélectionne un item
         *
         * @param event
         */
        selectItem(event) {
            // On save notre cible
            let target = event.target;
            // On save la valeur de l'attribut "data" de notre cible
            let index = parseInt(target.getAttribute("data"));
            // On save le nombre d'utilisations restantes
            let remainingAmount = gameManager.getRemainingItems()[index];
            // On clear la preview
            gameManager.clearFireCasePreview();

            // Si le nombre d'utilisations restantes est différent de undefined et que celui-ci est égale à 0
            if (remainingAmount !== undefined && remainingAmount === 0) {
                // On affiche une border de couleur rouge autour de l'item pour indiquer qu'il n'est plus utilisable durant la partie
                target.classList.add("item__unavailable");
            } else {
                // Si aucun item n'a été sélectionné
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
            draggedShip = this;
            draggedShipLength = shipData[parseInt(this.getAttribute("data"))].length;
            // DEBUG
            // console.log(draggedShip);
            // console.log(draggedShipLength);
            // console.log("Grab ship!")
        },

        // On cancel l'event par défaut de dragOver
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

        // On clear la preview du placement lorsque l'on quitte la zone cible
        dragLeave() { gameManager.clearPreview(); },

        /**
         * Listener qui se déclenche lorsque l'utilisateur drag&drop sont item dans la zone cible
         *
         * @param event
         */
        drop(event) {
            // On cancel la réponse par défaut
            event.preventDefault();
            // On save le bateau drop
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

        // On reset les variables de l'item en train d'être drag
        dragEnd() {
            draggedShip = undefined;
            draggedShipLength = undefined;
            gameManager.clearPreview();
            // DEBUG
            //console.log("Drag end!")
        }

    }
})();