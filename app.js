const express = require('express');
const path = require('path');
const dotenv = require("dotenv");
const app = express();
const mysql = require("mysql");
const session = require("express-session")

dotenv.config({path: "./.env"});
const pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

pool.getConnection((error, connection) => {
    if(error) throw error;
    console.log("Connect as ID: " + connection.threadId);
})

// Répertoire dynamique
app.use(express.static(path.join(__dirname)));

// Routers
app.get('/', (req, res) => {
    pool.getConnection((error, connection) => {
        if(error) throw error;
        console.log("Connect as ID: " + connection.threadId);

        // Affiche la table users
        pool.query("SELECT * FROM users", (error, result) => {
            if(error) throw error;
            console.log(result);
        })

        // Ajouter un utilisateur une seul fois dans la base de donnée
        let value = ['test', 'test@test.com', 'test']
        pool.query("INSERT INTO users (username, email, password) VALUES(?,?,?)", value, (error, result) => {
            connection.release();
            if(error) throw error;
            console.log(result);
        })

    })

    res.sendFile(path.join(__dirname, "views", "home", "index.html"));

})

const routes = require("./server/routes/auth")
app.use('/', routes);


























/*
// Quelques functions afin d'assurer un minimum de sécurité
//app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, "..")));
// Permet de transmettre les données de la méthode POST
app.use(express.urlencoded({extended: false}));

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000}
}));


// Getters
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, "..", "views", "home", "index.html")); })
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, "..", "views", "login.html")); })
app.get('/profile', (req, res) => { res.sendFile(path.join(__dirname, "..", "views", "profile.html")); })
*/



// On écoute sur le port
app.listen(process.env.SERVER_PORT, () => {
    console.log("Server started");
});