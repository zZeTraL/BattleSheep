let gameManager = (function () {

    // Déclaration des variables utilisées pour notre jeu
    let width = 10;

    // Déclaration des div
    let yourBoard = document.getElementById("yourBoard");
    let enemyBoard = document.getElementById("enemyBoard");

    // DEBUG SECTION
    let youReadySpan = document.getElementById("youReady");
    let enemyReadySpan = document.getElementById("enemyReady");

    return {
        // Initialisation
        init(){
            this.createBoard(width, yourBoard);
            this.createBoard(width, enemyBoard);
            console.log(shipData[0].name);
        },

        // Méthodes
        createBoard(size, whichBoard){
            for (let i = 0; i < size * size ; i++) {
                let div = document.createElement("div");
                div.setAttribute("data", i);
                whichBoard.appendChild(div);
            }
        }
    }
})();