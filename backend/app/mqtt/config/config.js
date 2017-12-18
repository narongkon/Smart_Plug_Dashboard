var config = {
    database: {
        host: '127.0.0.1',
        port: 28015,
        db: "smart_plug"
    },
    mqtt: {
        host: 'mqtt://202.162.78.243:8883',
        port: 8883,
        clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
        username: 'test06',
        password: 'test;06'
    }
}
exports.config = config;