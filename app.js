// Déclaration de nos modules utilisés
const express = require('express');
const path = require('path');
const dotenv = require("dotenv");
const app = express();
const flash = require("express-flash");
const mysql = require("mysql");

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

// Variable global qui permet d'accéder au data de notre bdd
global.pool = pool;
global.flash = flash;

// Répertoire dynamique
app.use(express.static(path.join(__dirname)));
// Permet de transmettre les données de la méthode POST
app.use(express.urlencoded({extended: false}));
// Utilisation de express-flash
app.use(flash());

// On créé une session pour chaque utilisateur qui accède au site
const session = require("express-session")
app.use(session({
    secret: process.env.SESSION_KEY,
    name: "session.sid",
    resave: false,
    saveUninitialized: false,
}))

if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    session.cookie.secure = true // serve secure cookies
}

// Routers
// Home
app.get('/', (req, res) => { res.render(path.join(__dirname, "views", "index")); })


// On include le module auth.js (MYSQL + LOGIN + REGISTER)
const routes = require("./server/routes/auth")
app.use('/', routes);

// Page 404
app.use((req, res) => {
    res.status(404).render(path.join(__dirname, "views", "errors", "404"))
})

// Listener
app.listen(process.env.SERVER_PORT);