module.exports = function(app){
    var controller = require('../../controllers/graph/gateway.controller')
    app.get('/',controller.list)
}
