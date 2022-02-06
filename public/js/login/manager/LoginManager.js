let loginManager = (function() {
    // Some importants variable
    let usernameInput = document.getElementById("usernameInput");
    let passwordInput = document.getElementsByName("passwordInput");
    let registerSpan = document.getElementById("registerSpan");

    return {
        // Getters
        getCurrentUrl: () => window.location.href,
        getUrlParameter(parameterName){
          let tmp = new URLSearchParams(window.location.search);
          return tmp.get(parameterName);
        },

        // Setters
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