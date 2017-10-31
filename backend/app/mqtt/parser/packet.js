var filter = require('./filter').filter
var state = require('../state/state').state

exports.packet = (data) => {
    // console.log("Packet", filter(data));
    state(filter(data))
}
