/**
 *
 * these are the request handlers
 */

//Dependencies
_data = require('./data');
var helpers = require('./helpers');

//define handlers
var handlers = {};

handlers.ping = function(data, callback) {
    callback(200);
};

//not found handler
handlers.notFound = function(data, callback) {
    callback(404);
};

// users handler

handlers.users = function(data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
};
// container for the users submethods
handlers._users = {};

// post users
// required data: firstName,lastName,phone,password, tosAgreement
// optional data: none
handlers._users.post = function(data, callback) {
    // check that all required feilds are filled out
    var firstName =
        typeof data.payload.firstName == 'string' &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    var lastName =
        typeof data.payload.lastName == 'string' &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    var phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;
    var password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    var tosAgreement =
        typeof data.payload.tosAgreement == 'boolean' &&
        data.payload.tosAgreement == true
            ? true
            : false;
    if (firstName && lastName && phone && password && tosAgreement) {
        // make sure that the user does not already exist
        _data.read('users', phone, function(error, data) {
            if (error) {
                // Hash the password
                var hashedPassword = helpers.hash(password);
                if (hashedPassword) {
                    // create user object
                    var userObject = {
                        firstName: firstName,
                        lastName: lastName,
                        phone: phone,
                        hashedPassword: hashedPassword,
                        tosAgreement: true,
                    };

                    // store the user
                    _data.create('users', phone, userObject, function(error) {
                        if (!error) {
                            callback(200);
                        } else {
                            console.log(error);
                            callback(500, {
                                error: 'could not create new user',
                            });
                        }
                    });
                } else {
                    callback(500, { Error: 'could not hash password' });
                }
            } else {
                callback(400, {
                    error: 'A user with that phone number already exist',
                });
            }
        });
    } else {
        callback(400, { Error: 'Missig requirred feilds' });
    }
};
// get users
// required data:phone
// Optional data:none
//TODO allow only authenticated users retrieve their data
handlers._users.get = function(data, callback) {
    //    check that the phone number provided is valid
    var phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length == 10
            ? data.queryStringObject.phone.trim()
            : false;
    if (phone) {
        _data.read('users', phone, function(error, data) {
            if (!error && data) {
                //remove the hashed password from the user object before returning it to the user
                delete data.hashedPassword;
                callback(200, data);
                return;
            } else {
                callback(400);
            }
        });
    } else {
        callback(400, { Error: 'Missing required feilds' });
    }
};

// put users
// required data: phone
// optional data: firstname, lastName,password(at least one must be specified)
handlers._users.put = function(data, callback) {
    var phone =
        typeof data.payload.phone == 'string' &&
        data.payload.phone.trim().length == 10
            ? data.payload.phone.trim()
            : false;
    // check for the optional feilds

    var firstName =
        typeof data.payload.firstName == 'string' &&
        data.payload.firstName.trim().length > 0
            ? data.payload.firstName.trim()
            : false;
    var lastName =
        typeof data.payload.lastName == 'string' &&
        data.payload.lastName.trim().length > 0
            ? data.payload.lastName.trim()
            : false;
    var password =
        typeof data.payload.password == 'string' &&
        data.payload.password.trim().length > 0
            ? data.payload.password.trim()
            : false;

    // error if the phone is valid in all cases
    if (phone) {
        if (firstName || lastName || password) {
            _data.read('users', phone, function(error, userData) {
                if (!error && userData) {
                    // update the required feilds
                    if (firstName) {
                        userData.firstName = firstName;
                    }
                    if (lastName) {
                        userData.lastName = lastName;
                    }
                    if (password) {
                        userData.password = password;
                    }
                    // store the updated object
                    _data.update('users', phone, userData, function(error) {
                        if (!error) {
                            callback(200);
                        } else {
                            console.log(error);
                            callback(500, {
                                error: 'could not update the user',
                            });
                        }
                    });
                } else {
                    callback(400, { error: 'specified user does not exist' });
                }
            });
        } else {
            callback(400, { error: 'missing feilds to update ' });
        }
    } else {
        callback(400, { error: 'missing required feilds' });
    }
};
// delete users
handlers._users.delete = function(data, callback) {
    //    check that the phone number provided is valid
    var phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length == 10
            ? data.queryStringObject.phone.trim()
            : false;
    if (phone) {
        _data.read('users', phone, function(error, data) {
            if (!error && data) {
                _data.delete('users', phone, function(error) {
                    if (!error) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'could not delete the specified user',
                        });
                    }
                });
            } else {
                callback(400, { error: 'could not find the specified user' });
            }
        });
    } else {
        callback(400, {
            Error: 'Missing required feilds',
        });
    }
};

//export the handlers

module.exports = handlers;
