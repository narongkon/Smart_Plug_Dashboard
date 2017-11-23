module.exports = function(app){
    var controller = require('../../controllers/graph/plug.controller')
    app.get('/',controller.list)
}
