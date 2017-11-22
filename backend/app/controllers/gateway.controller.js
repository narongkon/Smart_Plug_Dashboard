exports.list = (req, res) => {
    const r = req.r;
    var tb = r.table('gateway')
    if (req.query.hasOwnProperty('id')) {
        tb = tb.get(req.query.id)
    }
    tb.run()
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}

exports.all = (req, res) => {
    const r = req.r;
    r.table('gateway')
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}

exports.insert = (req, res) => {
    const r = req.r;
    r.table('gateway')
        .insert(req.body)
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
    r.table('gateway')
        .get(req.body.id)
        .update(req.body)
        .run()
        .then((result) => {
            return res.json(result);
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}

exports.delete = (req, res) => {
    const r = req.r;
    r.table('gateway')
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

