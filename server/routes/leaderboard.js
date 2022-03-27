const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/leaderboard", (req, res) => {
    //res.render(path.join(__dirname, "..", "..", "views", "leaderboard"));
    let leaderboard = [];
    pool.getConnection((error, connection) => {
        if(error) throw error;
        pool.query("SELECT username as username, gamesPlayed as gamesPlayed, gamesWon as gamesWon FROM users ORDER BY gamesWon DESC", (error, result) => {
            connection.release();
            if(error) throw error;
            if(result.length > 0){
                console.log(result)
                result.forEach(element => {
                    leaderboard.push(element);
                })

                console.log(leaderboard)

                res.render(path.join(__dirname, "..", "..", "views", "leaderboard"), {
                    // TOP 10
                    top: leaderboard
                });

            }
        })
    })
})

module.exports = router;