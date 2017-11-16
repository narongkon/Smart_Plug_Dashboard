module.exports = function (app) {
    var controller = require('../controllers/plug.controller')
    app.get('/', controller.list)
    app.put('/', controller.edit)
    app.put('/connect', controller.connect)
    app.delete('/', controller.delete)
}

