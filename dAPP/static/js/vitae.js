const REQUEST_URL_PRIVNET = "localhost:30333/";
const REQUEST_URL_TESTNET = 'http://seed3.neo.org:10332/';
const SCRIPT_HASH = "0x91be06548245891b53b69ca5c17e8a19c231a7d5";
const OPERATION = "query";

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
        $("#current-block-val").html(JSON.stringify(result));
        $("#result").show();
    });
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

function error(message) {
    $("#message").html(message);
    $("#error").show();
}

$(document).ready(function() {
    $("#main-form").submit(function(event) {
        let walletAddress = document.getElementById("walletAddress").value;
        if (isValidWallet(walletAddress)) {
            search(walletAddress);
        } else {
            error("This is not a valid NEO wallet address");
        }

        event.preventDefault();
    });
})
