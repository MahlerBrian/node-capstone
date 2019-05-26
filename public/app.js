


//Change this later- should mock_trip_data just be data?
function getTripData(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_TRIP_DATA)}, 100);
}


function displayTrip(data) {
    console.log("displaying trip");
    console.log(data);
    for (let i=0; i < data.trips.length; i++) {
        console.log(i);
        console.log(data.trips[i].destination);
        let itemCounts = "";
        for (let category in data.trips[i].suitcase) {
            console.log(category);
            itemCounts += `<h2>${category}</h2>`;
            for (let item in data.trips[i].suitcase[category]) {
                console.log(item);
                let itemCount;
                if (category == 'clothes') {
                    console.log('category is clothes');
                    itemCount = `<p>${item}: ${data.trips[i].suitcase[category][item]}<button class='incrementItem' data-id= '${data.trips[i]._id}' data-category= '${category}' data-item= '${item}'>+</button><button class='decrementItem' data-id= '${data.trips[i]._id}' data-category='${category}' data-item= '${item}'>-</button></p>`;
                }
                else {
                    console.log('category !== clothes'); 
                    itemCount = `<p>${item}: ${data.trips[i].suitcase[category][item]}<button class='toggleItem' data-id= '${data.trips[i]._id}' data-category='${category}' data-item= '${item}'>Toggle</button></p>`;
                }
                itemCounts += itemCount;
            }
        }
        $('.suitcase').append(
            `<p>` + data.trips[i].destination + `</p>` + 
            `<p>` + data.trips[i].duration + `</p>` +
            `<p>` + itemCounts  + `</p>`);
    }
}


function handleIncrementButton() {
    $('.suitcase').on('click', '.incrementItem', function() {
        let tripID = $(this).attr('data-id');
        let category = $(this).attr('data-category');
        let item = $(this).attr('data-item');
        console.log(tripID, category, item);
        fetch(`/trips/${tripID}`, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({ category: category, id: tripID, item: item, action: 'increment', suitcase: true, userId: localStorage.getItem('user') }), 
        })
        .then(response => response.json()) // parses JSON response into native Javascript objects 
        .then(responseJson => handleEditTripResponse(responseJson)); 
    })
}

function handleDecrementButton() {
    $('.suitcase').on('click', '.decrementItem', function() {
        let tripID = $(this).attr('data-id');
        let category = $(this).attr('data-category');
        let item = $(this).attr('data-item');
        console.log(tripID, category, item);
        fetch(`/trips/${tripID}`, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({ category: category, id: tripID, item: item, action: 'decrement', suitcase: true, userId: localStorage.getItem('user') }), 
        })
        .then(response => response.json()) 
        .then(responseJson => handleEditTripResponse(responseJson)); 
    })
}

function handleToggleButton() {
    $('.suitcase').on('click', '.toggleItem', function() {
        let tripID = $(this).attr('data-id');
        let category = $(this).attr('data-category');
        let item = $(this).attr('data-item');
        console.log(tripID, category, item);
        fetch(`/trips/${tripID}`, {
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            body: JSON.stringify({ category: category, id: tripID, item: item, action: 'toggle', suitcase: true, userId: localStorage.getItem('user') }), 
        })
        .then(response => response.json()) // parses JSON response into native Javascript objects 
        .then(responseJson => handleEditTripResponse(responseJson)); 
    })
}

//what was this for?
function handleEditTripResponse(data) {
    console.log(data);
    displayTrip(data);
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
        .then(responseJson => displayTrip(responseJson)); 
    });
}


function deleteTrip() {
    $('#deleteTrip').submit(function(event) {
        event.preventDefault();
        let tripID = $(this).attr('data-id'); 
        fetch(`/trips/${tripID}`, {
            method: 'DELETE',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'follow',
            referrer: 'no-referrer',
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(responseJson => displayTrip(responseJson));
    })
}


//switch out the intro screen with the trip planner form
function toggleDisplay() {
    $('#landing').hide();
    $('#dashboard').show();
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


function checkLoggedIn() {
    if (localStorage.getItem('user')) {
        toggleDisplay();
    }
}


$(function() {
    //getAndDisplayTrip();
    handleSignup();
    makeNewTrip();
    checkLoggedIn();
    handleIncrementButton();
    handleDecrementButton();
    handleToggleButton();
})