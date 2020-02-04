/*
create abs export configuration variables
*/

//container for all the environments

var environments = {};

//Staging(default) environment

environments.staging = {
    "port": 3000,
    "envName":"staging"
};

// production Environment
environments.production = {
    "port": 5000,
    "envName":"production"
};


// Determine which environment is passed as a command line argument
var currentEnvironment = typeof (process.env.NODE_ENV) == "string" ? process.env.NODE_ENV.toLowerCase() : "";
// Check that the current environment is one of the environments above else default to staging
var environmentToExport = typeof (environments[currentEnvironment]) == "object" ? environments[currentEnvironment] : environments.staging;

//Export the module
module.exports = environmentToExport;