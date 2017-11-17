var client = require('../mqtt/config').connect()

function mac_address_to_buffer(data) {
    var j = 0, k = 1, array = []
    for (var i = 0; i < 8; i++) {
        array[i] = '0x' + String(data[j]) + String(data[k])
        j = j + 2
        k = k + 2
    }
    return array
}

exports.A1 = (req, res) => {
    r.table('plug')
        .getAll(req.mac_address, { index: 'mac_address' })
        .run()
        .then((result) => {
            if (result == "") {
                // INSERT
                r.table('plug')
                    .insert(req)
                    .without('mac_address')
                    .run()
                    .then((result) => {

                    })

            } else {
                // EDIT
                r.table('plug')
                    .getAll(req.mac_address, { index: 'mac_address' })
                    .filter({ join: 1 })
                    .update({ connect: 1 })
                    .run()
                    .then((result) => {
                        if (result.replaced == 1 || result.unchanged == 1) {
                            var buf = new Buffer(mac_address_to_buffer(req.mac_address));
                            var buf2 = new Buffer(['0x2A']);
                            var newBuffer = Buffer.concat([buf, buf2]);
                            client.publish(req.mac_address_gateway, newBuffer);
                        }
                    })
            }
        })
}

exports.A5 = (req, res) => {
    r.table('plug')
        .getAll(req.mac_address, { index: 'mac_address' })
        .update(req)
        .without('mac_address')
        .run()
        .then((result) => {

        })
}

exports.A6 = (req, res) => {
    r.table('plug')
        .getAll(req.mac_address, { index: 'mac_address' })
        .update(req)
        .without('mac_address')
        .run()
        .then((result) => {

        })
}

exports.A7 = (req, res) => {
    r.table('plug')
        .getAll(req.mac_address, { index: 'mac_address' })
        .update(req)
        .without('mac_address')
        .run()
        .then((result) => {

        })
}




