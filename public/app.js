


//Change this later
function getTripData(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_TRIP_DATA)}, 100);
}


function displayTrip(data) {
    console.log("displaying trip");
    console.log(data);
  /*change saved_trips to what? */  for (let i=0; i < data.trips.length; i++) {
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
                    itemCount = `<p>${item}: ${data.trips[i].suitcase[category][item]}<button class='toggleItem'>Toggle</button></p>`;
                }
                itemCounts += itemCount;
            }
        }
        $('.suitcase').append(
            `<p>` + data.trips[i].destination + `</p>` + //add incrementation and deletion buttons
            `<p>` + data.trips[i].duration + `</p>` +
            `<p>` + itemCounts  + `</p>`);
    }
}
function handleEditButtons() {
    $('.suitcase').on('click', '.incrementItem', function() {
        console.log($(this).attr('data-id'));
    })
}

/*function getAndDisplayTrip() {
    $('#create-new-trip').submit(function(event) {
        event.preventDefault();
        toggleElements();
        console.log('About to call displayTrip');
        displayTrip(/*something else here);
    })
}*/

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
        .then(responseJson => displayTrip(responseJson)); 
    });
}



function deleteTrip() {
    $('#deleteTrip').submit(function(event) {
        event.preventDefault();
        //something else here
        fetch('/trips/:id', {
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
    //getAndDisplayTrip();
    handleSignup();
    makeNewTrip();
    checkLoggedIn();
    handleEditButtons();
})