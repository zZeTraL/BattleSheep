// Déclaration des modules utilisés
const express = require("express");
const app = express();
const path = require("path");
const http = require("http")
const server = http.createServer(app)

// Tools
const dotenv = require("dotenv");
const flash = require("express-flash");
const mysql = require("mysql");

// Socket
const socket = require("socket.io");
const io = socket(server);

// On set notre moteur de render ici EJS
// https://ejs.co/
app.set('view engine', 'ejs');

// Configuration de la connexion avec notre base de donnée
// Les informations de celle-ci sont cachées dans un fichier .env
dotenv.config({path: "./.env"});
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

// Variables globales
global.pool = pool;
global.flash = flash;
global.socket = socket;

// Répertoire dynamique
app.use(express.static(path.join(__dirname)));
// Permet de transmettre les données de la méthode POST
app.use(express.urlencoded({extended: false}));

// Utilisation de express-flash
app.use(flash());

// On créé une session pour chaque utilisateur qui accède au site
const session = require('express-session')({
    secret: process.env.SESSION_KEY,
    name: "session.sid",
    resave: true,
    saveUninitialized: true
});

// Permet de récupérer les informations de la session du joueur
let sharedSession = require("express-socket.io-session");
app.use(session);
io.use(sharedSession(session));

global.io = io;

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    session.cookie.secure = true // serve secure cookies
}

// Home
app.get('/', (req, res) => { res.render(path.join(__dirname, "views", "index")); })

// On include le module auth.js (MYSQL + LOGIN + REGISTER)
const auth = require("./server/routes/auth")
const queue = require("./server/routes/queue")
const leaderboard = require("./server/routes/leaderboard")
app.use('/', auth);
app.use('/', queue);
app.use('/', leaderboard);

// Page 404
app.use((req, res) => {
    res.status(404).render(path.join(__dirname, "views", "errors", "404"))
})

// Listener
server.listen(process.env.SERVER_PORT);