function displayCertifiers(certifier, certifierData) {
    let extras = "";
    for (let j = 0; j < certifier.ipfsData.extra.length; j++) {
        extras = extras + certifier.ipfsData.extra[j] + "\n";
    }

    certifierData = certifierData || {
        website: '',
        pictureUrl: '',
    }

    $('#entries').append(
        `<dl class="row entry col-sm-8">
            <dt class="col-sm-3"><a href="`+ certifierData.website + `">
                <img src="`+ certifierData.pictureUrl + `" style="width:42px;height:42px;border:0;">
                </a>
            </dt>
            <dd class="col-sm-9"><b>`+ certifier.ipfsData.certifier + `</b></dd>

            <dt class="col-sm-3">Issued to</dt>
            <dd class="col-sm-9">` + certifier.ipfsData.name + `</dd>

            <dt class="col-sm-3">Dates</dt>
            <dd class="col-sm-9">From: ` + certifier.ipfsData.from + `To: ` + certifier.ipfsData.to + `</dd>

            <dt class="col-sm-3">Certification</dt>
            <dd class="col-sm-9">` + certifier.ipfsData.certification + `}</dd>

            <dt class="col-sm-3">Description</dt>
            <dd class="col-sm-9">` + certifier.ipfsData.description + `</dd>

            <dt class="col-sm-3">Extras</dt>
            <dd class="col-sm-9">` + extras + `</dd>


        </dl>`
    );
}/*
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
    $("#user-profile-pic").attr("style", "width:250px;height:250px;border:0;")
    $("#user-profile-pic").attr("src", userProfilePic);
    $("#user-name").html(userName);
    $("#user-email").html(userEmail);
    $("#user-email").attr("href", mailto);
    $("#user-dob").html(userDoB);
    $("#user-info").show();
}

/*
* Reads certifier data from firebase database and then calls a function to display the data
* @param certifier - Array of json objects
* TODO: Error handling
*/
function readCertifierData(certifiers) {
    let i = 0;
    for (i = 0; i < certifiers.length; i++) {
        let certifier = certifiers[i];
        try {
            firebase.database().ref('/certifiers/' + certifier.institutionAddress).once('value').then(function(snapshot) {
                let certifierData  = (snapshot.val());
                // DEBUG
                //successFirebase(JSON.stringify(certifierData));
                // Displays certificates when results are retrieved
                displayCertifiers(certifier, certifierData)

            });
        } catch(err) {
            console.error(err);
            error("An error as occurred. Please try again later");
        }
    }
    $("#entries-found").html(i.toString() + " entries found")
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
            console.log(snapshot);
            userDetails = snapshot.val();
            console.log(userDetails);
            // DEBUG
            //successFirebase(JSON.stringify(userDetails));
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
* Writes a certifier data to firebase database.
* @param {string} walletAddress - Certifier official wallet address.
* @param {string} name - Certifier official name
* @param {string} website - Certifier official website
* @param {string} city - Certifier address: city
* @param {string} country - Certifier address: country
* @param {string} pictureUrl - Certifier official image URL
* TODO: Success message on frontend
* TODO: Error handling
*/
function writeCertifierData(walletAddress, type, name, website, city, country, pictureUrl) {
    try {
        firebase.database().ref('certifiers/' + walletAddress).set({
            type: type,
            name: name,
            website: website,
            city: city,
            country: country,
            pictureUrl: pictureUrl
        });
        // DEBUG
        successFirebase("Your data was saved successfully");
    } catch(err) {
        console.error("An error occurred: " + err);
        error("It was not possible to save your data at this time. Please try again later");
    }

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
