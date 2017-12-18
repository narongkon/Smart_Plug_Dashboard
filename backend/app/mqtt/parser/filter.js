let f = require('./../function/function')

class filter {
    constructor() {

    }

    filter(topic, massage) {

        let device_mac_address = topic.split("/")[0];
        let hex = f.ascii_to_hex(massage)
        let type = hex[0]
        let device_type = hex[1]
        let service_length = parseInt(hex[2], 16)
        let service = []
        // console.log(service_length, typeof (service_length));

        for (let index = 3; index < service_length + 3; index++) {
            service.push(hex[index])
        }

        let data = {
            device_mac_address,
            type,
            device_type,
            service_length,
            service
        }
        
        return data

    }

}
module.exports = new filter;


