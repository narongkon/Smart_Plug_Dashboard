exports.list = (req, res) => {
    const r = req.r;
    var tb = r.table('list')
    if (req.query.hasOwnProperty('id')) {
        tb = tb.get(req.query.id)
    }
    tb.then(function (data) {
        return res.json(data)
    }).catch((err) => {
        return res.status(500).send(err.message);
    })
}

exports.edit = (req, res) => {
    const r = req.r;
    r.table('list')
        .get(req.body.id)
        .update(req.body)
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}