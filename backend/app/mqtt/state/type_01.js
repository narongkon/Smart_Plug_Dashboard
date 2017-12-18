let r = require('./../app/database').connect()

exports.type_01 = (data) => {
    // console.log(data);
    let pac = {
        device_mac_address: data.device_mac_address,
        device_type: data.device_type,
        device_name: null,
        name: 'Unknown',
        service: []
    }
    // console.log(data.service);
    if (data.device_type == 'a1') {
        pac.device_name = 'Plug'
       
        for (let index = 0; index < data.service_length; index++) {

            if (data.service[index] == '01') {
                pac.service.push({
                    service_name: 'Ampere',
                    service_type: '01',
                    viriable_type: '00',
                    read_write: '00',
                    value: 0
                })
                // Object.assign(pac.service, [{
                //     service_name: 'Ampere',
                //     service_type: '01',
                //     read_write: '00',
                //     value: 0
                // }]);
            }
            else if (data.service[index] == '02') {
                pac.service.push({
                    service_name: 'Power',
                    service_type: '02',
                    viriable_type: '00',
                    read_write: '00',
                    value: 0
                })

            } else if (data.service[index] == '03') {
                pac.service.push({
                    service_name: 'Volt',
                    service_type: '03',
                    viriable_type: '00',
                    read_write: '00',
                    value: 0
                })
            } else if (data.service[index] == '04') {
                pac.service.push({
                    service_name: 'Watt',
                    service_type: '04',
                    viriable_type: '00',
                    read_write: '00',
                    value: 0
                })
            } else if (data.service[index] == '05') {
                pac.service.push({
                    service_name: 'On/Off',
                    service_type: '05',
                    viriable_type: '01',
                    read_write: '02',
                    value: 0
                })
            }

        }
    } else {

    }


    r.table('list')
        .getAll(pac.device_mac_address, { index: 'device_mac_address' })
        .run()
        .then((result) => {
            if (result == "") {
                insert(pac)
            }
            return result
        })
        .catch((err) => {
            return err.message
        })


    // console.log('packet', pac);
}


function insert(data) {
    r.table('list')
        .insert(data)
        .run()
        .then((result) => {
            return result
        })
        .catch((err) => {
            return err.message
        })
}