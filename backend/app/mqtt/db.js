exports.connect = () => {
    var r = require('rethinkdb')
    var conDB
    r.connect({
        host: 'rdb.codeunbug.com',
        port: 28015, user: "admin",
        password: "next@2017",
        db: "smart_plug"
    }, function (err, conn) {
        if (err) throw err
        conDB = conn
        return conDB
    })
}