function twoDigit(data) {
    return (data < 10 || data == 'a' || data == 'b' || data == 'c' || data == 'd' || data == 'e' || data == 'f' ? '0' : '') + data
}

exports.ascii_to_hex = (data) => {
    var mesArr = Array.prototype.slice.call(data, 0)
    var arr = []
    for (var i = 0; i < mesArr.length; i++) {
        var a = twoDigit(Number(mesArr[i]).toString(16))
        arr.push(a)
    }
    return arr
}

exports.hex_to_ascii = (data) => {
    var hex = data.toString()
    var str = ''
    for (var n = 0; n < hex.length; n += 2) {
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
        return str
    }
}
