var client = require('../mqtt/config').connect()

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

exports.edit = (req, res) => {
  const r = req.r;
  r.table('list')
    .get(req.body.id)
    .update({ location_name: req.body.location_name, status: req.body.status })
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
    .update({ connect: req.body.connect, join: 1 })
    .run()
    .then((result) => {
      var buf = new Buffer(array);
      var buf2 = new Buffer(['0x2A']);
      var newBuffer = Buffer.concat([buf, buf2]);
      client.publish(req.body.mac_address_gateway, newBuffer, function () {
        console.log("Message is published (2A)");
      });
      return res.json(result);
    })
    .catch((err) => {
      return res.status(500).send(err.message);
    })
}