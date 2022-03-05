const express = require("express");
const path = require("path");
const router = express.Router();

let queue = [];

router.get("/play", (req, res) => {
    // Si l'utilisateur est connecté
    if(req.session.login){
        // On affiche la page play
        res.render(path.join(__dirname, "..", "..", "views", "play"));

        // On utilise les sockets pour communiquer au serveur dès qu'un utilisateur va se connecter à cette page
        // Le serveur établit une connexion avec chaque client
        io.once("connect", (socket) => {
            let date = new Date();
            console.log("[" + date.getUTCDay() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear() + "] " + req.session.username + " is connected to the play page")

            const user = {
                username: req.session.username,
                id: socket.id
            }

            // Envoie aux 2 clients que la partie peut commencer, on va donc créer une room privée où les deux joueurs vont tout simplement s'affronter
            socket.on("joinQueue", () => {

                // On vérifie si le joueur n'est pas déjà dans la queue
                let isUserAlreadyInQueue = false;
                for (let i = 0; i < queue.length; i++) {
                    if(queue[i].username === req.session.username){
                        isUserAlreadyInQueue = true;
                    }
                }

                // On lance une partie si la queue est supérieur à 2 utilisateur


                //console.log("is player is in the queue? " + isUserAlreadyInQueue);

                if(!isUserAlreadyInQueue){
                    //console.log(req.session.username + " joined the waiting room!");
                    // On ajoute l'utilisateur à la queue
                    queue.push(user);
                    // On join notre socket à la room waitingRoom
                    socket.join("waitingRoom");
                    // Réponse envoyé au client
                    socket.emit("joinQueue");
                }
                console.log(queue)
                /*console.log(io.sockets.adapter.rooms.get("waitingRoom").size);
                console.log(io.sockets.adapter.rooms.get("waitingRoom"))*/
            })

            // Met à jour la file d'attente lorsqu'un utilisateur quitte la page
            socket.on("disconnect", () => {
                for (let i = 0; i < queue.length; i++) {
                    if(queue[i].username === req.session.username){
                        // on supprime l'utilisateur de la file d'attente
                        queue.splice(i, 1);
                    }
                }
            })

        })
    } else {
        // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
        res.redirect("/login?signup=false");
    }
})

module.exports = router;
