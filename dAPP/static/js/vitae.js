const REQUEST_URL_PRIVNET = "http://192.168.1.135:30333/";
const REQUEST_URL_TESTNET = 'http://seed3.neo.org:10332/';
const SCRIPT_HASH = "2767b5977e7b27cce462feedc4c3d9d606c15473";
const OPERATION = "get";

// Initialize Firebase
const config = {
    apiKey: "AIzaSyDXnDvVpoRnCdDMl-YnVoBDLmsSvQGI6KY",
    authDomain: "neo-vitae.firebaseapp.com",
    databaseURL: "https://neo-vitae.firebaseio.com",
    projectId: "neo-vitae",
    storageBucket: "neo-vitae.appspot.com",
    messagingSenderId: "1094595397246"
};

firebase.initializeApp(config);
console.log(firebase);

function cleanDebugInfo() {
    $("#message").html("");
    $("#error").hide();
    $("#firebase-val").html("");
    $("#result-firebase").hide();
    $("block-val").html("");
    $("#result-val").hide();
}

function displaySearchResults(userDetails) {
    let userName = userDetails.firstName.concat(" ");
    userName = userName.concat(userDetails.lastName);
    let userEmail = userDetails.email;
    let mailto = "mailto:".concat(userEmail);
    let userDoB = userDetails.dateOfBirth;
    let userProfilePic = userDetails.profilePic;
    $("#user-profile-pic").attr("src", userProfilePic);
    $("#user-name").html(userName);
    $("#user-email").html(userEmail);
    $("#user-email").attr("href", mailto);
    $("#user-dob").html(userDoB);
}

function error(message) {
    $("#message").html(message);
    $("#error").show();
}

function isValidDate(date) {
    var valid = true;

    date = date.replace('/-/g', '');

    var day   = parseInt(date.substring(0, 2),10);
    var month = parseInt(date.substring(2, 4),10);
    var year  = parseInt(date.substring(4, 8),10);

    if(isNaN(month) || isNaN(day) || isNaN(year)) return false;
    if((month < 1) || (month > 12)) return false;
    if((day < 1) || (day > 31)) return false;
    if(((month == 4) || (month == 6) || (month == 9) || (month == 11)) && (day > 30)) return false;
    if((month == 2) && (((year % 400) == 0) || ((year % 4) == 0)) && ((year % 100) != 0) && (day > 29)) return false;
    if((month == 2) && ((year % 100) == 0) && (day > 29)) return false;
    if((month == 2) && (day > 28)) return false;
    return valid;
}

function isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function isValidWallet(walletAddress) {
    console.log("Wallet address: " + walletAddress);
    if (walletAddress.length !== 34 || walletAddress[0] != 'A') { //NEO wallet addresses have 34 chars and start with 'A'
        console.log("Address is not valid");
        console.log("Has length: ");
        console.log(walletAddress.length);
        return false;
    }
    // further ways to validate a wallet address
    console.log("Address is valid");
    return true;
}

function readUserData(walletAddress) {
    console.log("Reading form firebase...");
    var userDetails;
    try {
        firebase.database().ref('/users/' + walletAddress).once('value').then(function(snapshot) {
            userDetails = snapshot.val();
            successFirebase(JSON.stringify(userDetails));
            displaySearchResults(userDetails);
        });
    } catch(err) {
        console.error(err);
        error("An error as occurred. Please try again later");
    }
}

function printRes(res) {
    console.log(res);
}

function works() {
    let Client = new Neon.rpc.RPCClient(REQUEST_URL_PRIVNET, '2.3.3');
    let param2 = new Neon.sc.ContractParam.byteArray('AMvk23YP6e8k6c9cuypW2U73YLcQxWg65V', 'address')
    Client.invokeFunction('2767b5977e7b27cce462feedc4c3d9d606c15473', 'get', param2).then(function(res) {
        console.log(res);
        let val = res.stack[0].value[0].value;
        let decoded = Neon.u.hexstring2str(val);
        console.log(decoded);
    });

}

function search(walletAddress) {
    let localNode = neo.node(REQUEST_URL_PRIVNET);
    let params = [
        {
            "type" : "String",
            "value" : walletAddress
        }
    ];
    console.log(params);
    localNode.invokeFunction(SCRIPT_HASH, OPERATION, params).then(function (result) {
        console.log(result);
        successBlock(JSON.stringify(result));

    });
}

function writeUserData(walletAddress, firstName, lastName, dateOfBirth, email) {
    console.log("Creating user");
    console.log(walletAddress);
    console.log(firstName);
    console.log(lastName);
    console.log(dateOfBirth);
    console.log(email);
    try {
        firebase.database().ref('users/' + walletAddress).set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            dateOfBirth: dateOfBirth
        });
        successFirebase("Your data was saved successfully");
    } catch(err) {
        console.error("An error occurred: " + err);
        error("It was not possible to save your data at this time. Please try again later");
    }

}

function storeProfilePicture() {
}

function successBlock(message) {
    $("block-val").html(message);
    $("#result-val").show();
}

function successFirebase(message) {
    $("#firebase-val").html(message);
    $("#result-firebase").show();
}



$(document).ready(function() {
    $("#search-form").submit(function(event) {
        cleanDebugInfo();
        let walletAddress = document.getElementById("walletAddress").value;
        if (isValidWallet(walletAddress)) {
            search(walletAddress);
            readUserData(walletAddress);
        } else {
            error("This is not a valid NEO wallet address");
        }

        event.preventDefault();
    });

    $("#insert-form").submit(function(event) {
        cleanDebugInfo();
        let walletAddress = document.getElementById("newWalletAddress").value;
        let day = document.getElementById("day").value.toString();
        let month = document.getElementById("month").value.toString();
        let year = document.getElementById("year").value.toString();
        let dateOfBirth = day + "/" + month + "/" + year;
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let email = document.getElementById("email").value;
        if (isValidWallet(walletAddress)) {
            console.log(dateOfBirth);
            console.log(email);
            if (isValidEmail(email)){ //&& isValidDate(dateOfBirth)
                writeUserData(walletAddress, firstName, lastName, dateOfBirth, email);
            } else {
                error("This is not a valid date of birth or email");
            }

        } else {
            error("This is not a valid NEO wallet address");
        }

        event.preventDefault();
    });

})
