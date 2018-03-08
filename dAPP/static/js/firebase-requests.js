/*
* Displays search results
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
* Reads user data from firebase. This allows us to match a wallet address to its owner data.
* @param {string} walletAddress - A user wallet address.
* TODO: Error handling
*/
function readUserData(walletAddress) {
    let userDetails;
    try {
        firebase.database().ref('/users/' + walletAddress).once('value').then(function(snapshot) {
            userDetails = snapshot.val();
            // DEBUG
            successFirebase(JSON.stringify(userDetails));
            // Displays search results
            displaySearchResults(userDetails);
        });
    } catch(err) {
        console.error(err);
        error("An error as occurred. Please try again later");
    }
}

/*
* Stores the user profile picture in firebase storage, retrieves its URL and then calls writeUserData.
* @param {string} walletAddress - A user wallet address.
* @param {string} firstName - A user first name.
* @param {string} lastName - A user last name.
* @param {string} dateOfBirth - A user date of birth.
* @param {email} email - A user wallet email.
* TODO: Error handling
*/
function storeProfile(walletAddress, firstName, lastName, dateOfBirth, email) {
    let profilePic = document.getElementById("profile-pic").files[0];
    if (profilePic === null) {
        error("A profile picture is mandatory!");
        return null;
    }

    // Creates a unique picture name by appending the picture name to the current timestamp
    let timestamp = Date.now();
    let uniqueName = timestamp + "." + profilePic.name;

    // Stores the image in /images folder in firebase storage
    let storageRef = firebase.storage().ref();
    let storageFolder = storageRef.child('/images/' + uniqueName);
    try {
        storageFolder.put(profilePic)
            .then((snapshot) => {
                let profilePicDownloadURL = snapshot.downloadURL;
                // Calls writeUserData with the data to be saved in firebase database after
                // put request finishes
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
* Writes the user data in firebase database.
* @param {string} walletAddress - A user wallet address.
* @param {string} firstName - A user first name.
* @param {string} lastName - A user last name.
* @param {string} dateOfBirth - A user date of birth.
* @param {string} email - A user wallet email.
* @param {string} - The URL of the picture that the user submited.
* TODO: Success message on frontend
* TODO: Error handling
*/
function writeUserData(walletAddress, firstName, lastName, dateOfBirth, email, profilePicDownloadURL) {
    try {
        firebase.database().ref('users/' + walletAddress).set({
            firstName: firstName,
            lastName: lastName,
            email: email,
            dateOfBirth: dateOfBirth,
            profilePic: profilePicDownloadURL
        });
        // DEBUG
        successFirebase("Your data was saved successfully");
    } catch(err) {
        console.error("An error occurred: " + err);
        error("It was not possible to save your data at this time. Please try again later");
    }

}
