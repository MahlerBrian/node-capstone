'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const tripSchema = mongoose.Schema({
    
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
                    floss: Boolean
                },
                essentials: {
                    passport: Boolean,
                    camera: Boolean,
                    phone: Boolean
                }
            }
        }
    );

tripSchema.methods.serialize = function() {
    return {
            id: this._id,
            destination: this.destination,
            duration: this.duration,
            created: this.created,
            suitcase: this.suitcase,
        }
    };

const SavedTrip = mongoose.model('SavedTrip', tripSchema);

//userSchema goes here


module.exports = {SavedTrip};