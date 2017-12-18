var options = require('./../config/config').config.mqtt
var mqtt = require('mqtt')
var client = mqtt.connect(options.host, options)
class nylonMqtt {
    
    constructor() {
        
    }

    client() {
        return client
    }
}

module.exports = new nylonMqtt;


