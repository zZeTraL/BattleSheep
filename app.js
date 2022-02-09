const express = require('express');
const path = require('path');
const dotenv = require("dotenv");
const app = express();
const flash = require("express-flash");
const mysql = require("mysql");

// set the view engine to ejs
app.set('view engine', 'ejs');

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
app.use(flash());

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
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, "views", "index.html")); })


const routes = require("./server/routes/auth")
app.use('/', routes);
app.use((req, res) => {
    res.status(404).render(path.join(__dirname, "views", "errors", "404"))
})


// On écoute sur le port
app.listen(process.env.SERVER_PORT);