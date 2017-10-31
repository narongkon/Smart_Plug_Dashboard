exports.connect = () => {
    var mqtt = require('mqtt')
    var options = {
        port: 10277,
        clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
        username: 'ovwnmwny',
        password: 'zERBTx4cWMeG',
    }
    var client = mqtt.connect('mqtt://m10.cloudmqtt.com:10277', options)
    
    return client
}