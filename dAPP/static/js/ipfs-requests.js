/*
*
* This file contains the function to interact with the IPFS network
* and fetch the data of the Hashes contained in the NEO blockchain
*
*/

const IPFS_PROXY_URL = "https://ipfs.io/ipfs/";

/*
* Requests to a given proxy the file containing the JSON data of a given hash.
* @param {string} Hash
* @returns {Promise} A promise that returns the JSON data when resolved and
* and rejects in case there is connection problem the data is in a bad format.
*/
function fetchIPFSData(hash){
    return $.getJSON(IPFS_PROXY_URL + hash);
}