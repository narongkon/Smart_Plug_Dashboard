var r = require('rethinkdb')
var client = require('./config').connect()
var db = require('./db').connect()
var parser = require('../mqtt/parser/packet').packet
var conDB

var f = require('./parser/function')

r.connect({
    host: 'rdb.codeunbug.com',
    port: 28015, user: "admin",
    password: "next@2017",
    db: "smart_plug"
}, function (err, conn) {
    if (err) throw err
    conDB = conn
})

// Subscribe MQTT ตามข้อมูลใน DB [smart_plug] Table [gateway]
function subscribe() {
    r.table('gateway')
        .pluck('mac_address')
        .merge(function (m) { return m('mac_address') })
        .coerceTo('array')
        .run(conDB)
        .then((result) => {
            var array = result
            for (var index = 0; index < array.length; index++) {
                client.subscribe(array[index]);
            }

        })
}

// ฟังก์ชั่นสั่งการ Subscribe เพื่มเมื่อมีข้อมูลใน DB [smart_plug] Table [gateway] เพิ่มใหม่
exports.subscribe = (req, res) => {
    subscribe();
    return true
}

// ฟังชั้นสั่งสั่งการ Subscribe ในตอนแรกเมื่อ MQTT พร้อมใช้งาน
client.on('connect', function () {
    subscribe()
});

// ฟังก์ชั้นรับ Message จากหัวข้อที่ได้ทำการ Subscribe ไว้
client.on('message', function (topic, message, packet) {
    console.log("Received '" + f.ascii_to_hex(message) + "' on '" + topic + "'");   // แสดงข้อมูล Message
    var data = {
        topic: topic,
        message: message
    }   // แพ็คเกตข้อมูลเพื่อส่งไปทำการ Parser

    parser(data)    // ส่งข้อมูลที่แพ็คเกตไปให้ฟังก์ชั่น Parser
});

