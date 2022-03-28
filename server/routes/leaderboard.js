const express = require("express");
const path = require("path");
const router = express.Router();

// Variable qui contient le leaderboard
let leaderboard = [];
global.leaderboard = leaderboard;

// Au démarrage du serveur on vient récupérer notre classement
// On établit une connexion à notre dbb
pool.getConnection((error, connection) => {
    // On affiche s'il y a une erreur
    if(error) throw error;
    // Requête SQL pour venir récupérer les colonnes username, gamesPlayed et gamesWon et les trier par ordre décroissant
    pool.query("SELECT username as username, gamesPlayed as gamesPlayed, gamesWon as gamesWon FROM users ORDER BY gamesWon DESC", (error, result) => {
        // On effectue plus de requête on coupe notre connexion à notre dbb
        connection.release();
        // S'il y a une erreur lors de la requête, on l'affiche
        if(error) throw error;
        if(result.length > 0){
            // DEBUG
            console.log("LEADERBOARD");
            console.log(result);
            result.forEach(element => {
                leaderboard.push(element);
            })
        }
    })
})

// Page du classement
router.get("/leaderboard", (req, res) => {
    res.render(path.join(__dirname, "..", "..", "views", "leaderboard"), {
        // Tableau d'objets: [{username: x, gamesPlayed: x, gamesWon: x}, {}, ..., {}]
        top: leaderboard
    });
})

module.exports = router;