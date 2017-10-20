module.exports = function (app) {
    var controller = require('../controllers/list.controller')
    app.get('/', controller.list)
    app.get('/ping', controller.send_ping)
    // app.post('/',controller.add)
    app.put('/', controller.edit)
    app.put('/ping', controller.update_ping)
    app.put('/connect', controller.connect)
    app.delete('/', controller.delete)
}

