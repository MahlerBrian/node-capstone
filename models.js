'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const TripSchema = mongoose.Schema({
    
            destination: {type: String, required: true},
            duration: {type: Number, required: true},
            created: {type: Date, default: Date.now},
            suitcase: {
                clothes: { //lookup: if default clothing number can be anchored to duration number.
                    shirts: Number,
                    pants: Number,
                    underwear: Number,
                    socks: Number,
                    jacket: Number,
                    shoes: Number
                },
                toiletries: {
                    toothbrush: {type: Boolean, default: false},
                    toothpaste: {type: Boolean, default: false},
                    deodorant: {type: Boolean, default: false},
                    shampoo: {type: Boolean, default: false},
                    floss: {type: Boolean, default: false},
                },
                essentials: {
                    passport: {type: Boolean, default: false},
                    camera: {type: Boolean, default: false},
                    phone: {type: Boolean, default: false},
                }
            }
        }
    );

    TripSchema
    .pre('save', function(next) {
        this.suitcase.clothes.shirts = this.duration;
        this.suitcase.clothes.pants = this.duration /2;
        this.suitcase.clothes.underwear = this.duration;
        this.suitcase.clothes.socks = this.duration;
        this.suitcase.clothes.jacket = 1;
        this.suitcase.clothes.shoes = 1;
        next();
    })



    



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