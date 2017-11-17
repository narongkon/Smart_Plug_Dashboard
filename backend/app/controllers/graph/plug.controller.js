exports.list = (req, res) => {
    const r = req.r;
    r.table('plug_logger')
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}