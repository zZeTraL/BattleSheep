# BattleSheep

BattleShip avec des armes spéciales

## Comment redéployer le projet ?

1. **Cloner** le projet
2. **Créer** une base de données
   
   ```
    Table:        users
    Columns:
      ID          (Auto-increment)
      username    (VARCHAR, 255)
      email       (VARCHAR, 255)
      password    (VARCHAR, 255)
      gamesPlayed (INT, 11, valeur par défaut = 0)
      gamesWon    (INT, 11, valeur par défaut = 0)
   ```

4. **Créer** un fichier **.env** à la racine du projet

   ```
    SERVER_HOST = localhost
    SERVER_PORT = 4000
    SERVER_ENV = production

    SESSION_KEY = *STRING*

    DATABASE_NAME = battle_sheep
    DATABASE_HOST = localhost
    DATABASE_PORT = 3306
    DATABASE_USER = root
    DATABASE_PASSWORD =
   ```

4. **Exécuter** la commande suivante
 
   ```
   npm install
   ```

5. (FACULTATIF) **Configurer** le **File Watcher** pour le SCSS (Pour la modification du scss)
6. **Lancer** le serveur avec la commande suivante
 
   ```
   nodemon app
   ```

## Libs

[Animate.css](https://animate.style/)

[Hover.css](https://ianlunn.github.io/Hover/)

[Aos](https://michalsnik.github.io/aos/)

[BoxIcons](https://boxicons.com/)
