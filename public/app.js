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
    for (index in data.saved_trips) {
        $('.packing-list').append(
            `<p>` + data.saved_trips[index].text + `</p>`);
    }
}

function getAndDisplayTrip() {
    getTripData(displayTrip);
}

//switch out the trip planner form with suitcase template
function toggleElements() {
    $('#travelplans').hide();
    $('.packing-list').show();
}

$(function() {
    getAndDisplayTrip();
})