const express = require("express");
const path = require("path");
// Module pour crypté des chaînes de caractères
const bcrypt = require("bcrypt");
const router = express.Router();

/*                      F A Q

 * Pourquoi utilise t-on express-flash
 *  Flash est une extension qui va nous permettre de transmettre des "messages" et d'en faire le rendu
 *  i.e. les afficher sans faire sans cesse des redirections.
 *
 */

/**
 * Permet de "crypter" notre mot de passe
 *
 * @param {string} password
 * @returns {*}
 */
function generateHash(password) {
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hashSync(password, salt);
}

/**
 * Permet de comparer un mdp entré et son homologue "crypté" récupérer à partir d'une base de donnée
 *
 * @param {string} password
 * @param {string} hashed
 * @returns {*}
 */
async function compareHash(password, hashed) {
    return await bcrypt.compareSync(password, hashed);
}

/**
 * Permet de check si un mot de passe rempli nos conditions fixées
 *
 * @param password
 * @returns {boolean}
 */
function isPasswordValid(password) {
    // Si notre passe fait moins de 6 caractère OU notre passe contient des espaces
    if (password.length < 6 || password.includes(" ")) {
        // DEBUG
        console.log("Invalid password: " + password);
        return false;
    }
    return true;
}

/**
 * Permet de check si pseudo rempli nos conditions fixées
 *
 * @param username
 * @returns {boolean}
 */
function isUsernameValid(username) {
    // Si notre pseudo
    if (username.length < 3 || username.includes(" ")) {
        // DEBUG
        console.log("Invalid username: " + username);
        return false;
    }
    return true;
}

// Dashboard de l'utilisateur
router.get("/profile", async (req, res) => {
    // Si l'utilisateur est connecté à son compte
    if (req.session.login) {
        let tmpGamesPlayed = undefined;
        let tmpGamesWon = undefined;
        // On créer une connexion à notre base de donnée
        pool.getConnection((error, connection) => {
            // On affiche l'erreur s'il y en a une
            if (error) throw error;
            // On envoie une requête SQL à notre bdd pour pouvoir récupérer le nombre de parties jouées par notre joueur et ses parties gagnées
            pool.query("SELECT GAMESPLAYED as numberOfGamePlayed, GAMESWON as numberOfGameWon FROM users WHERE username = ?", [req.session.username], (error, result) => {
                connection.release();
                // On affiche l'erreur s'il y en a une
                if (error) throw error;
                if (result.length > 0) {
                    tmpGamesPlayed = result[0].numberOfGamePlayed;
                    tmpGamesWon = result[0].numberOfGameWon;

                    // On fait le rendu de notre page en passant en paramètre les différentes informations du joueur
                    res.render(path.join(__dirname, "..", "..", "views", "profile"), {
                        username: req.session.username,
                        email: req.session.email,
                        gamesPlayed: tmpGamesPlayed,
                        gamesWon: tmpGamesWon,
                    });
                } else {
                    // On coupe la connexion à notre bdd
                    connection.release();
                }
            })
        })
    } else {
        // Si l'utilisateur n'est pas connecté à son profile on le redirige vers la page de connexion
        res.redirect("/login?signup=false");
    }
})

// Page pour se connecter
router.get('/login', (req, res) => {
    // Si l'utilisateur est connecté à son compte
    if (req.session.login) {
        // On le redirige vers son dashboard
        res.redirect("/profile")
    } else {
        // L'utilisateur n'est pas connecté à son compte
        req.session.login = false;
        // Variable signup présent dans l'URL (on fait passe une variable d'état dans l'URL pour modifier la page dynamiquement)
        let urlParam = req.query.signup
        // Si le paramètre n'est pas défini
        if (urlParam === undefined) {
            // Par défaut = false  i.e. que si le paramètre n'est pas défini on est redirigé sur la page de connexion
            urlParam = "false";
        }

        // On utilise express-flash afin de transmettre des données sans faire des redirections sans cesse
        // Utile car nous affiche l'état de notre requête post (s'il elle a abouti ou non)
        const userAlreadyRegistered = req.flash('userAlreadyRegistered');
        const registerInvalidUsername = req.flash('registerInvalidUsername');
        const registerInvalidEmail = req.flash('registerInvalidEmail');
        const registerInvalidPassword = req.flash('registerInvalidPassword');
        const loginInvalidPassword = req.flash('loginInvalidPassword');
        const loginUnknownUser = req.flash('loginUnknownUser');

        // On fait notre rendu en passant tous nos flash en variable
        res.render(path.join(__dirname, "..", "..", "views", "login"), {
            // Paramètre de l'URL
            signup: urlParam,
            // Register flash
            userAlreadyRegistered: userAlreadyRegistered[0],
            registerInvalidUsername: registerInvalidUsername[0],
            registerInvalidEmail: registerInvalidEmail[0],
            registerInvalidPassword: registerInvalidPassword[0],
            // Login flash
            loginUnknownUser: loginUnknownUser[0],
            loginInvalidPassword: loginInvalidPassword[0],
        });
    }
})

// POST méthode pour enregistrer un compte
router.post('/api/register', async (req, res) => {
    // On récupère les données de notre formulaire
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // On hash i.e "crypte" notre mot de passe
    // Tant que l'exécution de la fonction generateHash n'est pas terminée on attend
    const passwordHashed = await generateHash(req.body.password);

    // Boolean qui vérifie si nos inputs correspondent avec nos conditions
    // Cette variable va nous permettre aussi d'optimiser nos actions sur notre base de données
    // on vient ainsi limiter l'utilisation des ressources serveur
    let isInputValid = true;

    // On check si les informations envoyées par l'utilisateur correspondent avec nos conditions pour les mots de passe et les pseudos
    // Should be cleaner
    if (!isUsernameValid(username)) {
        // On update notre message flash qui sera affiché à l'utilisateur pour lui rendre compte de l'erreur
        req.flash("registerInvalidUsername", "Username must contain at least 3 characters")
        isInputValid = false;
    }
    if (!isPasswordValid(password)) {
        // On update notre message flash qui sera affiché à l'utilisateur pour lui rendre compte de l'erreur
        req.flash("registerInvalidPassword", "Password must contain at least 6 characters")
        isInputValid = false;
    }

    // Si on a réussi à passer les deux tests au-dessus on peut donc entamer une connexion avec notre base de données
    if(isInputValid){
        // On se connecte à notre base de donnée
        pool.getConnection((error, connection) => {
            // On sélectionne dans notre base de données l'utilisateur ayant un username qui correspond à celui saisi sur le form
            pool.query("SELECT USERNAME FROM users WHERE username = ?", [username], async (error, result) => {
                // On affiche si une erreur est détectée
                if (error) throw error;
                // Si notre requête SQL aboutie alors elle admet forcément un résultat
                // On check donc si un utilisateur n'est pas déjà enregistré avec ce pseudo
                if (result.length > 0) {
                    // On coupe la connection à notre base de donnée
                    connection.release();
                    // Le pseudo est déjà utilisé on a donc une erreur qui va être traduite par une valeur false pour notre booléen
                    isInputValid = false;
                    // On update notre message flash qui sera affiché à l'utilisateur pour lui rendre compte de l'erreur
                    req.flash("userAlreadyRegistered", "User already registered with this username/email")
                    // On "reload" la page avec les flash messages (attention c'est une redirection qui est utilisée comme un reload)
                    res.redirect("/login?signup=true");
                } else {
                    // On sélectionne dans notre base de données l'utilisateur ayant un email qui correspond à celui saisi sur le form
                    pool.query("SELECT EMAIL FROM users WHERE email = ?", [email], (error, result) => {
                        // On affiche si une erreur est détectée
                        if (error) throw error;
                        // On check donc si un utilisateur n'est pas déjà enregistré avec cet email
                        if (result.length > 0) {
                            // On coupe la connection à notre base de donnée
                            connection.release();
                            isInputValid = false;
                            // On update notre message flash qui sera affiché à l'utilisateur pour lui rendre compte de l'erreur
                            req.flash("userAlreadyRegistered", "User already registered with this username/email")
                            // On "reload" la page avec les flash messages (attention c'est une redirection qui est utilisée comme un reload)
                            res.redirect("/login?signup=true");
                        } else {
                            // Si on a survécu à nos différents tests ouffff...
                            if (isInputValid === true) {
                                // On va donc faire une dernière et ultime requête SQL afin de tout simplement ajouter notre utilisateur à notre base de donnée
                                pool.query("INSERT INTO users (username, email, password) VALUES(?,?,?)", [username, email, passwordHashed], (error) => {
                                    // On coupe la connection à notre base de donnée car on ne fais plus aucune requête
                                    connection.release();
                                    // On affiche si une erreur est détectée
                                    if (error) throw error;
                                    // On met à jour la session de l'utilisateur
                                    req.session.login = true;
                                    req.session.username = username;
                                    req.session.email = email;
                                    // On redirige notre utilisateur connecté vers son dashboard
                                    res.redirect("/profile");
                                });
                            } else {
                                // On "reload" la page avec les flash messages (attention c'est une redirection qui est utilisée comme un reload)
                                res.redirect("/login?signup=true");
                            }
                        }
                    })
                }
            })
        })
    } else {
        // On "reload" la page avec les flash messages (attention c'est une redirection qui est utilisée comme un reload)
        res.redirect("/login?signup=true");
    }
})

// POST méthode pour connecter un utilisateur à son compte
router.post("/api/login", async (req, res) => {
    // On récupère les données de notre formulaire
    const usernameOrEmail = req.body.username;
    const password = req.body.password;

    // On se connecte à notre base de donnée
    pool.getConnection((error, connection) => {
        // On affiche si une erreur est détectée
        if(error) throw error;
        // On sélectionne dans notre base de données l'utilisateur ayant un username ou email qui correspond aux inputs du form
        pool.query("SELECT USERNAME as username, EMAIL as email FROM users WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail], (error, result) => {
            // On affiche si une erreur est détectée (request SQL)
            if(error) throw error;
            // Si cette condition est validée cela signifie que l'utilisateur existe
            if(result.length > 0){
                // On check si l'utilisateur est enregistré
                if(result[0].username.toString().length > 0 || result[0].email.toString().length > 0){
                    // L'utilisateur existe
                    //console.log("L'utilisateur existe!")
                    pool.query("SELECT PASSWORD as password FROM users WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail], async (error, result) => {
                        if(error) throw error;
                        // On créé une variable (boolean) qui va contenir le résultat de la fonction compareHash
                        // qui va nous permettre de savoir si le mot de passe saisi est bien celui présent
                        // dans notre base de donnée
                        let compare = await compareHash(password, result[0].password);
                        // Notre exécution de code s'arrête tant que compare na pas reçu le feu vert de la fonction compareHash
                        // On check si les mots passes correspondent
                        if(compare){
                            //console.log("Le mot de passe est valide")
                            // Le mot de passe est correct, on met à jour la session
                            req.session.login = true;
                            req.session.username = usernameOrEmail;
                            pool.query("SELECT EMAIL as email FROM users WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail], (error, result) => {
                                if(error) throw error;
                                // Permet d'ajouter le mail de l'utilisateur en tant que paramètre EJS
                                if(result.length > 0){
                                    req.session.email = result[0].email;
                                    pool.query("SELECT USERNAME as username FROM users WHERE username = ? OR email = ?", [usernameOrEmail, usernameOrEmail], (error, result) => {
                                        // On coupe notre connexion à la base de donnée car nous ne faisons plus aucune requête SQL
                                        connection.release();
                                        if(error) throw error;
                                        // Permet d'ajouter le mail de l'utilisateur en tant que paramètre EJS
                                        if(result.length > 0){
                                            req.session.username = result[0].username;
                                            // On redirige l'utilisateur vers son dashboard
                                            res.redirect("/profile")
                                        }
                                    })
                                }
                            })
                        } else {
                            // On coupe notre connexion à la base de donnée car nous ne faisons plus aucune requête SQL
                            connection.release();
                            //console.log("Le mot de passe n'est pas valide")
                            // On update notre message flash qui sera affiché à l'utilisateur pour lui rendre compte de l'erreur
                            req.flash("loginInvalidPassword", "Invalid password, please try again!")
                            res.redirect("/login?signup=false")
                        }
                    })
                } else {
                    // L'utilisateur n'existe pas
                    // on coupe la connection à notre base de donnée
                    //console.log("L'utilisateur n'est pas enregistré!")
                    connection.release();
                    // On modifie notre flash message
                    // On update notre message flash qui sera affiché à l'utilisateur pour lui rendre compte de l'erreur
                    req.flash("loginUnknownUser", "Unknown user!")
                    res.redirect("/login?signup=false")
                }
            } else {
                // L'utilisateur n'existe pas
                // on coupe la connection à notre base de donnée
                //console.log("L'utilisateur n'est pas enregistré!")
                connection.release();
                // On update notre message flash qui sera affiché à l'utilisateur pour lui rendre compte de l'erreur
                req.flash("loginUnknownUser", "Unknown user!")
                res.redirect("/login?signup=false")
            }
        })
    })
})

// Page pour se déconnecter (cette page n'existe pas réellement)
router.get('/logout', function (req, res, next) {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) return next(err);
            else res.redirect('/');
        });
    }
});

module.exports = router;
