module.exports = function(app){
    var controller = require('../controllers/list.controller')
    app.get('/',controller.list)
    app.get('/:id',controller.select)
    app.post('/',controller.add)
    app.put('/',controller.edit)
    app.put('/connect',controller.connect)
    app.delete('/:id',controller.del)
}

