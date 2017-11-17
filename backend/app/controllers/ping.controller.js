var client = require('../mqtt/config').connect()

var flag = 0    // flag = 0 (ส่ง Ping (ฺBroadcast)) และ flag = 1 (บันทึกค่า Device ที่ตอบ Ping)
var mac_ping = []   // mac_ping เก็บค่า Mac Address ที่ทำการ Ping ((ฺBroadcast) เพื่อตรวจสอบและบันทึกค่า

// Ping ((ฺBroadcast) [หน่วงเวลา 5 วินาที]
setInterval(function () {
    if (flag == 0) {
        r.table('plug')
            .coerceTo('array')
            .run()
            .then((result) => {
                mac_ping = []
                for (var index = 0; index < result.length; index++) {
                    var element = result[index];
                    var j = 0, k = 1, array = []
                    for (var i = 0; i < 8; i++) {
                        array[i] = '0x' + String(result[index].mac_address[j]) + String(result[index].mac_address[k])
                        j = j + 2
                        k = k + 2
                    }
                    var buf = new Buffer(array);
                    var buf2 = new Buffer(['0x3A']);
                    var newBuffer = Buffer.concat([buf, buf2]);
                    client.publish(result[index].mac_address_gateway, newBuffer);
                    mac_ping.push({ mac_address: result[index].mac_address, status: 0 })
                }
            })

        flag++;
    }
}, 5000)

// บันทึกค่า Device ที่ตอบ Ping [หน่วงเวลา 30 วินาที]
setInterval(function () {
    if (flag == 1) {
        var mac_off = []
        var mac_on = []
        for (var index = 0; index < mac_ping.length; index++) {
            if (mac_ping[index].status == 0) {
                mac_off.push(mac_ping[index].mac_address)
            } else {
                mac_on.push(mac_ping[index].mac_address)
            }
        }
        r.table('plug')
            .getAll(r.args(mac_on), { index: 'mac_address' })
            .update({ connect: 1 })
            .run()
            .then((result) => {
                r.table('plug')
                    .getAll(r.args(mac_off), { index: 'mac_address' })
                    .update({ connect: 0 })
                    .run()
                    .then((result) => {

                    })
            })
        flag = 0;
    }
}, 30000)

// รับค่าจาก Device Topic A4 เพื่อแก้ไขค่าใน Mac_Ping
exports.A4 = (req, res) => {
    for (var index = 0; index < mac_ping.length; index++) {
        if (mac_ping[index].mac_address == req.mac_address) {
            mac_ping[index].status = 1
        }
    }
}