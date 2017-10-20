module.exports = function(app){
    var controller = require('../controllers/list.controller')
    app.get('/',controller.subscribe)
}