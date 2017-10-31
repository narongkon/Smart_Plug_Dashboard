var mqtt_controller = require('../../controllers/mqtt.controller')
var ping_controller = require('../../controllers/ping.controller')

exports.state = (data) => {
    // console.log("State", data);
    if (data == undefined) {
        data = {
            topic: 0
        }
    }
    switch (data.topic) {
        case "a1":
            mqtt_controller.A1(data.data)
            break;
        case "a4":
            ping_controller.A4(data.data)
        case "a5":
            mqtt_controller.A5(data.data)
            break;
        case "a6":
            mqtt_controller.A6(data.data)
            break;
        case "a7":
            mqtt_controller.A7(data.data)
            break;
        default:
            break
    }




}