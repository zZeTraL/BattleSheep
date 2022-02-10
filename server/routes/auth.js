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

function isPasswordValid(password) {
    if (password < 6 || password.includes(" ")) {
        console.log("Invalid password: " + password);
        return false;
    }
    return true;
}

function isUsernameValid(username) {
    if (username < 3 || username.includes(" ")) {
        console.log("Invalid username: " + username);
        return false;
    }
    return true;
}


// Routers
router.get('/login', (req, res) => {
    if (req.session.login) {
        res.redirect("/profile")
    } else {
        req.session.login = false;

        // URL de la page
        let urlParam = req.query.signup

        // On utilise express-flash afin de transmettre des données sans faire des redirections sans cesse
        // Utilise car nous affiche l'état de notre requête post
        const userAlreadyRegistered = req.flash('userAlreadyRegistered');
        const registerInvalidUsername = req.flash('registerInvalidUsername');
        const registerInvalidEmail = req.flash('registerInvalidEmail');
        const registerInvalidPassword = req.flash('registerInvalidPassword');

        const loginInvalidPassword = req.flash('loginInvalidPassword');
        const loginInvalidUsrOrEmail = req.flash('loginInvalidUsrOrEmail');


        if (urlParam === undefined) {
            urlParam = "false";
        }

        res.render(path.join(__dirname, "..", "..", "views", "login"), {
            // URL
            signup: urlParam,

            // Register
            userAlreadyRegistered: userAlreadyRegistered[0],
            registerInvalidUsername: registerInvalidUsername[0],
            registerInvalidEmail: registerInvalidEmail[0],
            registerInvalidPassword: registerInvalidPassword[0],

            // Login
            loginInvalidUsrOrEmail: loginInvalidUsrOrEmail[0],
            loginInvalidPassword: loginInvalidPassword[0],
        });
    }
})

// POST method to register a new account
router.post('/api/register', async (req, res) => {
    // on récupère les données de notre formulaire
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    // On hash notre mot de passe
    const passwordHashed = await generateHash(req.body.password);

    // Boolean qui vérifie si nos inputs correspondent avec nos conditions
    let isInputValid = true;

    // On check si le pseudo envoyé par le poste ne contient pas des espaces et que le mot de passe fait au moins 6 caractères
    if (!isUsernameValid(username)) {
        req.flash("registerInvalidUsername", "Username must contain at least 3 characters")
        isInputValid = false;
    }

    if (!isPasswordValid(password)) {
        req.flash("registerInvalidPassword", "Password must contain at least 3 characters")
        isInputValid = false;
    }

    pool.getConnection(async (error, connection) => {
        await pool.query("SELECT USERNAME FROM users WHERE username = ?", [username], async (error, result) => {
            if (error) throw error;
            console.log(result.length)
            if (result.length > 0) {
                console.log("User already registered with this username")
                req.flash("userAlreadyRegistered", "User already registered with this username/email")
                isInputValid = false;
                res.redirect("/login?signup=true");
            } else {
                pool.query("SELECT EMAIL FROM users WHERE email = ?", [email], (error, result) => {
                    if (error) throw error;
                    console.log(result.length)
                    if (result.length > 0) {
                        console.log("User already registered with this email")
                        req.flash("userAlreadyRegistered", "User already registered with this username/email")
                        isInputValid = false;
                        res.redirect("/login?signup=true");
                    } else {
                        if (isInputValid === true) {
                            pool.query("INSERT INTO users (username, email, password) VALUES(?,?,?)", [username, email, passwordHashed], (error, result) => {
                                if (error) throw error;
                                //console.log(result);
                                // DEBUG
                                console.log("Account has been created!");

                                // On met à jour la session de l'utilisateur
                                req.session.login = true;
                                req.session.username = username;
                                req.session.email = email;
                                res.redirect("/profile");

                                connection.release();
                            });
                        } else {
                            res.redirect("/login?signup=true");
                        }
                    }
                })
            }
        })
    })

})

// POST method to login an user to his account
router.post("/api/login", async (req, res) => {
    // On récupère les données de notre form
    const usernameOrEmail = req.body.username;
    const password = req.body.password;

    pool.getConnection((error, connection) => {
        if(error) throw error;
        // Je sélectionne dans notre base de données l'utilisateur ayant un username ou email qui correspond
        pool.query("SELECT USERNAME as username, EMAIL as email FROM users WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail], (error, result) => {
            if(error) throw error;
            console.log(result);
            if(result.length > 0){
                // DEBUG
                //console.log("Email of " + usernameOrEmail + " is " + result[0].email);
                //console.log("Username of " + usernameOrEmail + " is " + result[0].username);
                // On check si l'utilisateur est enregistré
                if(result[0].username.toString().length > 0 || result[0].email.toString().length > 0){
                    //console.log("L'utilisateur existe!")
                    pool.query("SELECT PASSWORD as password FROM users WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail], async (error, result) => {
                        connection.release();
                        if(error) throw error;
                        // DEBUG
                        //console.log(result);
                        let compare = await compareHash(password, result[0].password);
                        if(compare){
                            //console.log("Le mot de passe est valide")
                            // Le mot de passe est correct, on met à jour la session
                            req.session.login = true;
                            req.session.username = usernameOrEmail;
                            res.redirect("/profile")
                        } else {
                            //console.log("Le mot de passe n'est pas valide")
                            res.redirect("/login?signup=false")
                        }
                    })
                } else {
                    connection.release();
                    console.log("L'utilisateur n'est pas enregistré!")
                    res.redirect("/login?signup=false")
                }
            } else {
                connection.release();
                console.log("L'utilisateur n'est pas enregistré!")
                res.redirect("/login?signup=false")
            }
        })
    })

    // On se connecte à notre base de donnée
    /*pool.getConnection((error, connection) => {
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
                    if (compare) {
                        // Le mot de passe est correct, on met à jour la session
                        req.session.login = true;
                        req.session.username = usernameOrEmail;
                        res.redirect("/profile")
                    } else {
                        // DEBUG
                        console.log("Invalid password!")
                        res.redirect("/login?signup=false")
                    }
                })
            } else {
                // On check si l'utilisateur n'a pas entré un pseudo mais un mail
                console.log("L'utilisateur existe, le mdp est-il valide ?");
                pool.query("SELECT * FROM users WHERE email = ?", [usernameOrEmail], async (error, result) => {
                    // On check si l'utilisateur existe par son mail
                    if (result.length > 0) {
                        console.log("L'utilisateur existe, le mdp est-il valide ?");
                        pool.query("SELECT PASSWORD as password FROM `users` WHERE email = ?", [usernameOrEmail], async (error, result) => {
                            if (error) throw error;
                            let compare = await compareHash(password, result[0].password);
                            if (compare) {
                                // Le mot de passe est correct, on met à jour la session
                                req.session.login = true;
                                pool.query("SELECT EMAIL FROM users WHERE email = ?", [usernameOrEmail], (error, result) => {
                                    connection.release();
                                    if (error) throw error;
                                    if (result > 0) {
                                        req.session.username = result[0].username;
                                    }
                                })
                                res.redirect("/profile")
                            } else {
                                // DEBUG
                                console.log("Invalid password!");
                                res.redirect("/login?signup=false")
                            }
                        })
                    } else {
                        console.log("L'utilisateur n'existe pas !");
                        res.redirect("/login?signup=false");
                    }
                })
            }
        })
    })*/
})

router.get("/profile", (req, res) => {
    if (req.session.login) {
        res.render(path.join(__dirname, "..", "..", "views", "profile"), {
            username: req.session.username,
            email: req.session.email
        });
    } else {
        res.redirect("/login?signup=false");
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
