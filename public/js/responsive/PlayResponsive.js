window.onload = function() {
    if(isUserOnMobile()){

    }
}


/**
 *
 * isUserOnMobile allows to know if user is on a mobile device
 *
 * @returns {Boolean}
 */
function isUserOnMobile() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        //console.log("DEBUG: mobile");
        document.getElementById("game__container").remove();
        return true;
    } else {
        //console.log("DEBUG: not mobile");
        //playVideo();
        return false;
    }
}