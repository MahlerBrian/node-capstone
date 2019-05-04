'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const TripSchema = mongoose.Schema({
    
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

TripSchema.methods.serialize = function() {
    return {
            id: this._id,
            destination: this.destination,
            duration: this.duration,
            created: this.created,
            suitcase: this.suitcase,
        }
    };

const SavedTrip = mongoose.model('SavedTrip', TripSchema);


let UserSchema = mongoose.Schema({
    firstName: {type: String, required: true},
    userName: {type: String, required: true, unique: true},
    password: {type: String, required: true}, 
    trips: [TripSchema]
});

UserSchema.methods.serialize = function() {
    return {
        id: this._id,
        firstName: this.firstName,
        userName: this.userName || '',
        trips: this.trips
    };
};

UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);


module.exports = {SavedTrip, User};