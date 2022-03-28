# BattleSheep

BattleShip avec des armes spéciales

## Comment redéployer le projet ?

1. **Cloner** le projet
2. **Créer** une base de données
3. **Créer** un fichier **.env** à la racine du projet

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

5. **Configurer** le **File Watcher** pour le SCSS
6. **Lancer** le serveur avec la commande suivante
 
   ```
   nodemon app
   ```

