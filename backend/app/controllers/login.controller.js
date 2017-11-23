exports.check = (req, res) => {
    const r = req.r;
    // console.log(req.query);
    r.table('users')
        .getAll([req.query.user, r.uuid(req.query.password)], { index: 'userAndPassword' })
        .run()
        .then((result) => {
            // console.log('result', result);
            return res.json(result);
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })
}
