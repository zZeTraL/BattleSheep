const express = require("express");
const path = require("path");
const router = express.Router();

// Variable qui contient le leaderboard
let leaderboard = [];
global.leaderboard = leaderboard;

pool.getConnection((error, connection) => {
    if(error) throw error;
    pool.query("SELECT username as username, gamesPlayed as gamesPlayed, gamesWon as gamesWon FROM users ORDER BY gamesWon DESC", (error, result) => {
        connection.release();
        if(error) throw error;
        if(result.length > 0){
            // DEBUG
            console.log(result)
            result.forEach(element => {
                leaderboard.push(element);
            })
        }
    })
})

router.get("/leaderboard", (req, res) => {
    res.render(path.join(__dirname, "..", "..", "views", "leaderboard"), {
        // Tableau d'objets: [{username: x, gamesPlayed: x, gamesWon: x}, {}, ..., {}]
        top: leaderboard
    });
})

module.exports = router;