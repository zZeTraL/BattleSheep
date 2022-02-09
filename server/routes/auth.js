const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const router = express.Router();

const authController = require("../controllers/authController")

/**
 * Permet de crypter notre mot de passe
 *
 * @param {string} password
 * @returns {*}
 */
function generateHash(password) {
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hashSync(password, salt);
}

/**
 * Permet de comparer un mdp et son homologue dans une base de donnée
 *
 * @param {string} password
 * @param {string} hashed
 * @returns {*}
 */
function compareHash(password, hashed) {
    return bcrypt.compareSync(password, hashed);
}

// Routers
router.get('/login', (req, res) => {
    if(req.session.login){
        res.redirect("/profile")
    } else {
        req.session.login = false;
        res.render(path.join(__dirname, "..", "..", "views", "login"), {
            signup: req.query.signup,
        });
    }
})

// POST method to register a new account
router.post('/api/register', async (req, res) => {
    // on récupère les données de notre formulaire
    const username = req.body.username;
    const email = req.body.email;
    const password = await generateHash(req.body.password);

    // On créer une connection avec notre base de donnée
    pool.getConnection((error, connection) => {
        // DEBUG
        if (error) throw error;
        pool.query("SELECT * FROM users WHERE username = ?", [username], async (error, result) => {
            // Affiche une erreur si notre requête SQL n'aboutie pas
            if (error) throw error;
            // Si l'utilisateur est déjà enregistré
            if (result.length > 0) {
                // DEBUG
                //console.log("This account is already registered!");

                // on redirige l'utilisateur sur la page pour se connecter
                res.redirect("/login.ejs");

                /** TODO
                 *   - Show to user when an account already existed
                 *   - Show this in ejs template
                 */

            } else {
                // On insert les data de notre utilisateur dans notre bdd
                await pool.query("INSERT INTO users (username, email, password) VALUES(?,?,?)", [username, email, password], (error, result) => {
                    connection.release();
                    if (error) throw error;
                    console.log(result);
                })
                // DEBUG
                console.log("Account has been created!");

                // On met à jour la session de l'utilisateur
                req.session.login = true;
                req.session.username = username;
                req.session.email = email;
                res.redirect("/profile")
            }
        })
    })
})

// POST method to login an user to his account
router.post("/api/login", async (req, res) => {
    // On récupère les données de notre form
    const usernameOrEmail = req.body.username;
    const password = req.body.password;

    // On se connecte à notre base de donnée
    pool.getConnection((error, connection) => {
        if (error) throw error;
        // On sélectionne notre utilisateur par son pseudo dans la bdd
        pool.query("SELECT * FROM users WHERE username = ?", [usernameOrEmail], async (error, result) => {
            // On check si l'utilisateur existe par son pseudo
            if (result.length > 0) {
                console.log("L'utilisateur existe, le mdp est-il valide ?");
                pool.query("SELECT PASSWORD as password FROM `users` WHERE username = ?", [usernameOrEmail], async (error, result) => {
                    if (error) throw error;
                    connection.release();
                    let compare = await compareHash(password, result[0].password);
                    if(compare){
                        // Le mot de passe est correct, on met à jour la session
                        req.session.login = true;
                        req.session.username = usernameOrEmail;
                        res.redirect("/profile")
                    } else {
                        // DEBUG
                        console.log("Invalid password!");
                    }
                })
            } else {
                // On check si l'utilisateur n'a pas entré un pseudo mais un mail
                console.log("L'utilisateur existe, le mdp est-il valide ?");
                pool.query("SELECT * FROM users WHERE email = ?", [usernameOrEmail], async (error, result) => {
                    // On check si l'utilisateur existe par son mail
                    if(result.length > 0){
                        console.log("L'utilisateur existe, le mdp est-il valide ?");
                        pool.query("SELECT PASSWORD as password FROM `users` WHERE email = ?", [usernameOrEmail], async (error, result) => {
                            if (error) throw error;
                            let compare = await compareHash(password, result[0].password);
                            if(compare){
                                // Le mot de passe est correct, on met à jour la session
                                req.session.login = true;
                                pool.query("SELECT EMAIL FROM users WHERE email = ?", [usernameOrEmail], (error, result) => {
                                    connection.release();
                                    if(error) throw error;
                                    if(result > 0){
                                        req.session.username = result[0].username;
                                    }
                                })
                                res.redirect("/profile")
                            } else {
                                // DEBUG
                                console.log("Invalid password!");
                            }
                        })
                    } else {
                        console.log("L'utilisateur n'existe pas pas !");
                        res.redirect("/login")
                    }
                })
            }
        })
    })
})

router.get("/profile", (req, res) => {
    if (req.session.login) {
        res.render(path.join(__dirname, "..", "..", "views", "profile"), {
            username: req.session.username,
            email: req.session.email
        });
    } else {
        res.render(path.join(__dirname, "..", "..", "views", "login"));
    }
})

router.get('/logout', function (req, res, next) {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) return next(err);
            else return res.redirect('/');
        });
    }
});

module.exports = router;
