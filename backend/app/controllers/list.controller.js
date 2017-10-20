var r = require('rethinkdb')
var mqtt = require('mqtt')


var conDB
r.connect(
  { host: 'rdb.codeunbug.com', port: 28015, user: "admin", password: "next@2017", db: "smart_plug" }, function (err, conn) {
    if (err) throw err
    conDB = conn
  })

var options = {
  port: 10277,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: 'ovwnmwny',
  password: 'zERBTx4cWMeG',
}
var client = mqtt.connect('mqtt://m10.cloudmqtt.com:10277', options);

function twoDigit(number) {
  return (number < 10 || number == 'a' || number == 'b' || number == 'c' || number == 'd' || number == 'e' || number == 'f' ? '0' : '') + number
}

function ascii_to_hex(str) {
  var mesArr = Array.prototype.slice.call(str, 0)
  var arr = []
  for (var i = 0; i < mesArr.length; i++) {
    var a = twoDigit(Number(mesArr[i]).toString(16))
    arr.push(a)
  }
  return arr
}

function hex_to_ascii(str1) {
  var hex = str1.toString()
  var str = ''
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
    return str
  }
}

var ping_data = []
var mac_address
var mac_address_gateway
var topic_protocal
var plug_id
var volt
var amp
var power
var watt

function filter_data(data, topic) {

  var hex = ascii_to_hex(data)
  var mac = ""
  for (var i = 2; i < 10; i++) {
    mac += hex[i]
    // i != 9 ? mac += "-" : ""
  }
  mac_address = mac
  mac_address_gateway = topic
  topic_protocal = hex[10]

  switch (topic_protocal) {
    case "a5":
      // console.log('Filter (A5)')
      plug_id = hex[11]
      status_plug = Number(hex[12])
      break;
    case "a6":
      // console.log('Filter (A6)')
      plug_id = hex[11]
      status_plug = Number(hex[12])
      break;
    case "a7":
      // console.log('Filter (A7)')
      volt = "", amp = "", power = "", watt = ""
      plug_id = hex[11]
      for (var i = 13; i < 21; i++) {
        volt += hex_to_ascii(hex[i])
      }
      for (var i = 22; i < 30; i++) {
        amp += hex_to_ascii(hex[i])
      }
      for (var i = 31; i < 39; i++) {
        power += hex_to_ascii(hex[i])
      }
      for (var i = 40; i < 48; i++) {
        watt += hex_to_ascii(hex[i])
      }
      volt = parseFloat(volt)
      amp = parseFloat(amp)
      power = parseFloat(power)
      watt = parseFloat(watt)
      break;
  }
}
var flag_a1 = 0;
var flag_a1_1 = 0;
function a1_state() {

  r.table('list').filter({ mac_address: mac_address }).count()
    .run(conDB)
    .then((result) => {
      if (result == 0) {
        if (flag_a1 == 0) {
          flag_a1 = 1;
          console.log("Not Duplicate (A1)")
          r.table('list').insert({
            location_name: 'Unknown',
            mac_address: mac_address,
            mac_address_gateway: mac_address_gateway,
            status: 0,
            // connect: 0,
            electricity: {
              volt: 0,
              amp: 0,
              power: 0,
              watt: 0
            }
          })
            .run(conDB)
            .then((result) => {
              client.publish('front/' + mac_address_gateway, "add", function () {
                console.log("Message is published (Front A1)");
                flag_a1 = 0;
              });
            })
            .catch((err) => {
              console.log(err);
            })
        }

      } else {
        // console.log("Duplicate data (A1)")
        if (flag_a1_1 == 0) {
          flag_a1_1 = 0;
          r.table('list')
            .getAll(mac_address, { index: 'mac_address' })
            .filter(r.row('connect').eq(1).or(r.row('connect').eq(0)))
            .update({ connect: 1 })
            .run(conDB)
            .then((result) => {
              if (result.unchanged != 0) {

                var j = 0, k = 1, array = []
                for (var i = 0; i < 8; i++) {
                  array[i] = '0x' + String(mac_address[j]) + String(mac_address[k])
                  // console.log(req.body.mac_address[j], req.body.mac_address[k])
                  j = j + 2
                  k = k + 2
                }
                var buf = new Buffer(array);
                var buf2 = new Buffer(['0x2A']);
                var newBuffer = Buffer.concat([buf, buf2]);
                client.publish(mac_address_gateway, newBuffer, function () {
                  console.log("Message is published (2A)");
                  client.publish('front/' + mac_address_gateway, "connect/" + mac_address, function () {
                    console.log("Message is published (Front A1)");
                    flag_a1_1 = 0;
                  });
                });
              }
            })
            .catch((err) => {
              console.log(err);
            })
        }

      }
    })
    .catch((err) => {
      console.log(err);
    })
}

function a4_state() {
  console.log('State A4', mac_address);
  for (var i in ping_data) {
    if (ping_data[i].mac_address == mac_address) {
      ping_data[i].connect = true
    }
  }
}

var flag_a5 = 0;
function a5_state() {

  if (flag_a5 == 0) {
    flag_a5 = 1;
    r.table('list').getAll(mac_address, { index: 'mac_address' })
      .coerceTo('array')
      .run(conDB)
      .then((result) => {
        if (result != "") {
          r.table('list').getAll(mac_address, { index: 'mac_address' }).update({ status: status_plug })
            .run(conDB)
            .then((result) => {
              // console.log("Success update status data (A5)");
              client.publish('front/' + mac_address_gateway, "status/" + mac_address + "/" + status_plug, function () {
                // console.log("Message is published (Front A5)");
                flag_a5 = 0;
              });
            })
            .catch((err) => {
              console.log(err);
            })
        } else { }
      })
      .catch((err) => {
        console.log(err);
      })
  }

}

function a7_state() {
  r.table('list').getAll(mac_address, { index: 'mac_address' })
    .coerceTo('array')
    .run(conDB)
    .then((result) => {
      if (result != "") {
        r.table('list').getAll(mac_address, { index: 'mac_address' })
          .update({ electricity: { volt: volt, amp: amp, power: power, watt: watt } })
          .run(conDB)
          .then((result) => {
            // console.log("Success update electricity data (A7)");
            client.publish('front/' + mac_address_gateway, "electricity/" + mac_address + "/" + volt + "/" + amp + "/" + power + "/" + watt, function () {
              console.log("Message is published (Front A7)");
            });
          })
          .catch((err) => {
            console.log(err);
          })
      } else { }
    })
    .catch((err) => {
      console.log(err);
    })
}

function state(topic) {

  var j = 0, k = 1, array = []
  for (var i = 0; i < 8; i++) {
    array[i] = '0x' + String(mac_address[j]) + String(mac_address[k])
    j = j + 2
    k = k + 2
  }
  var buf = new Buffer(array);
  var buf2;
  switch (topic) {
    case "a1":
      // console.log("State (A1)");
      a1_state();
      break;
    case "a4":
      // console.log("State (A4)");
      a4_state();
      break;
    case "a5":
      // console.log("State (A5)");
      a5_state();
      buf2 = new Buffer(['0x6A']);
      buf3 = new Buffer(['0x' + plug_id, '0x0' + status_plug])
      newBuffer = Buffer.concat([buf, buf2, buf3]);
      client.publish(mac_address_gateway, newBuffer, function () {
        console.log("Message is published (6A)");
      });
      break;
    case "a6":
      // console.log("State (A6)");
      r.table('list').filter({ mac_address: mac_address }).update({ status: status_plug })
        .run(conDB)
        .then((result) => {
          client.publish('front/' + mac_address_gateway, "confirm_status", function () {
            // console.log("Message is published (Front A6)");
          });
        })
        .catch((err) => {
          res.status(500).send(err.message);
        })
      break;
    case "a7":
      // console.log("State (A7)");
      a7_state();
      buf2 = new Buffer(['0x8A']);
      newBuffer = Buffer.concat([buf, buf2]);
      client.publish(mac_address_gateway, newBuffer, function () {
        console.log("Message is published (8A)");
      });
      break;
  }
}

function subscribe() {
  // console.log('Function Subscribe')
  r.table('gateway')
    .pluck('mac_address')
    .merge(function (m) { return m('mac_address') })
    .coerceTo('array')
    .run(conDB)
    .then((result) => {
      // console.log(result)
      var array = result
      for (var index = 0; index < array.length; index++) {
        console.log('Subscribe Topic', array[index])
        client.subscribe(array[index]);
      }
    })
}

client.on('connect', function () { // When connected
  subscribe();
  client.on('message', function (topic, message, packet) {
    console.log("Received '" + ascii_to_hex(message) + "' on '" + topic + "'");
    filter_data(message, topic)
    state(topic_protocal)
  });
});

exports.subscribe = (req, res) => {
  subscribe();
  return res.json();
}
exports.list = (req, res) => {
  const r = req.r;
  var tb = r.table('list')
  if (req.query.hasOwnProperty('gateway')) {
    tb = tb.getAll(req.query.gateway, { index: 'mac_address_gateway' })
  } else if (req.query.hasOwnProperty('id')) {
    tb = tb.get(req.query.id)
  }
  tb.run()
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      return res.status(500).send(err.message);
    })
}
exports.select = (req, res) => {
  const r = req.r;
  r.table('list').get(req.params.id)
    .run()
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      return res.status(500).send(err.message);
    })
}
// exports.add = (req, res) => {
//   const r = req.r;
//   r.table('list')
//     .insert(req.body)
//     .run()
//     .then((result) => {
//       res.json(result);
//     })
//     .catch((err) => {
//       res.status(500).send(err.message);
//     })
// }
exports.edit = (req, res) => {
  const r = req.r;
  r.table('list')
    .get(req.body.id)
    .update({ location_name: req.body.location_name })
    .run()
    .then((result) => {
      var j = 0, k = 1, array = []
      for (var i = 0; i < 8; i++) {
        array[i] = '0x' + String(req.body.mac_address[j]) + String(req.body.mac_address[k])
        j = j + 2
        k = k + 2
      }
      var buf = new Buffer(array);
      var buf2 = new Buffer(['0x5A', '0x01', '0x' + req.body.status]);
      var newBuffer = Buffer.concat([buf, buf2]);
      client.publish(req.body.mac_address_gateway, newBuffer, function () {
        console.log("Message is published (5A)");
      });
      return res.json(result);
    })
    .catch((err) => {
      return res.status(500).send(err.message);
    })
}
exports.delete = (req, res) => {
  const r = req.r;
  r.table('list')
    .get(req.query.id)
    .delete()
    .run()
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      return res.status(500).send(err.message);
    })
}
exports.connect = (req, res) => {
  const r = req.r;
  var j = 0, k = 1, array = []
  for (var i = 0; i < 8; i++) {
    array[i] = '0x' + String(req.body.mac_address[j]) + String(req.body.mac_address[k])
    j = j + 2
    k = k + 2
  }

  r.table('list').get(req.body.id)
    .update({ connect: req.body.connect })
    .run()
    .then((result) => {
      //     var mac_address_mqtt = req.body.mac_address.split('-')
      //     for (var x in mac_address_mqtt) {
      //       mac_address_mqtt[x] = '0x' + mac_address_mqtt[x]
      //     }
      var buf = new Buffer(array);
      var buf2 = new Buffer(['0x2A']);
      var newBuffer = Buffer.concat([buf, buf2]);
      client.publish(req.body.mac_address_geteway, newBuffer, function () {
        console.log("Message is published (2A)");
      });
      return res.json(result);
    })
    .catch((err) => {
      return res.status(500).send(err.message);
    })
}
exports.send_ping = (req, res) => {
  const r = req.r;
  var tb = r.table('list')
  if (req.query.hasOwnProperty('gateway')) {
    tb = tb.getAll(req.query.gateway, { index: 'mac_address_gateway' })
    tb = tb.pluck('mac_address', 'mac_address_gateway')

  } else if (req.query.hasOwnProperty('id')) {
    tb = tb.get(req.query.id)
  }
  tb.run()
    .then((result) => {
      for (var x in result) {
        // console.log(result[x]);
        var j = 0, k = 1, array = []
        for (var i = 0; i < 8; i++) {
          array[i] = '0x' + String(result[x].mac_address[j]) + String(result[x].mac_address[k])
          j = j + 2
          k = k + 2
        }
        var buf = new Buffer(array);
        var buf2 = new Buffer(['0x3A']);
        var newBuffer = Buffer.concat([buf, buf2]);
        client.publish(result[x].mac_address_gateway, newBuffer, function () {

        });
      }
      return res.json(result);
    })
    .catch((err) => {
      return res.status(500).send(err.message);
    })
}
exports.update_ping = (req, res) => {
  const r = req.r;
  // console.log(req.body.con_t);
  r.table('list')
    .getAll(r.args(req.body.con_t))
    .update({ connect: 1 })
    .run()
    .then((result) => {
      r.table('list')
        .getAll(r.args(req.body.con_f))
        .update({ connect: 0 })
        .run()
        .then((result) => {
          return res.json(result);
        })
    })
}