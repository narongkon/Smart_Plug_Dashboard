module.exports = function(app){
    var controller = require('../controllers/type_device.controller')
    app.get('/',controller.list)
    // app.post('/',controller.insert)
    // app.put('/',controller.edit)
    // app.delete('/',controller.delete)
}