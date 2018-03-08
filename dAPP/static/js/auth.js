const config = {
    apiKey: "AIzaSyDXnDvVpoRnCdDMl-YnVoBDLmsSvQGI6KY",
    authDomain: "neo-vitae.firebaseapp.com",
    databaseURL: "https://neo-vitae.firebaseio.com",
    projectId: "neo-vitae",
    storageBucket: "neo-vitae.appspot.com",
    messagingSenderId: "1094595397246"
  };

firebase.initializeApp(config);

// Initialize the FirebaseUI Widget using Firebase.
let ui = new firebaseui.auth.AuthUI(firebase.auth());

let uiConfig = {
  callbacks: {
    signInSuccess: function(currentUser, credential, redirectUrl) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      let currentUserToString = JSON.stringify(currentUser);
      console.log(currentUserToString);
      setCookie("Current-User", currentUserToString, 7);
      debugger;
      return true;
    },
    uiShown: function() {
      // The widget is rendered.
      // Hide the loader.
      document.getElementById('loader').style.display = 'none';
    }
  },
  // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
  signInFlow: 'popup',
  signInSuccessUrl: 'index.html',
  signInOptions: [
    // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  // Terms of service url.
  tosUrl: '<your-tos-url>'
};

// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

initApp = function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            $("#signin").hide();
            $("#logout").show();
        } else {
            // User is signed out.
            $("#signin").show();
            $("#logout").hide();
          }
    }, function(error) {
        console.log(error);
    });
  };

window.addEventListener('load', function() {
    initApp()
});

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

function getCurrentUser() {
    let currentUser = JSON.parse(getCookie("Current-User"));
    return currentUser;
}

function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function signOut() {
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      setCookie("Current-User", "", 0);
    }).catch(function(error) {
      // An error happened.
    });
}
