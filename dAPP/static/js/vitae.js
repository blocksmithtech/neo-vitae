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
* Displays the search results
* @params {object} userDetails - An object with the user details
*/
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
    let param2 = new Neon.sc.ContractParam.byteArray('AMvk23YP6e8k6c9cuypW2U73YLcQxWg65V', 'address');
    return Client.invokeFunction('2767b5977e7b27cce462feedc4c3d9d606c15473', 'get', param2).then(function(res) {
        let val = res.stack[0].value[0].value;
        let decoded = Neon.u.hexstring2str(val);
        return Promise.resolve(decoded);
    });
}

/*
* This is useful for DEBUG only
* TODO: Get rid of this before sending to production
*/
function successBlock(message) {
    $("block-val").html(message);
    $("#result-val").show();
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
