let r = require('rethinkdb')
let mqtt = require('mqtt')
let conDB
r.connect(
  { host: 'rdb.codeunbug.com', port: 28015, user: "admin", password: "next@2017", db: "smart_plug" }, function (err, conn) {
    if (err) throw err
    conDB = conn
  })

let options = {
  port: 10277,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  username: 'ovwnmwny',
  password: 'zERBTx4cWMeG',
}
let topic_mqtt = '64108168'
let client = mqtt.connect('mqtt://m10.cloudmqtt.com:10277', options);

function twoDigit(number) {
  return (number < 10 || number == 'a' || number == 'b' || number == 'c' || number == 'd' || number == 'e' || number == 'f' ? '0' : '') + number
}

function ascii_to_hex(str) {
  let mesArr = Array.prototype.slice.call(str, 0)
  let arr = []
  for (let i = 0; i < mesArr.length; i++) {
    let a = twoDigit(Number(mesArr[i]).toString(16))
    arr.push(a)
  }
  return arr
}

function hex_to_ascii(str1) {
  let hex = str1.toString()
  let str = ''
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
  return str  }

}

let ping_data = []
let mac_address
let topic_received
let plug_id
let volt
let amp
let power
let watt

function filter_data(data) {

  let hex = ascii_to_hex(data)

  mac_address = ""

  for (let i = 2; i < 10; i++) {
    mac_address += hex[i]
    i != 9 ? mac_address += "-" : ""
  }

  topic_received = hex[10]

  switch (topic_received) {
    case "a5":
      console.log('Filter (A5)')
      plug_id = hex[11]
      status_plug = Number(hex[12])
      break;
    case "a6":
      console.log('Filter (A6)')
      plug_id = hex[11]
      status_plug = Number(hex[12])
      console.log('Status Plug:', status_plug)
      break;
    case "a7":
      console.log('Filter (A7)')
      volt = "", amp = "", power = "", watt = ""
      plug_id = hex[11]

      for (let i = 13; i < 21; i++) {
        volt += hex_to_ascii(hex[i])
      }
      for (let i = 22; i < 30; i++) {
        amp += hex_to_ascii(hex[i])
      }
      for (let i = 31; i < 39; i++) {
        power += hex_to_ascii(hex[i])
      }
      for (let i = 40; i < 48; i++) {
        watt += hex_to_ascii(hex[i])
      }

      volt = parseFloat(volt)
      amp = parseFloat(amp)
      power = parseFloat(power)
      watt = parseFloat(watt)
      console.log('Volt:', volt, ' Amp:', amp, ' Power:', power, ' Watt:', watt)
      break;
  }
}

function a1_state() {
  r.table('list').filter({ mac_address: mac_address }).count()
    .run(conDB)
    .then((result) => {
      if (result == 0) {

        r.table('list').insert({
          location_name: 'Unknown',
          mac_address: mac_address,
          status: 0,
          connect: 0,
          electricity: {
            volt: 0,
            amp: 0,
            power: 0,
            watt: 0
          }
        })
          .run(conDB)
          .then((result) => {
            console.log("Success add data (A1)")

            client.publish('front/' + topic_mqtt, "add", function () {
              console.log("Message is published (Front A1)");
            });

          })
          .catch((err) => {
            console.log(err);
          })

      } else {
        console.log("Duplicate data (A1)")
        console.log(mac_address);
        let mac_address_mqtt = mac_address.split('-')
        console.log(mac_address_mqtt);
        for (let x in mac_address_mqtt) {
          mac_address_mqtt[x] = '0x' + mac_address_mqtt[x]
        }

        let buf = new Buffer(mac_address_mqtt);
        let buf2 = new Buffer(['0x2A']);
        let newBuffer = Buffer.concat([buf, buf2]);
        client.publish(topic_mqtt, newBuffer, function () {
          console.log("Message is published (2A)");
        });
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

function a5_state() {
  r.table('list').getAll(mac_address, { index: 'mac_address' })
    .coerceTo('array')
    .run(conDB)
    .then((result) => {

      if (result != "") {

        r.table('list').getAll(mac_address, { index: 'mac_address' }).update({ status: status_plug })
          .run(conDB)
          .then((result) => {

            console.log("Success update status data (A5)");

            client.publish('front/' + topic_mqtt, "status/" + mac_address + "/" + status_plug, function () {
              console.log("Message is published (Front A5)");
            });

          })
          .catch((err) => {
            console.log(err);
          })
      } else {

      }

    })
    .catch((err) => {
      console.log(err);
    })
}

function a7_state() {
  r.table('list').getAll(mac_address, { index: 'mac_address' })
    .coerceTo('array')
    .run(conDB)
    .then((result) => {

      if (result != "") {
        r.table('list').getAll(mac_address, { index: 'mac_address' }).update({
          electricity: {
            volt: volt, amp: amp, power: power, watt: watt
          }
        })
          .run(conDB)
          .then((result) => {

            console.log("Success update electricity data (A7)");

            client.publish('front/' + topic_mqtt, "electricity/" + mac_address + "/" + volt + "/" + amp + "/" + power + "/" + watt, function () {
              console.log("Message is published (Front A7)");
            });

          })
          .catch((err) => {
            console.log(err);
          })

      } else {

      }

    })
    .catch((err) => {
      console.log(err);
    })
}

function state(topic) {

  let mac_address_mqtt = mac_address.split('-')

  for (let x in mac_address_mqtt) {
    mac_address_mqtt[x] = '0x' + mac_address_mqtt[x]
  }
  let buf = new Buffer(mac_address_mqtt);
  let buf2;

  switch (topic) {
    case "a1":
      console.log("State (A1)");
      a1_state();
      break;
    case "a4":
      a4_state();
      break;
    case "a5":
      console.log("State (A5)");
      a5_state();
      buf2 = new Buffer(['0x6A']);
      buf3 = new Buffer(['0x' + plug_id, '0x0' + status_plug])
      // console.log(status_plug, plug_id);
      newBuffer = Buffer.concat([buf, buf2, buf3]);
      client.publish(topic_mqtt, newBuffer, function () {
        console.log("Message is published (6A)");
      });
      break;
    case "a6":
      r.table('list').filter({ mac_address: mac_address }).update({ status: status_plug })
        .run(conDB)
        .then((result) => {
          client.publish('front/' + topic_mqtt, "add", function () {
            console.log("Message is published (A6)");
          });
        })
        .catch((err) => {
          res.status(500).send(err.message);
        })
      break;
    case "a7":
      console.log("State (A7)");
      a7_state();
      buf2 = new Buffer(['0x8A']);
      newBuffer = Buffer.concat([buf, buf2]);
      client.publish(topic_mqtt, newBuffer, function () {
        console.log("Message is published (8A)");
      });
      break;
  }
}

client.on('connect', function () { // When connected
  client.subscribe(topic_mqtt, function () {
    client.on('message', function (topic, message, packet) {
      console.log("Received '" + ascii_to_hex(message) + "' on '" + topic + "'");
      filter_data(message)
      state(topic_received)
    });
  });


  let flag = 0
  setInterval(function () {
    // console.log('SET 1')
    flag++
    if (flag == 1) {
      console.log('flag 1')
      r.table('list')
        .coerceTo('array')
        .run(conDB)
        .then((result) => {
          // console.log(result)
          ping_data = []
          for (var i = 0; i < result.length; i++) {
            // console.log(result[i])

            let mac_address = result[i].mac_address
            let mac_address_mqtt = mac_address.split('-')

            for (let x in mac_address_mqtt) {
              mac_address_mqtt[x] = '0x' + mac_address_mqtt[x]
            }

            let buf = new Buffer(mac_address_mqtt);
            let buf2 = new Buffer(['0x3A']);
            let newBuffer = Buffer.concat([buf, buf2]);
            client.publish(topic_mqtt, newBuffer, function () {
              console.log("Message is published (3A)");
            });

            ping_data[i] = {
              id: result[i].id,
              mac_address: result[i].mac_address,
              connect: false
            }
          }

        })

    } else if (flag == 2) {
      console.log('flag 2')
      console.log('ping_data', ping_data);
      let con_t = []
      let con_f = []
      for (var i in ping_data) {
        if (ping_data[i].connect == true) {
          con_t.push(ping_data[i].mac_address)
        } else {
          con_f.push(ping_data[i].mac_address)
        }
      }

      console.log('con t', con_t);
      r.table('list').getAll(r.args(con_t), { index: 'mac_address' })
        .update({ connect: true })
        .coerceTo('array')
        .run(conDB)
        .then((result) => {

          r.table('list').getAll(r.args(con_f), { index: 'mac_address' })
            .update({ connect: false })
            .coerceTo('array')
            .run(conDB)
            .then((result) => {
              client.publish('front/' + topic_mqtt, "add", function () {
                console.log("Message is published (Front A1)");
              });
            })
            
        })

      flag = 0
    }

  }, 15000);

});

exports.list = (req, res) => {
  const r = req.r;
  r.table('list')
    .run()
    .then(function (data) {
      res.json(data)
    })
}

exports.select = (req, res) => {
  const r = req.r;
  r.table('list').get(req.params.id)
    .run()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).send(err.message);
    })
}

exports.add = (req, res) => {
  const r = req.r;
  r.table('list').insert(req.body)
    .run()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).send(err.message);
    })
}

exports.edit = (req, res) => {
  const r = req.r;
  r.table('list').get(req.body.id)
    .update({ location_name: req.body.location_name })
    .run()
    .then((result) => {
      res.json(result);

      let mac_address_mqtt = req.body.mac_address.split('-')

      for (let x in mac_address_mqtt) {
        mac_address_mqtt[x] = '0x' + mac_address_mqtt[x]
      }

      let buf = new Buffer(mac_address_mqtt);
      let buf2 = new Buffer(['0x5A', '0x01', '0x' + req.body.status]);
      let newBuffer = Buffer.concat([buf, buf2]);
      client.publish(topic_mqtt, newBuffer, function () {
        console.log("Message is published (5A)");
      });

    })
    .catch((err) => {
      res.status(500).send(err.message);
    })
}

exports.del = (req, res) => {
  const r = req.r;
  r.table('list').get(req.params.id).delete()
    .run()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.status(500).send(err.message);
    })
}


exports.connect = (req, res) => {
  const r = req.r;
  r.table('list').get(req.body.id)
    .update({ connect: req.body.connect })
    .run()
    .then((result) => {
      res.json(result);

      let mac_address_mqtt = req.body.mac_address.split('-')

      for (let x in mac_address_mqtt) {
        mac_address_mqtt[x] = '0x' + mac_address_mqtt[x]
      }

      let buf = new Buffer(mac_address_mqtt);
      let buf2 = new Buffer(['0x2A']);
      let newBuffer = Buffer.concat([buf, buf2]);
      client.publish(topic_mqtt, newBuffer, function () {
        console.log("Message is published (2A)");
      });

    })
    .catch((err) => {
      res.status(500).send(err.message);
    })
}