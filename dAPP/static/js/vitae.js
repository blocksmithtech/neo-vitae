const REQUEST_URL_PRIVNET = "localhost:8080/";
const REQUEST_URL_TESTNET = 'https://seed1.neo.org:20331';
const IPFS_URL_ENDPOINT = 'https://ipfs.io/ipfs/';
const CONTRACT_HASH = "0x0ab6f029bf0bf748e429a158baa0e78d426d24b3";
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

    $("#user-profile-pic").attr("src", "");
    $("#user-name").html("");
    $("#user-email").html("");
    $("#user-email").attr("href", "");
    $("#user-dob").html("");
    $("#user-info").hide();
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
* @param {string} date
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
* @param {string} email
* @returns {boolean}
*/
function isValidEmail(email) {
    let re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/*
* Returns true if a given wallet address seems to be valid
* @param {string} walletAddress
* @returns {boolean}
*/
function isValidWallet(walletAddress) {
    //NEO wallet addresses have 34 chars and start with 'A'
    if (walletAddress.length !== 34 || walletAddress[0] != 'A') {
        return false;
    }
    return true;
}

function decodeAddress(addr) {
    addr = Neon.u.str2hexstring(addr);
    addr = Neon.u.reverseHex(addr);
    return Neon.wallet.getAddressFromScriptHash(addr);
}

function buildJson(keyValPairsStr) {
    //Step 1
    let pairsArray = [];
    let keyValPairs = keyValPairsStr.split('***');
    keyValPairs.forEach(function(keyVal) {
        let key = keyVal.substring(0, 20);
        let value = keyVal.substring(20);
        let address = decodeAddress(key);
        if(key.length == 20 && value.length > 0) {
            pairsArray.push({address: address, value: value})
        }
    });
    return pairsArray;
}

/*
*
* Searches for an entry to a given wallet Hash into the Neo-Vitae blockchain data.
* Returns an string representing the JSON data.
* TODO: handle the case where nothing is found for a given address.
*/
function search(walletAddress) {
    console.log("search called");
    let Client = new Neon.rpc.RPCClient(REQUEST_URL_PRIVNET, '2.3.3');
    console.log(Client);
    let param2 = new Neon.sc.ContractParam.byteArray(walletAddress, 'address');
    console.log(param2);
    return Client.invokeFunction(CONTRACT_HASH, 'get', param2).then(function(res) {
        let promises = [];
        let val = res.stack[0].value;
        let decoded = Neon.u.hexstring2str(val);
        console.log(decoded);
        //decoded = '12345678901234567890QmXoJLgLFMMq5LCCC9q3mnYjSjnhHYxnoJahK6EMEGuCqA***12345678901234567890QmXoJLgLFMMq5LCCC9q3mnYjSjnhHYxnoJahK6EMEGuCqA';
        //let json = JSON.parse(decoded);
        let json = buildJson(decoded);
        console.log(json);
        json.forEach(function(obj) {
            promises.push(fetchIPFSData(obj.address, obj.value));
        });
        return Promise.all(promises);
    });
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
        event.preventDefault();
        // This cleans DEBUG info. TODO: Remove this when no longer needed
        cleanDebugInfo();
        // Gets walletAddress
        let walletAddress = document.getElementById("walletAddress").value;
        // Checks if walletAddress is valid
        // TODO: Pretty message on invalid data
        if (isValidWallet(walletAddress)) {
            readUserData(walletAddress);
            search(walletAddress).then(function(certifiers) {
                readCertifierData(certifiers);
            });
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
