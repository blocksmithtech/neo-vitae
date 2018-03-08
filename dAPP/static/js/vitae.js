const REQUEST_URL_PRIVNET = "http://95.172.164.173:30333/";
const REQUEST_URL_TESTNET = 'http://seed3.neo.org:10332/';
const IPFS_URL_ENDPOINT = 'https://ipfs.io/ipfs/'
const SCRIPT_HASH = "0x3e1c2c68382523cdcce6fee32a33c017c0d8e2c0";
const OPERATION = "get";

/*
* This is useful for DEBUG only
* TODO: Get rid of this before sending to production
*/
function cleanDebugInfo() {
    $("#message").html("");
    $("#error").hide();
    $("#firebase-val").html("");
    $("#result-firebase").hide();
    $("block-val").html("");
    $("#result-val").hide();
}

/*
* This is useful for DEBUG only
* TODO: Convert this into pretty message
*/
function error(message) {
    $("#message").html(message);
    $("#error").show();
}

/*
* Returns true if a given date is valid and false otherwise.
* @params {string} date
* @returns {boolean}
*/
function isValidDate(date) {
  let bits = date.split('/');
  let d = new Date(bits[2], bits[1] - 1, bits[0]);
  return d && (d.getMonth() + 1) == bits[1];
}

/*
* Returns true if a given email matches a regular expression that validates email syntaxe,
* false otherwise.
* @params {string} email
* @returns {boolean}
*/
function isValidEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/*
* Returns true if a given wallet address seems to be valid
* @params {string} walletAddress
* @returns {boolean}
*/
function isValidWallet(walletAddress) {
    //NEO wallet addresses have 34 chars and start with 'A'
    if (walletAddress.length !== 34 || walletAddress[0] != 'A') {
        return false;
    }
    return true;
}

/*
*
* Searches for an entry to a given wallet Hash into the Neo-Vitae blockchain data.
* Returns an string representing the JSON data.
* TODO: handle the case where nothing is found for a given address.
*/
function search() {
    let Client = new Neon.rpc.RPCClient(REQUEST_URL_PRIVNET, '2.3.3');
    let param2 = new Neon.sc.ContractParam.byteArray('AYkNyJrFnVkGpWixxGpPDQekzj4R9U3Zmz', 'address');
    return Client.invokeFunction('0xf30097b13ae7b3d67fe6e63b674e1237c097efe5', 'get', param2).then(function(res) {
        let val = res.stack[0].value;
        let decoded = Neon.u.hexstring2str(val);
        //TODO: JSON parsing not working!
        let json = JSON.parse(decoded);
        return getIPFSAddress(json['value']);
    });
}

function getIPFSAddress(address) {
    return $.getJSON('https://ipfs.io/ipfs/' + address);
}

/*
* This is useful for DEBUG only
* TODO: Get rid of this before sending to production
*/
function successBlock(message) {
    $("block-val").html(message);
    $("#result-val").show();
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

/*
* This is useful for DEBUG only
* TODO: Get rid of this before sending to productionv
*/
function successFirebase(message) {
    $("#firebase-val").html(message);
    $("#result-firebase").show();
}



$(document).ready(function() {
    $("#search-form").submit(function(event) {
        // This cleans DEBUG info. TODO: Remove this when no longer needed
        cleanDebugInfo();
        // Gets walletAddress
        let walletAddress = document.getElementById("walletAddress").value;
        // Checks if walletAddress is valid
        // TODO: Pretty message on invalid data
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
        // This cleans DEBUG info. TODO: Remove this when no longer needed
        cleanDebugInfo();
        let walletAddress = document.getElementById("newWalletAddress").value;
        let day = document.getElementById("day").value.toString();
        let month = document.getElementById("month").value.toString();
        let year = document.getElementById("year").value.toString();
        let dateOfBirth = day + "/" + month + "/" + year;
        let firstName = document.getElementById("firstName").value;
        let lastName = document.getElementById("lastName").value;
        let email = document.getElementById("email").value;
        // Checks if walletAddress is valid
        // TODO: Pretty message on invalid data
        if (!isValidWallet(walletAddress)) {
            error("This is not a valid NEO wallet address");
            return;
        }
        // Checks if email and date is valid
        // TODO: Pretty message on invalid data
        if (!isValidEmail(email) || !isValidDate(dateOfBirth)) {
            error("Email or date of birth not valid");
            return;
        }
        storeProfile(walletAddress, firstName, lastName, dateOfBirth, email);
    });
});
