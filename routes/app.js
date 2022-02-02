const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);

const localEnv = {
    hostname: "localhost",
    port: 4200
}

app.use(express.static(path.join(__dirname, "..")));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "views", "home", "index.html"));
})

http.listen(localEnv.port, () => {
    console.log("Server started on port: " + localEnv.port + " (" + localEnv.hostname + ")");
});