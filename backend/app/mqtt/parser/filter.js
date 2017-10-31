var f = require('./function')

exports.filter = (data) => {

    var callback = ""
    var mac_address = ""
    var hex = f.ascii_to_hex(data.message)
    var topic = hex[10]

    for (var i = 2; i < 10; i++) {
        mac_address += hex[i]
    }

    switch (topic) {
        case "a1":
            callback = {
                topic: topic,
                data: {
                    location_name: "Unknown",
                    mac_address: mac_address,
                    mac_address_gateway: data.topic,
                    status: 0,
                    join: 0,
                    electricity: {
                        amp: 0,
                        power: 0,
                        volt: 0,
                        watt: 0
                    }
                }
            }
            return callback
            break
        case "a4":
            callback = {
                topic: topic,
                data: {
                    mac_address: mac_address,
                    mac_address_gateway: data.topic
                }
            }
            return callback
            break
        case "a5":
            callback = {
                topic: topic,
                data: {
                    mac_address: mac_address,
                    status: Number(hex[12])
                }
            }
            return callback
            break
        case "a6":
            callback = {
                topic: topic,
                data: {
                    mac_address: mac_address,
                    status: Number(hex[12])
                }
            }
            return callback
            break
        case "a7":
            var volt = ""
            var amp = ""
            var power = ""
            var watt = ""
            for (var i = 13; i < 21; i++) {
                volt += f.hex_to_ascii(hex[i])
            }
            for (var i = 22; i < 30; i++) {
                amp += f.hex_to_ascii(hex[i])
            }
            for (var i = 31; i < 39; i++) {
                power += f.hex_to_ascii(hex[i])
            }
            for (var i = 40; i < 48; i++) {
                watt += f.hex_to_ascii(hex[i])
            }

            callback = {
                topic: topic,
                data: {
                    mac_address: mac_address,
                    electricity: {
                        volt: parseFloat(volt),
                        amp: parseFloat(amp),
                        power: parseFloat(power),
                        watt: parseFloat(watt)
                    }
                }
            }
            return callback
            break
    }
}