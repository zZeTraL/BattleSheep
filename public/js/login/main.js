window.onload = function () {

    // Need to be cleaner
    if (loginManager.getUrlParameter("signup") === "true") {
        // Update the display
        let loginTitleContainer = document.querySelector('.login__title');
        loginTitleContainer.childNodes[1].childNodes[3].textContent = "HI YOU"

        let mark = document.createElement("mark");
        loginTitleContainer.childNodes[3].appendChild(mark);
        loginTitleContainer.childNodes[3].firstChild.textContent = "Create an account"

        document.querySelector(".login__button").textContent = "Sign Up"

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

    document.getElementById("registerSpan").addEventListener('click', (ignored) => {
        loginManager.onRegisterSpanClick();
    })

}