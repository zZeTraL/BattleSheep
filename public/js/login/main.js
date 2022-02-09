window.onload = function () {

    /*if(loginManager.getUrlParameter("signup") === null){
        loginManager.setUrlParameter("signup", "false")
    }*/

    loginManager.reset();

    // Need to be cleaner
    if (loginManager.getUrlParameter("signup") === "true") {
        // Update the action of the form to api/register (nodejs)
        let form = document.getElementById("form");
        form.setAttribute("action", "api/register")
        document.querySelector(".login__button").textContent = "Sign Up"
    }

    // Listener
    document.getElementById("registerSpan").addEventListener('click', (ignored) => {
        loginManager.onRegisterSpanClick();
    })

}