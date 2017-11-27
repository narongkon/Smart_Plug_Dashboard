module.exports = function (app) {
    var controller = require('../controllers/user.controller')
    app.post('/', controller.insert)
    app.put('/', controller.edit)
}

