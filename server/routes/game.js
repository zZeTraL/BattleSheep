const express = require("express");
const router = express.Router();

io.on("connect", (socket) => {
    console.log("Socket processor started")
})

module.exports = router;
