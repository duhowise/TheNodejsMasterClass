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
helpers.hash = function(data) {
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
helpers.parseJsonToObject = function(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        return {};
    }
};

// export the helper module

module.exports = helpers;
