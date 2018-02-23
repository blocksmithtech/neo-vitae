const REQUEST_URL_PRIVNET = "http://192.168.1.135:30333/";
const REQUEST_URL_TESTNET = 'http://seed3.neo.org:10332/';
const SCRIPT_HASH = "2767b5977e7b27cce462feedc4c3d9d606c15473";
const OPERATION = "get";

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
