'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const tripSchema = mongoose.Schema({
    saved_trips: [
        {
            destination: {type: String, required: true},
            duration: {type: Number, required: true},
            created: {type: Date, default: Date.now},
            suitcase: {
                clothes: {
                    shirts: Number,
                    pants: Number,
                    underwear: Number,
                    socks: Number,
                    jacket: Number,
                    shoes: Number
                },
                toiletries: {
                    toothbrush: Boolean,
                    toothpaste: Boolean,
                    deodorant: Boolean,
                    shampoo: Boolean,
                    Floss: Boolean
                },
                essentials: {
                    passport: Boolean,
                    camera: Boolean,
                    phone: Boolean
                }
            }
        }
    ]
});

tripSchema.methods.serialize = function() {
    return {
        saved_trips: [{
            id: this._id,
            destination: this.destination,
            duration: this.duration,
            suitcase: {
                clothes: {
                    shirts: this.shirts,
                    pants: this.pants,
                    underwear: this.underwear,
                    socks: this.socks,
                    jacket: this.jacket,
                    shoes: this.shoes
                },
                toiletries: {
                    toothbrush: this.toothbrush,
                    toothpaste: this.toothpaste,
                    deodorant: this.deodorant,
                    shampoo: this.shampoo,
                    floss: this.floss
                },
                essentials: {
                    passport: this.passport,
                    camera: this.camera,
                    phone: this.phone
                }
            }
        }]
    };
};

const SavedTrip = mongoose.model('SavedTrip', tripSchema);

module.exports = {SavedTrip};