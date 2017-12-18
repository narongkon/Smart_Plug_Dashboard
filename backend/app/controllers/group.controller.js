exports.list = (req, res) => {
    const r = req.r;
    r.table('group')
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}

exports.insert = (req, res) => {
    const r = req.r;
    r.table('group')
        .insert(req.body)
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}