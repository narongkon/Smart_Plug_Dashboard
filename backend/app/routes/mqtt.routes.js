module.exports = function (app) {
    var controller = require('../mqtt/subscribe')
    app.get('/', controller.subscribe)
}