//@ts-check
/*
*

Helpers for the various tasks 
*/
// Dependencies
var crypto = require('crypto');
var config = require('../config');

// container for helpers
var helpers = {};

// create a sha256 hash
helpers.hash = function (data) {
    if (typeof data == 'string' && data.length > 0) {
        var hash = crypto
            .createHmac('sha256', config.hashingSecret)
            .digest('hex');

        return hash;
    } else {
        return false;
    }
};

// parse a json string in all cases without throwing an error
helpers.parseJsonToObject = function (jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return {};
    }
};

helpers.createRandomString = function (stringSize) {
    stringSize =
        typeof stringSize == 'number' && stringSize > 0 ? stringSize : false;

    if (stringSize) {
        // define all the possible characters that could go into a string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz123456789';

        // start the final string
        var tokenString = '';
        for (var i = 1; i <= stringSize; i++) {
            // get a random character from the possible character
            var randomCharacter = possibleCharacters.charAt(
                Math.floor(Math.random() * possibleCharacters.length)
            );
            tokenString += randomCharacter;
        }
        return tokenString;
    } else {
        return false;
    }
};

// export the helper module

module.exports = helpers;
