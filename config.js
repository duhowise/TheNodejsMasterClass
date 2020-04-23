//@ts-check

/*
create abs export configuration variables
*/

//container for all the environments

var environments = {};

//Staging(default) environment

environments.staging = {
    httpPort: 3000,
    httpsPort: 3001,
    envName: 'staging',
    hashingSecret: 'thisIsASecret',
};

// production Environment
environments.production = {
    httpPort: 5000,
    httpsPort: 5001,
    envName: 'production',
    hashingSecret: 'thisIsASecret',
};

// Determine which environment is passed as a command line argument
var currentEnvironment =
    typeof process.env.NODE_ENV == 'string'
        ? process.env.NODE_ENV.toLowerCase()
        : '';
// Check that the current environment is one of the environments above else default to staging
var environmentToExport =
    typeof environments[currentEnvironment] == 'object'
        ? environments[currentEnvironment]
        : environments.staging;

//Export the module
module.exports = environmentToExport;
