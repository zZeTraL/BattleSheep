const express = require("express");
const path = require("path");
const router = express.Router();

io.on("connect", (socket) => {
    console.log("Socket processor started")
})

router.get("/play", (req, res) => {
    // Si l'utilisateur est connecté
    if(req.session.login){
        // On affiche la page play
        res.render(path.join(__dirname, "..", "..", "views", "play"));

        // On utilise le socket pour communiquer au serveur qu'un utilisateur vient de charger la page et est donc connecté
        io.on("connect", (socket) => {
            let date = new Date();
            console.log("[" + date.getUTCDay() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear() + "] A user is connected to the play page")
        })
    } else {
        // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
        res.redirect("/login?signup=false");
    }
})

module.exports = router;
