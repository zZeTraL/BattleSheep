window.onload = function () {

    loginManager.reset();

    // Need to be cleaner
    if (loginManager.getUrlParameter("signup") === "true") {
        // Update the action of the form to api/register (nodejs)
        let form = document.getElementById("form");
        form.setAttribute("action", "api/register")

        // Update the display
        let loginTitleContainer = document.querySelector('.login__title');
        loginTitleContainer.childNodes[1].childNodes[3].textContent = "HI YOU"
        let mark = document.createElement("mark");
        loginTitleContainer.childNodes[3].appendChild(mark);
        loginTitleContainer.childNodes[3].firstChild.textContent = "Create an account"
        document.querySelector(".login__button").textContent = "Sign Up"

        // Adding a new input to the form (email)
        /*let div = document.createElement("div");
        div.setAttribute("class", "login__form__element");
        let divSpan = document.createElement("span");
        divSpan.textContent = "Email";
        div.appendChild(divSpan)
        form.firstChild.appendChild(div);*/


        // Already has an account? Sign In ->
        let signupContainer = document.querySelector(".signup")
        signupContainer.childNodes[1].remove();
        let p = document.createElement("p");
        p.textContent = "Already has an account? ";
        signupContainer.append(p);
        let span = document.createElement("span");
        span.setAttribute("id", "registerSpan");
        span.textContent = "Sign In";
        p.appendChild(span);
        let i = document.createElement("i");
        i.setAttribute("class", "bx bx-right-arrow-alt");
        span.appendChild(i);
    }

    // Listener
    /*document.getElementById("sendButton").addEventListener('click', (ignored) => {
        loginManager.reset();
    })*/

    document.getElementById("registerSpan").addEventListener('click', (ignored) => {
        loginManager.onRegisterSpanClick();
    })

}