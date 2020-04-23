//@ts-check
/**
 *
 * these are the request handlers
 */

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');

//define handlers
var handlers = {};

handlers.ping = function (data, callback) {
    callback(200);
};

//not found handler
handlers.notFound = function (data, callback) {
    callback(404);
};

// users handler

handlers.users = function (data, callback) {
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
handlers._users.post = function (data, callback) {
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
        _data.read('users', phone, function (error, data) {
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
                    _data.create('users', phone, userObject, function (error) {
                        if (!error) {
                            callback(200);
                            return;
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

handlers._users.get = function (data, callback) {
    //    check that the phone number provided is valid
    var phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length == 10
            ? data.queryStringObject.phone.trim()
            : false;
    var token =
        typeof data.headers.token == 'string' &&
        data.headers.token.trim().length == 20
            ? data.headers.token.trim()
            : false;
    handlers._tokens.verifyToken(token, phone, function (tokenVerified) {
        if (tokenVerified) {
            console.log('token :>> ', tokenVerified);
            if (phone) {
                _data.read('users', phone, function (error, data) {
                    if (!error && data) {
                        //remove the hashed password from the user object before returning it to the user
                        delete data.hashedPassword;
                        callback(200, data);
                        return;
                    } else {
                        callback(400, {
                            error:
                                'no user found for the specified phone number',
                        });
                    }
                });
            } else {
                callback(400, { Error: 'Missing required feilds' });
            }
        } else {
            callback(403, { error: 'missing token from request header' });
        }
    });
};

// put users
// required data: phone
// optional data: firstname, lastName,password(at least one must be specified)
handlers._users.put = function (data, callback) {
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
    var token =
        typeof data.headers.token == 'string' &&
        data.headers.token.trim().length == 20
            ? data.headers.token.trim()
            : false;
    handlers._tokens.verifyToken(token, phone, function (tokenVerified) {
        if (tokenVerified) {
            // error if the phone is valid in all cases
            if (phone) {
                if (firstName || lastName || password) {
                    _data.read('users', phone, function (error, userData) {
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
                            _data.update('users', phone, userData, function (
                                error
                            ) {
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
                            callback(400, {
                                error: 'specified user does not exist',
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'missing feilds to update ',
                    });
                }
            } else {
                callback(400, {
                    error: 'missing required feilds',
                });
            }
        } else {
            callback(403, {
                error: 'missing token fromrequest header or invalid token',
            });
        }
    });
};
// delete users
handlers._users.delete = function (data, callback) {
    //    check that the phone number provided is valid
    var phone =
        typeof data.queryStringObject.phone == 'string' &&
        data.queryStringObject.phone.trim().length == 10
            ? data.queryStringObject.phone.trim()
            : false;

    var token =
        typeof data.headers.token == 'string' &&
        data.headers.token.trim().length == 20
            ? data.headers.token.trim()
            : false;
    handlers._tokens.verifyToken(token, phone, function (tokenVerified) {
        if (tokenVerified) {
            if (phone) {
                _data.read('users', phone, function (error, data) {
                    if (!error && data) {
                        _data.delete('users', phone, function (error) {
                            if (!error) {
                                callback(200);
                            } else {
                                callback(500, {
                                    error:
                                        'could not delete the specified user',
                                });
                            }
                        });
                    } else {
                        callback(400, {
                            error: 'could not find the specified user',
                        });
                    }
                });
            } else {
                callback(400, {
                    Error: 'Missing required feilds',
                });
            }
        } else {
            callback(403, {
                error: 'missing token fromrequest header or invalid token',
            });
        }
    });
};

// Tokens handler

handlers.tokens = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405);
    }
};

// container for all tokens

handlers._tokens = {};
// required data:phone,password
// optional data:none
handlers._tokens.post = function (data, callback) {
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
    if (phone && password) {
        // lookup the user who matches that phone number
        _data.read('users', phone, function (error, userData) {
            if (!error && userData) {
                var hashedPassword = helpers.hash(password);
                // console.log('compare user', userData);
                if (hashedPassword == userData.hashedPassword) {
                    // if valid create a new token with a random name and set the expiry date for an hour in the future
                    var tokenId = helpers.createRandomString(20);
                    //add one hour
                    var expires = Date.now() + 360000;
                    var tokenObject = {
                        phone: phone,
                        id: tokenId,
                        expires: expires,
                    };

                    // store the token
                    _data.create('tokens', tokenId, tokenObject, function (
                        error
                    ) {
                        if (!error) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {
                                error: 'could not create new token',
                            });
                        }
                    });
                } else {
                    callback(400, { error: 'wrong username or password' });
                }
            } else {
                callback(400, { error: 'could not find the specified user' });
            }
        });
    } else {
        callback(400, { error: 'missing required feilds' });
    }
};

// required data:id
// optional data:none
handlers._tokens.get = function (data, callback) {
    var id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;
    if (id) {
        _data.read('tokens', id, function (error, tokenData) {
            if (!error && tokenData) {
                callback(200, tokenData);
                return;
            } else {
                callback(400, {
                    error: 'no user found for the specified phone number',
                });
            }
        });
    } else {
        callback(400, { Error: 'Missing required feilds' });
    }
};

// required data:Id,extend
// optional data:none
handlers._tokens.put = function (data, callback) {
    var id =
        typeof data.payload.id == 'string' &&
        data.payload.id.trim().length == 20
            ? data.payload.id.trim()
            : false;
    var extend =
        typeof data.payload.extend == 'boolean' && data.payload.extend == true
            ? data.payload.extend
            : false;

    console.log('id && extend1 :>> ', id, extend);

    if (id && extend) {
        console.log('id && extend2 :>> ', id, extend);

        // look up the token
        _data.read('tokens', id, function (error, tokenData) {
            if (!error && tokenData) {
                console.log('tokendata :>> ', tokenData);
                // check to ensure token isnt already expired
                if (tokenData.expires > Date.now()) {
                    // set new expiration to an hour from now
                    tokenData.expires = Date.now() + 36000;

                    // persist the updated token
                    _data.update('tokens', id, tokenData, function (error) {
                        if (!error) {
                            callback(200);
                        } else {
                            callback(500, { error: 'could not update token' });
                        }
                    });
                } else {
                    callback(400, {
                        error: 'expired tokens cannot be extended',
                    });
                }
            } else {
                callback(400, { error: 'specified token does not exist' });
            }
        });
    } else {
        callback(400, {
            error: 'missing required field(s) or required field(s) are invalid',
        });
    }
};
handlers._tokens.delete = function (data, callback) {
    //    check that the phone number provided is valid
    var id =
        typeof data.queryStringObject.id == 'string' &&
        data.queryStringObject.id.trim().length == 20
            ? data.queryStringObject.id.trim()
            : false;
    if (id) {
        _data.read('tokens', id, function (error, data) {
            if (!error && data) {
                _data.delete('tokens', id, function (error) {
                    if (!error) {
                        callback(200);
                    } else {
                        callback(500, {
                            error: 'could not delete the specified token',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'could not find the specified token',
                });
            }
        });
    } else {
        callback(400, {
            Error: 'Missing required feilds',
        });
    }
};

handlers._tokens.verifyToken = function (id, phone, callback) {
    //   lookup token
    _data.read('tokens', id, function (error, tokenData) {
        if (!error && tokenData) {
            console.log('token :>> ', tokenData, error);

            // check that the given token token is for the user and hasnt expired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};
//export the handlers

module.exports = handlers;
