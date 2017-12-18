var options = require('./../config/config').config.database
r = require('rethinkdbdash')(options)

class nylonDatabase {
    constructor() {
        
    }

    connect() {
        return r
    }

}
module.exports = new nylonDatabase;


