var filter = require('./filter').filter
var type_01 = require('./../state/type_01').type_01

exports.packet = (topic, message) => {

    var filter_data = filter(topic, message);

    switch (filter_data.type) {
        case '01':
            type_01(filter_data)
            break;
        case '02':

            break;

        default:
            break;
    }
}
