window.onload = function () {
    let navContainer = document.getElementById("navContainer");
    document.getElementById("navList").addEventListener('click', (ignored) => {
        let navStyle = navContainer.style;
        if (navStyle.display === "flex") {
            navStyle.display = "none";
        } else {
            navStyle.display = "flex";
        }
    })
}

let media = window.matchMedia("(min-width: 65em)")
let navContainer = document.getElementById("navContainer");
const headerNavList = new ResizeObserver((entries) => {
    let navStyle = navContainer.style;
    if(media.matches){
        navStyle.display = "flex";
    } else {
        navStyle.display = "none";
    }
});
headerNavList.observe(document.body);