let loginManager = (function() {
    // Some importants variable
    let usernameInput = document.getElementById("usernameInput");
    let emailInput = document.getElementsByName("emailInput");
    let passwordInput = document.getElementsByName("passwordInput");

    return {
        // Getters
        getCurrentUrl: () => window.location.href,
        getUrlParameter(parameterName){
          let tmp = new URLSearchParams(window.location.search);
          return tmp.get(parameterName);
        },

        // Setters
        reset(){
            usernameInput.value = "";
            emailInput.value = "";
            passwordInput.value = "";
        },

        setUrlParameter(parameterName, value){
            let tmp =  new URLSearchParams(window.location.search);
            tmp.set(parameterName, value);
            history.replaceState(null, null, "?" + tmp.toString());
            location.reload();
        },

        // Listener
        onRegisterSpanClick(){
            let signupForm = this.getUrlParameter("signup");
            if(signupForm === "false"){
                this.setUrlParameter("signup", "true");
            } else {
                this.setUrlParameter("signup", "false");
            }
        }
    }
})();