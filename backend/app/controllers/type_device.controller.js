exports.list = (req, res) => {
    const r = req.r;
    r.table('type_device')
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}