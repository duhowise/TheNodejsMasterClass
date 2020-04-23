//@ts-check

/* library for storing and editing data
 *
 *
 */

// dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');
// container for the module to be exported
var lib = {};

// base directory for the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = function (dir, file, data, callback) {
    // open the file for writing
    fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', function (
        error,
        fileDesriptor
    ) {
        if (!error && fileDesriptor) {
            // convert data to string
            var stringData = JSON.stringify(data);

            // write file and close it
            fs.writeFile(fileDesriptor, stringData, function (error) {
                if (!error) {
                    fs.close(fileDesriptor, function (error) {
                        if (!error) {
                            callback(false);
                        } else {
                            callback('Error clolsing file');
                        }
                    });
                } else {
                    callback('Error writing to new file');
                }
            });
        } else {
            callback('could not create new file, it may already exist');
        }
    });
};

lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf-8', function (
        error,
        data
    ) {
        if (!error && data) {
            var parsedData = helpers.parseJsonToObject(data);
            return callback(false, parsedData);
        } else {
            return callback(error, data);
        }
        callback(error, data);
    });
};

lib.update = function (dir, file, data, callback) {
    var path = lib.baseDir + dir + '/' + file + '.json';
    //open the file for writing
    fs.open(path, 'r+', function (error, fileDescriptor) {
        if (!error && fileDescriptor) {
            // convert the data to styring
            var stringData = JSON.stringify(data);

            // Truncate the file
            fs.truncate(path, fileDescriptor, function (error) {
                if (!error) {
                    fs.writeFile(fileDescriptor, stringData, function (error) {
                        if (!error) {
                            fs.close(fileDescriptor, function (error) {
                                if (!error) {
                                    callback(false);
                                } else {
                                    callback('Error closing existing file');
                                }
                            });
                        } else {
                            callback('Error writing to existing file');
                        }
                    });
                } else {
                    callback('Error truncating file');
                }
            });
        } else {
            callback(
                'Could not open file for updating, the file may not exist yet'
            );
        }
    });
};

lib.delete = function (directory, filename, callback) {
    // unlink the file

    fs.unlink(lib.baseDir + directory + '/' + filename + '.json', function (
        error
    ) {
        if (!error) {
            callback(false);
        } else {
            callback('Error deleting file');
        }
    });
};

// export the module
module.exports = lib;
