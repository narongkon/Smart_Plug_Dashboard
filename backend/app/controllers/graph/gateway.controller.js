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
    var date = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).toString()
    var yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }).toString()
    var lastweek = new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }).toString()

    // console.log('Date', format(date));
    // console.log('Yesterday', format(yesterday));
    // console.log('Lastweek', format(lastweek));

    r.table('plug_logger')
        .getAll(req.query.gateway, { index: 'gateway_id' })
        .filter(r.row('timestamp').date().eq(r.ISO8601('2017-11-17T01:01:01+07:00').date())
            .or(r.row('timestamp').date().eq(r.ISO8601('2017-11-16T01:01:01+07:00').date())
                .or(r.row('timestamp').date().eq(r.ISO8601('2017-11-10T01:01:01+07:00').date())))
        )
        .merge(function (m) {
            return {
                timestamp: m('timestamp').toISO8601(),
                now: m('timestamp').date().eq(r.ISO8601('2017-11-17T01:01:01+07:00').date()),
                yesterday: m('timestamp').date().eq(r.ISO8601('2017-11-16T01:01:01+07:00').date()),
                lastweek: m('timestamp').date().eq(r.ISO8601('2017-11-10T01:01:01+07:00').date())
            }
        })
        .then(function (data) {
            return res.json(data)
        })
        .catch((err) => {
            return res.status(500).send(err.message);
        })


    // .filter(r.row('timestamp').during(r.ISO8601(format(lastweek)), r.ISO8601(format(date))))
    // .merge(function (m) {
    //     var a = m('timestamp').toISO8601().split('T').bracket(0);
    //     var b = m('timestamp').toISO8601().split('T').bracket(1).split('+').bracket(0).split('.').bracket(0);
    //     var c = { date: a, time: b };
    //     return {
    //         new_timestamp: c
    //     }
    // })


    //     .merge(
    //     function (m) {
    //         return {
    //             t: m('timestamp').date().eq(r.now().),
    //             now: m('timestamp').date().eq(r.now().date()),
    //             last: m('timestamp').date().eq(r.ISO8601('2017-11-14T01:01:01+07:00').date()),

    //         }
    //     }
    //     ).pluck('now', 'last', 't')


}