/*
*
* This file contains the function to interact with the IPFS network
* and fetch the data of the Hashes contained in the NEO blockchain
*
*/

const IPFS_PROXY_URL = "https://ipfs.io/ipfs/"

/*
* Requests to a given proxy the file containing the JSON data of a given hash.
* Throws Exception in case there is connection problem the data is in a bad
* format.
* @params {string} Hash
* @params {function} callback (should accept 2 params, data and error)
*/
function fetchIPFSData(hash, callback){
    $.get(IPFS_PROXY_URL + hash, function(data){
        try {
            var info = JSON.parse(data);
        } catch(e){
            callback(undefined, e)
            return
        }
        callback(info, undefined)
    }).fail(function(){
        callback(undefined, {'error': 'Network error'})
    })
}
