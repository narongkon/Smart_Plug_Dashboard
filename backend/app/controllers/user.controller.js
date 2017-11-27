exports.insert = (req, res) => {
    const r = req.r;
    r.table('user')
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
    r.table('user')
        .get(req.query.id)
        .update(req.body)
        .run()
        .then((result) => {
            return res.json(result);
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}

