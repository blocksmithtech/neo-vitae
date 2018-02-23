//const REQUEST_URL = "localhost:30333/";
const REQUEST_URL = 'http://seed3.neo.org:10332/';
const CONTRACT_HASH = "someHash";
const GET_OPERATION = "get";

function search() {
    let localNode = neo.node(REQUEST_URL);
    localNode.getBlockCount().then(function (result) {
        $("#current-block-val").html(result);
        $("#result").show();
    });
}

function isValidWallet(walletAddress) {
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

$(document).ready(function() {
    $("#main-form").submit(function(event) {
        search();
        event.preventDefault();
    });
})

