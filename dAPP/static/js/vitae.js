const REQUEST_URL_PRIVNET = "http://127.0.0.1:30333/";
const REQUEST_URL_TESTNET = 'http://seed3.neo.org:10332/';
const IPFS_URL_ENDPOINT = 'https://ipfs.io/ipfs/'
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
    $("#user-info").show();
}

function error(message) {
    $("#message").html(message);
    $("#error").show();
}

function isValidDate(date) {
  let bits = date.split('/');
  let d = new Date(bits[2], bits[1] - 1, bits[0]);
  return d && (d.getMonth() + 1) == bits[1];
}

function isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function isValidWallet(walletAddress) {
    if (walletAddress.length !== 34 || walletAddress[0] != 'A') { //NEO wallet addresses have 34 chars and start with 'A'
        return false;
    }
    // further ways to validate a wallet address
    return true;
}

function printRes(res) {
    console.log(res);
}

function readUserData(walletAddress) {
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
    console.log("Fetching Blockchain data:")
    console.log(params);
    localNode.invokeFunction(SCRIPT_HASH, OPERATION, params).then(function (result) {
        console.log("Blockchain returned:")
        console.log(result);
        successBlock(JSON.stringify(result));

    });
}

function storeProfile(walletAddress, firstName, lastName, dateOfBirth, email) {
    let profilePic = document.getElementById("profile-pic").files[0];
    if (profilePic === null) {
        error("A profile picture is mandatory!");
        return null;
    }
    let timestamp = Date.now();
    let uniqueName = timestamp + "." + profilePic.name;

    // Stores the image in /images folder in firebase storage
    let storageRef = firebase.storage().ref();

    let storageFolder = storageRef.child('/images/' + uniqueName);
    try {
        storageFolder.put(profilePic)
            .then((snapshot) => {
                let profilePicDownloadURL = snapshot.downloadURL;
                writeUserData(walletAddress, firstName, lastName, dateOfBirth, email, profilePicDownloadURL);
        });
    } catch(err) {
        console.error();(err);
        error("Some error occcurred uploading your picture. Try again later.");
        return null;
    }
    return null;

}

function successBlock(message) {
    $("block-val").html(message);
    $("#result-val").show();
}

function successFirebase(message) {
    $("#firebase-val").html(message);
    $("#result-firebase").show();
}

function writeUserData(walletAddress, firstName, lastName, dateOfBirth, email, profilePicDownloadURL) {
    try {
        firebase.database().ref('users/' + walletAddress).set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            dateOfBirth: dateOfBirth,
            profilePic: profilePicDownloadURL
        });
        successFirebase("Your data was saved successfully");
    } catch(err) {
        console.error("An error occurred: " + err);
        error("It was not possible to save your data at this time. Please try again later");
    }

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
        event.preventDefault();
        cleanDebugInfo();
        let walletAddress = document.getElementById("newWalletAddress").value;
        let day = document.getElementById("day").value.toString();
        let month = document.getElementById("month").value.toString();
        let year = document.getElementById("year").value.toString();
        let dateOfBirth = day + "/" + month + "/" + year;
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let email = document.getElementById("email").value;
        if (!isValidWallet(walletAddress)) {
            error("This is not a valid NEO wallet address");
            return;
        }
        if (!isValidEmail(email) || !isValidDate(dateOfBirth)) {
            error("Email or date of birth not valid");
            return;
        }
        storeProfile(walletAddress, firstName, lastName, dateOfBirth, email);
    });
});
