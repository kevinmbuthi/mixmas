
String.prototype.replacePath = function (withString) {
    var str = this.toString();
    var pathEx = /.*\/|.*\\/;
    if (str.search(pathEx) >= 0) {
        str = str.replace(pathEx.exec(str)[0], withString || "");
        return str;
    } else return str;
}

/**
 * @param {number} constraint string size limit
 */
String.prototype.trimEntity = function (constraint) {
    var str = this.toString();
    if (str.length > constraint) {
        return `${str.slice(0, constraint - 3)}...`;
    } else return str;
}

String.prototype.isVideo = function () {
    var str = this.toString();
    var videoExtensionsEx = /(.*)[.mp4|.webm|.ogg|.mkv|.vob]$/img;
    var containsEntity = str.search(videoExtensionsEx);
    return containsEntity >= 0 ? true : false
}
