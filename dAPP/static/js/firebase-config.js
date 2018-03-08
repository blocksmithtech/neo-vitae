/*
* This code initializes firebase using our app configuration data.
*/
const config = {
    apiKey: "AIzaSyDXnDvVpoRnCdDMl-YnVoBDLmsSvQGI6KY",
    authDomain: "neo-vitae.firebaseapp.com",
    databaseURL: "https://neo-vitae.firebaseio.com",
    projectId: "neo-vitae",
    storageBucket: "neo-vitae.appspot.com",
    messagingSenderId: "1094595397246"
};

firebase.initializeApp(config);
