const REQUEST_URL = "localhost:30333/";
REQUEST_URL = 'http://seed3.neo.org:10331/';
const CONTRACT_HASH = "someHash";
const GET_OPERATION = "get";

/*
    invokefunction example:
    {
        "jsonrpc": "2.0",
        "method": "invokefunction",
        "params": [
        "ecc6b20d3ccac1ee9ef109af5a7cdb85706b1df9",
        "balanceOf",
        [
          {
            "type": "Hash160",
            "value": "bfc469dd56932409677278f6b7422f3e1f34481d"
          }
        ]
        ],
        "id": 3
    }
*/
function getVitae() {
    let walletAddress = document.getElementById("searchInput").value;
    console.log("Got walletAddress: " + walletAddress);
    if (!isValidWallet(walletAddress)) {
        return false; //Handle a not valid address
    }

    let args = [
        {
            "type": "String",
            "value": walletAddress,
        }
    ];
    let params = [CONTRACT_HASH, GET_OPERATION, args];
    let method = "invokefunction";
    let rpcPayLoad = {"jsonrpc": "2.0", "method": method, "params": params, "id": 1}; // ID will be sent in the answer

    console.log(rpcPayLoad);

    sendRequest(rpcPayLoad);

}

function sendRequest(rpcPayLoad) {
    //Send the request here
    let request = {
        url : REQUEST_URL,
        type : 'POST', //RPC should always be POST
        data : rpcPayLoad,
        dataType : "json",
        success : function(result) {
            console.log(result);
            switch (result) {
            case true:
                //processResponse(result);
                break;
            default:
                //resultDiv.html(result);
            }
        },
    /*   error: function (xhr, ajaxOptions, thrownError) {
          alert(xhr.status);
          alert(thrownError);
          } */
    };
    console.log(request);
    $.ajax(request);
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
