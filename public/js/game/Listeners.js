let registerEvents = (roomId) => {
    /*======================================
     *      BUTTONS SECTION
     *======================================*/
    document.querySelectorAll(".item").forEach((element) => {
        element.addEventListener('click', gameManager.selectItem);
    });

    /*======================================
     *      GAME SECTION
     *======================================*/
    document.getElementById("quitGameBtn").addEventListener('click', () => {
        socket.emit("leaveRoom", (roomId));
    })

    document.getElementById("rotateShip").addEventListener('click', () => {
        document.querySelectorAll(".ship").forEach((element) => {
            //element.classList.toggle("rotate");
            gameManager.toggleRotate();
        })
        console.log(gameManager.getRotateState())
    })

    document.getElementById("readyBtnToStartGame").addEventListener('click', () => {
        // Si on a placé tous les bateaux (i.e. 17 cases occupés dans notre tableau)
        if(!gameManager.getReadyState()){
            if(gameManager.isAllShipArePlaced()){
                gameManager.setReadyState(true);
                socket.emit("enemyReady");
                document.getElementById("youReady").textContent = "Yes";
                document.getElementById("placeOutput").textContent = "You are ready!"
                console.log(gameManager.getReadyState());
            } else {
                console.log("You haven't placed all your ships!")
                document.getElementById("placeOutput").textContent = "You haven't placed all your ships!"
            }
        } else {
            console.log("You are already ready!")
            document.getElementById("placeOutput").textContent = "You are already ready!"
        }
        /* TODO
         *  - inform the player that he hasn't placed all his ships
         */
    })

    document.getElementById("readyBtnToFire").addEventListener('click', gameManager.fireThisCase);

}