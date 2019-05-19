let MOCK_TRIP_DATA = {
    "saved_trips": [
        {
            "id": "1111",
            "Destination": "Athens, Greece",
            "Duration": 5,
            "Suitcase": {
                "Clothes": {
                    "Shirts": 5,
                    "Pants": 2,
                    "Underwear": 5,
                    "Socks": 5,
                    "Jacket": 1,
                    "Shoes": 1
                },
                "Toiletries": {
                    "Toothbrush": 1,
                    "Toothpaste": 1,
                    "Deodorant": 1,
                    "Shampoo": 1,
                    "Floss": 1
                },
                "Essentials": {
                    "Passport": 1,
                    "Camera": 1,
                    "Phone": 1,
                }
            }
        },
        {
            "id": "1234",
            "Destination": "Paris, France",
            "Duration": 10,
            "Suitcase": {
                "Clothes": {
                    "Shirts": 7,
                    "Pants": 3,
                    "Underwear": 10,
                    "Socks": 10,
                    "Jacket": 1,
                    "Shoes": 2
                },
                "Toiletries": {
                    "Toothbrush": 1,
                    "Toothpaste": 1,
                    "Deodorant": 1,
                    "Shampoo": 1,
                    "Floss": 1
                },
                "Essentials": {
                    "Passport": 1,
                    "Camera": 1,
                    "Phone": 1,
                }
            }
        }
    ]
};


//Change this later
function getTripData(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_TRIP_DATA)}, 100);
}


function displayTrip(data) {
    console.log("displayTrip");
    for (let i=0; i < data.saved_trips.length; i++) {
        console.log(i);
        console.log(data.saved_trips[i].Destination);
        let itemCounts = "";
        for (let category in data.saved_trips[i].Suitcase) {
            console.log(category);
            itemCounts += `<h2>${category}</h2>`;
            for (let item in data.saved_trips[i].Suitcase[category]) {
                console.log(item);
                let itemCount = `<p>${item}: ${data.saved_trips[i].Suitcase[category][item]}</p>`;
                itemCounts += itemCount;
            }
        }
        $('.packing-list').append(
            `<p>` + data.saved_trips[i].Destination + `</p>` + //add incrementation and deletion buttons
            `<p>` + data.saved_trips[i].Duration + `</p>` +
            `<p>` + itemCounts  + `</p>`);
    }
}

function getAndDisplayTrip() {
    $('#travelplans').submit(function(event) {
        event.preventDefault();
        toggleElements();
        console.log('About to call displayTrip');
        displayTrip(MOCK_TRIP_DATA);
    })
}

//switch out the trip planner form with suitcase template
function toggleElements() {
    $('#travelplans').hide();
    $('.packing-list').show();
}

function handleSignup() {
    $('#sign-up').submit(function(event) {
        event.preventDefault();
        let userName = $('#signUpUsername').val();
        let firstName = $('#signUpFirstName').val();
        let password = $('#signUpPassword').val();
        let data = {userName: userName, firstName: firstName, password: password};
        fetch('/users', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        })
        .then(response => response.json()) // parses JSON response into native Javascript objects 
        .then(responseJson => handleSignupResponse(responseJson)); 
    });
}

function handleSignupResponse(data) {
    console.log(data);
    localStorage.setItem('user', data.id);
    toggleDisplay();
}

function makeNewTrip() {
    $('#create-new-trip').submit(function(event) {
        event.preventDefault();
        let destination = $('#form-destination').val();
        let duration = $('#form-duration').val();
        let data = {destination: destination, duration: duration, userId: localStorage.getItem('user')};
        fetch('/trips', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        })
        .then(response => response.json()) // parses JSON response into native Javascript objects 
        .then(responseJson => handleNewTrip(responseJson)); 
    })
}

function handleNewTrip(data) {
    console.log(data);
}

function toggleDisplay() {
    $('#landing').hide();
    $('#dashboard').show();
}

function checkLoggedIn() {
    if (localStorage.getItem('user')) {
        toggleDisplay();
    }
}


$(function() {
    getAndDisplayTrip();
    handleSignup();
    makeNewTrip();
    checkLoggedIn();
})