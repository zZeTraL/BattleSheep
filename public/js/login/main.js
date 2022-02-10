window.onload = function () {

    // On remet à zéro tous les inputs
    loginManager.reset();

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

    document.getElementById("showPassword").addEventListener('click', (ignored) => {
        let passwordInput = document.getElementById("passwordInput");
        if(passwordInput.getAttribute("type") === "password"){
            passwordInput.setAttribute("type", "text");
        } else {
            passwordInput.setAttribute("type", "password");
        }
    })

}