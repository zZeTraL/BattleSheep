const express = require("express");
const path = require("path");
const router = express.Router();

let room = [
    {
        // id/name de la room
        name: "waitingRoom",
        // Nombre maxi de socket pouvant être connecté simultanément
        maxSlots: undefined,
        // Nombre de socket connecté
        currentSlots: undefined,
        // Liste des sockets connectés
        connections: []
    }
];

let queue = [];

router.get("/play", (req, res) => {
    // Si l'utilisateur est connecté
    if(!req.session.login){
        // On affiche la page play
        res.render(path.join(__dirname, "..", "..", "views", "play"));
    } else {
        // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
        res.redirect("/login?signup=false");
    }
})

// On établit "une connexion en le server et le client"
io.on("connection", (socket) => {

    //====================================================================================
    //              QUEUE SOCKETS
    //====================================================================================

    socket.on("messageSent", (msg) => {
        io.emit("messageReceived", "USERNAME", msg);
    })

    /**
     * [Listener] Réception d'une requête par socket
     * Permet au joueur de rejoindre la file d'attente
     */
    socket.on("joinQueue", () => {
        // On check si l'utilisateur n'est pas déjà dans la queue
        let isUserAlreadyInQueue = false;
        for (let i = 0; i < queue.length; i++) {
            if(queue[i] === socket.id){
                isUserAlreadyInQueue = true;
                break;
            }
        }

        // S'il n'est pas dans la queue
        if(!isUserAlreadyInQueue){
            // DEBUG
            //console.log(socket.id + " joined the queue")

            // On ajoute l'utilisateur dans la queue
            queue.push(socket.id);
            // On ajoute l'utilisateur dans la room "waitingRoom" (propre a socket.io)
            socket.join("waitingRoom");
            // On envoie une réponse à cette requête (requête envoyée au client)
            socket.emit("joinQueue");

            // S'il y a au moins 2 utilisateurs dans la queue (min: pour lancer une partie)
            if(queue.length >= 2){
                // On sauvegarde les données des deux premiers utilisateur dans la queue
                let users = [queue[0], queue[1]];
                // On retire les deux utilisateur de la queue
                queue.splice(0, 2);
                // On génère une room privé (une instance) où la partie va se dérouler
                let privateRoom = generateRoom(10, 2);
                // On l'ajoute dans notre array de room
                room.push(privateRoom);

                // On envoie deux requêtes aux deux clients : une pour quitter la queue et une autre pour rejoindre la room privée
                io.in(users[0]).in(users[1]).emit("leaveQueue");
                io.in(users[0]).in(users[1]).emit("joinPrivateRoom", privateRoom.name);
            }
        } else {
            // On envoie un requête au client qui va l'avertir qu'il est déjà dans la queue
            socket.emit("alreadyInQueue");
        }
    })

    // [Listener] Reception d'une requête client qui va tout simplement le faire quitter la file d'attente
    socket.on("leaveQueue", () => {
        console.log(socket.id + " left the queue!")
        socket.leave("waitingRoom")
    })

    // [Listener] Reception d'une requête client qui va le faire rejoindre une room privée
    socket.on("joinPrivateRoom", (roomId) => {
        // On récupère les informations de la room (object) par son ID (correspond à son attribut name)
        let privateRoom = room.filter((room) => {return room.name === roomId;})

        // Requête qui redirige vers l'URL "..../play/ROOM_ID
        router.get("/play/" + roomId, (req, res) => {

            // On check si la partie est complète ou pas (max: 2 joueurs)
            if (privateRoom[0].currentSlots !== 2) {
                // On affiche la page game au joueur
                res.render(path.join(__dirname, "..", "..", "views", "game"));
                // On incrément le slot de la room
                privateRoom[0].currentSlots += 1;
            } else {
                // On redirige l'utilisateur vers l'accueil
                res.redirect("/");
            }
        })
        // Requête émise au client qui le rediriger vers la page .../play/room_id
        socket.emit("redirectToRoom", roomId);
    })

    //====================================================================================
    //              GAME SOCKETS
    //====================================================================================

    // Initialisation et stockage des sockets connectés à la room
    socket.on("playerConnected", (roomId) => {
        let privateRoom = room.filter((room) => {return room.name === roomId;})
        privateRoom[0].connections.push(socket.id)
        //console.log(privateRoom)
        socket.join(roomId)
        let playerIndex;
        for (let i = 0; i < privateRoom[0].connections.length; i++) {
            if(privateRoom[0].connections[i] === socket.id){
                playerIndex = i;
            }
        }
        console.log(playerIndex)
        socket.emit("connection", playerIndex);
    })

    //================
    // Utilitaires
    //================
    socket.on("roomDebug", () => {
        socket.emit("requestResult", room);
    })

    //================
    // Update
    //================
    socket.on("enemyConnected", () => {
        socket.broadcast.emit("enemyConnected");
    })

    socket.on("enemyReady", () => {
        socket.broadcast.emit("enemyReady");
    })

    socket.on("startGame", (roomId) => {
        console.log("socket request receive STARTING GAME...")
        io.in(roomId).emit("startGame");
    })

    // Reception de la requête pour quitter la partie
    socket.on("leaveRoom", (roomId) => {
        io.in(roomId).emit("leaveRoom");
    })

    // Met à jour la file d'attente lorsqu'un utilisateur quitte la page
    socket.on("disconnect", () => {
        let playerRoom;
        for (let i = 0; i < room.length; i++) {
            if(room[i].connections.includes(socket.id)){
                playerRoom = room[i];
                playerRoom.connections.splice(i, 1);
                playerRoom.currentSlots =- 1;
                break;
            }
        }

        if(playerRoom !== undefined){
            //console.log("Player was in the room: " + playerRoom.name);
            if(playerRoom.name !== "waitingRoom"){
                //io.in(playerRoom.name).emit("leaveRoom");
            } else {
                for (let i = 0; i < queue.length; i++) {
                    if(queue[i] === socket.id){
                        // on supprime l'utilisateur de la file d'attente
                        queue.splice(i, 1);
                    }
                }
            }
        }
    })
})


// Alphabet + CHIFFRE --> INCROYABLE!!
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Permet de générer un object ROOM qui va avoir un id/name random
 *
 * @param {number} charLength
 * @param {number} maxSlots
 * @returns {Object}
 */
function generateRoom(charLength, maxSlots) {
    // Init du return de la fonction (Object: Room)
    let result = {name: "", maxSlots: maxSlots, currentSlots: 0, connections: []}
    const charactersLength = characters.length;
    for (let i = 0; i < charLength; i++) {result.name += characters.charAt(Math.floor(Math.random() * charactersLength));}
    if(!room.includes(result.name)){
        console.log("room generated successfully: " + result.name);
        console.log(room);
        return result;
    } else {
        generateRoom(charLength, maxSlots);
    }
}

module.exports = router;
