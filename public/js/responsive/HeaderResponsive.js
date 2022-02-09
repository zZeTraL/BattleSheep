window.onload = function () {
    document.getElementById("navList").addEventListener('click', (ignored) => {
        let navContainer = document.getElementById("navContainer");
        let navStyle = navContainer.style;
        if (navStyle.display === "flex") {
            navStyle.display = "none";
        } else {
            navStyle.display = "flex";
        }
    })
}
