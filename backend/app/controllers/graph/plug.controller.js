function format(data) {

    var date = data.split(" ");
    var str = date[0]
    var time = date[1];

    str = str.split('/');
    str2 = time.split(':');
    var month = parseInt(str[0]);
    var day = parseInt(str[1]);
    var year = parseInt(str[2]);

    if (str2[0] < 10) {
        time = '0' + time
    }
    var formattedDate = year + '-' + month + '-' + day + 'T' + time + '+07:00';

    return formattedDate
}

exports.list = (req, res) => {
    const r = req.r;
    var date = new Date(new Date().getTime()).toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).toString()
    var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).toString()
    var lastweek = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)).toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).toString()

    r.table('plug_logger')
        .getAll(req.query.plug, { index: 'plug_id' })
        .filter(r.row('timestamp').date().eq(r.ISO8601(format(date)).date())
            .or(r.row('timestamp').date().eq(r.ISO8601(format(yesterday)).date())
                .or(r.row('timestamp').date().eq(r.ISO8601(format(lastweek)).date())))
        )
        .merge(function (m) {
            return {
                timestamp: m('timestamp').toISO8601(),
                now: m('timestamp').date().eq(r.ISO8601(format(date)).date()),
                yesterday: m('timestamp').date().eq(r.ISO8601(format(yesterday)).date()),
                lastweek: m('timestamp').date().eq(r.ISO8601(format(lastweek)).date())
            }
        })
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })

}