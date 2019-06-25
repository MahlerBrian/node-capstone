
function displayTrip(data) {
    let itemCounts = "";
    for (let i=0; i < data.trips.length; i++) {
        itemCounts += `<div class='itemContainer'> `
        itemCounts += `<p class='destination'>` + data.trips[i].destination + `</p>`
        itemCounts += `<p class='duration'>` + data.trips[i].duration + ' Days' + `</p>`
        itemCounts += `<button class="deleteTrip" data-id= '${data.trips[i]._id}'>Delete trip</button>`
        for (let category in data.trips[i].suitcase) {
            itemCounts += `<h2>${category}</h2>`;
            for (let item in data.trips[i].suitcase[category]) {
                let itemCount;
                if (category == 'clothes') {
                    itemCount = `<p class='itemValue'>${item}: <span id=itemCount>${data.trips[i].suitcase[category][item]}</span><button class='incrementItem' data-id= '${data.trips[i]._id}' data-category= '${category}' data-item= '${item}'>+</button><button class='decrementItem' data-id= '${data.trips[i]._id}' data-category='${category}' data-item= '${item}'>-</button></p>`;
                }
                else {
                    itemCount = `<p class='itemValue'>${item}: <span id=itemToggle>${data.trips[i].suitcase[category][item]}</span><button class='toggleItem' data-id= '${data.trips[i]._id}' data-category='${category}' data-item= '${item}'>Toggle</button></p>`;
                }
                itemCounts += itemCount;
            }
        }
        itemCounts += `</div>`
    }
    $('#tripDisplay').html(itemCounts);
}


function handleIncrementButton() {
    $('#tripDisplay').on('click', '.incrementItem', function() {
        let itemCount = $(this).parent().find('#itemCount').text();
        itemCount = parseInt(itemCount)+1;
        $(this).parent().find('#itemCount').text(itemCount);
        let tripID = $(this).attr('data-id');
        let category = $(this).attr('data-category');
        let item = $(this).attr('data-item');
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
        .then(responseJson => {
            console.log(responseJson);
        }) 
    })
}

function handleDecrementButton() {
    $('#tripDisplay').on('click', '.decrementItem', function() {
        let tripID = $(this).attr('data-id');
        let category = $(this).attr('data-category');
        let item = $(this).attr('data-item');
        let itemCount = $(this).parent().find('#itemCount').text();
        itemCount = parseInt(itemCount)-1;
        $(this).parent().find('#itemCount').text(itemCount);
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
        .then(responseJson => console.log(responseJson)) 
    })
}

function handleToggleButton() {
    $('#tripDisplay').on('click', '.toggleItem', function() {
        let tripID = $(this).attr('data-id');
        let category = $(this).attr('data-category');
        let item = $(this).attr('data-item');
        let itemToggle = $(this).parent().find('#itemToggle').text();
        if (itemToggle === 'true') {
            $(this).parent().find('#itemToggle').text('false');
        }
        else {
            $(this).parent().find('#itemToggle').text('true');
        }
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
        .then(responseJson => console.log(responseJson)); 
    })
}

function handleEditTripResponse(data) {
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
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        })
        .then(response => response.json()) // parses JSON response into native Javascript objects 
        .then(responseJson => displayTrip(responseJson)); 
    });
}


function deleteTrip() {
    $('#tripDisplay').on('click', '.deleteTrip', function() {
        $(this).parent().empty();
        //console.log($(this).parent('.itemContainer'));
        let tripID = $(this).attr('data-id'); 
        console.log('delete clicked');
        let data = {userId: localStorage.getItem('user')};
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
            body: JSON.stringify(data)
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

function handleLogin() {
    $('#sign-in').submit(function(event) {
        event.preventDefault();
        let userName = $('#loginName').val();
        let password = $('#loginPassword').val();
        let data = {userName: userName, password: password};
        fetch('/login', {
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

function handleLogout() {
    $('#logOut').click(function(event) {
        localStorage.removeItem('user');
        location.reload();
    })
}

function handleSignupResponse(data) {
    localStorage.setItem('user', data.id);
    toggleDisplay();
    fetch(`/users/${localStorage.getItem('user')}`)
        .then(response => response.json()) // parses JSON response into native Javascript objects 
        .then(responseJson => displayTrip(responseJson)); 
}


function checkLoggedIn() {
    if (localStorage.getItem('user')) {
        toggleDisplay();
        fetch(`/users/${localStorage.getItem('user')}`)
        .then(response => response.json()) // parses JSON response into native Javascript objects 
        .then(responseJson => displayTrip(responseJson)); 
    }
}


$(function() {
    handleLogin();
    handleSignup();
    makeNewTrip();
    checkLoggedIn();
    handleIncrementButton();
    handleDecrementButton();
    handleToggleButton();
    deleteTrip();
    handleLogout();
})