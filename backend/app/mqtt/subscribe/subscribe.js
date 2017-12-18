let client = require('./../app/mqtt').client()
let r = require('./../app/database').connect()
let f = require('./../function/function')
let parser = require('./../parser/packet').packet
// var f = require('./parser/function')

// subscribe()

// // Subscribe MQTT ตามข้อมูลใน DB [smart_plug] Table [gateway]
// function subscribe() {
// r.table('gateway')
//     .pluck('mac_address')
//     .merge(function (m) { return m('mac_address') })
//     .coerceTo('array')
//     .run()
//     .then((result) => {
//         var array = result
//         for (var index = 0; index < array.length; index++) {
//             client.subscribe(array[index]);
//         }
//     })
// }

// // ฟังก์ชั่นสั่งการ Subscribe เพื่มเมื่อมีข้อมูลใน DB [smart_plug] Table [gateway] เพิ่มใหม่
// exports.subscribe = (req, res) => {
//     subscribe();
//     return true
// }

// ฟังชั้นสั่งสั่งการ Subscribe ในตอนแรกเมื่อ MQTT พร้อมใช้งาน
client.on('connect', function () {
    client.subscribe('#');
});


// client.on('message', function (topic, message) {
//     console.log(topic, message.toString())
// })
// ฟังก์ชั้นรับ Message จากหัวข้อที่ได้ทำการ Subscribe ไว้
client.on('message', function (topic, message, packet) {

    // console.log('msg', message);
    // console.log("Received '" + f.ascii_to_hex(message) + "' on '" + topic + "'");   // แสดงข้อมูล Message
    let check = topic.split('/')[1]
    // let data = {
    //     topic: topic,
    //     message: message
    // }   // แพ็คเกตข้อมูลเพื่อส่งไปทำการ Parser
    if (check == 'pub') {
        console.log("Received '" + f.ascii_to_hex(message) + "' on '" + topic + "'"); 
        parser(topic, message)
    }


    // parser(data)    // ส่งข้อมูลที่แพ็คเกตไปให้ฟังก์ชั่น Parser
});

