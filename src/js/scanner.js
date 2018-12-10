
var fs = require('fs');
var FileAPI = require('file-api');
var File = FileAPI.File;
var FileList = FileAPI.FileList;
var FileReader = FileAPI.FileReader;
var mediaLibrary = require('media-library');
var isWin = process.env.HOME ? false : true;
var basePath = process.env.USERPROFILE || process.env.HOME;

// static 
var meta = [],
    newMeta = [],
    dir = [],
    fileArray = [],
    loadProgressInterval,
    fileLoadCheckerInterval,
    displayTrackInterval,
    metaCount = 0,
    ignoredTracks = 0,
    fetchMeta,
    SongNum = 0;

var scanner = {};
var supportedAudioAndVideoFormats =
    ["wave", "webm", "ogg", "mp3", "aac", "mkv", "wma", "aiff", "vlc", "vob", "webm", "ogg", "mp4", "mkv", "vob"];

function resetScanner() {
    fileArray = [];
    metaCount = 0;
    dir = [];
    newMeta = [];
}
// rendered tracks 
var renderedTracks = Function('return $(".songTitle").length');

/**
 * @desc Set event listeners
 */
function SetEventHandlers() {
    handlers.setSingleTrackListeners();
}

function setCustomScrollbar() {
    handlers.setCustomScrollbar();
}

function displayScanProgress(title) {
    $(".preloader-overlayGradient small").text(title.trimEntity(30));
}

function displayReadCount() {
    $("span.info2").text("Loading files ... " + (readProgress()) + "%");
    $(".preloader-overlayGradient small").text("Loading files ... " + (readProgress()) + "%");
}

function readProgress() {
    return parseFloat(((renderedTracks() - 1) / (meta.length - 1) * 100).toFixed(0));
}

function noMusicError() {
    resetScanner();
    ready = true;
    $LogInfo("No media files found , make sure you have music is the music and video directories.", 0, null);
}

function onScanError() {
    resetScanner();
    this.ready = true;
    $LogInfo("Error ! there was an problem reading the music directory , please check the log file.", 0, null);
}


/**
 * @desc Trim music details before display
 */
function trimTitle(meta) {
    var duration = "";
    var metaObj = meta;
    var title = metaObj.title.trimEntity(45);
    var album = metaObj.album.trimEntity(17);
    var artist = metaObj.artist.trimEntity(17);

    if (metaObj.duration != null || metaObj.duration != undefined) {
        if (metaObj.duration.hours > 0) {
            duration += metaObj.duration.hours + ":" + metaObj.duration.minutes + ":" + metaObj.duration.seconds;
        } else {
            duration += metaObj.duration.minutes + ":" + metaObj.duration.seconds;
        }
    } else { duration = "0:00"; }
    return {
        title: title,
        artist: artist,
        album: album,
        year: metaObj.year,
        duration: duration,
        index: metaObj.index
    };
}


/** 
 * @desc DOM inject with track info
 * @param {object} index track meta index
 */
function displayTrackList(args) {
    if (metaCount + 1 < meta.length - 1) {
        var MusicInfo = trimTitle(meta[metaCount]);
        var fullInfo = meta[metaCount];
        args === undefined ? null : MusicInfo.title = " ";
        $("tbody").append(
            '<tr row-index="' + SongNum + '" style="position: relative; padding-top: 40px;" id="wlistLinklist1_1" class="">' +
            '<td id="wlistLinklist1_1_1" data-count="' + SongNum + '" data-index="' + MusicInfo.index + '" class="colOne">' + SongNum + '</td>' +
            '<td id="wlistLinklist1_1_0" colspan="2" class="colTwo">' +
            '<a class="songTitle" data-trackIndex="' + MusicInfo.index + '" style="text-ecoration: none;" title="' + (fullInfo.title) + '">' + MusicInfo.title + '</a></td>' +
            '<td class="songArtist" id="wlistLinklist1_1_1" class="colThree" title="' + fullInfo.artist + '">' + MusicInfo.artist + '</td>' +
            '<td class="songAlbum" id="wlistLinklist1_1_commands" class="colFour" title="' + fullInfo.album + '">' + MusicInfo.album + '</td>' +
            '<td id="wlistLinklist1_1_1" class="colFive">' +
            '<span id="min">' + MusicInfo.duration + '</span>' +
            '</td>' +
            '</tr>');
        args === undefined ? Function('metaCount++;SongNum++')() : null;
    }
}

/**
 * @desc add new media files
 * @param {array} newMeta metadata
 */
function addMeta(newMeta) {
    newMeta.forEach(el => meta.push(el));
}

/**
 * @desc check when the files are fully loaded 
 */
function filesLoaded() {
    if (renderedTracks() === (meta.length - 1)) {
        $LogInfo("all done, Enjoy ! ", 0, null);
        clearInterval(loadProgressInterval);
        clearInterval(displayTrackInterval);
        clearInterval(fileLoadCheckerInterval);
        setCustomScrollbar();
        SetEventHandlers();
        resetScanner();
        this.ready = true;
    }
}

function renderTrackList() {
    fileLoadCheckerInterval = setInterval(filesLoaded, 500);
    loadProgressInterval = setInterval(displayReadCount, 50);
    displayTrackInterval = setInterval(displayTrackList, 100);
}

/**
 * @desc add media files
 */
function addGalleryMedia() {
    meta = fileArray; SongNum++;
    displayTrackList(null);
    handlers.crazyTabSwitch();
    handlers.hidePreloader();
    appStore.setMeta(meta);
    renderTrackList();
}

/**
 * @param {object} files media files
 */
function onScanFinish(files) {
    if (files.length > 0) {
        var durationInterval = setInterval(getDuration, 10);
        var index = 0,
            lastIndex = 0,
            ignoredTracksCount = 0,
            ignoredIntervals = 0,
            track = 0,
            time = 5000;
            
        function getDuration() {
            if (index === lastIndex || lastIndex === 0) {
                if (!(index + 1 > files.length - 1)) {
                    lastIndex = ++lastIndex;
                    track = files[index];
                    track.index = index;

                    var f = new File(track.path);

                    MetaHelper.getDurationFromBin(f, track, (metadata) => {
                        if (index != lastIndex) {
                            metadata.index = index - ignoredTracksCount;
                            fileArray.push(metadata);
                            displayScanProgress(metadata.title);
                            index = ++index;
                        }
                    })
                    
                } else {
                    ignoredTracks = ignoredTracksCount;
                    clearInterval(durationInterval);
                    addGalleryMedia(fileArray, files || []);
                }
            } else {
                if (ignoredIntervals < 1) {
                    ignoredIntervals = ++ignoredIntervals;
                    setTimeout(a => {
                        ignoredIntervals = 0;
                        if (index < lastIndex) {
                            index = ++index;
                            ignoredTracksCount = ++ignoredTracksCount;
                        }
                    }, time);
                } else {
                    ignoredIntervals = ++ignoredIntervals;
                }
            }
        }
    } else {
        noMusicError()
    }
}

scanner.fetchUpdates = function () {
    var updates = [];
    scanner.scan();
    return updates;
}

scanner.addGallery = function () { }
scanner.updateGallery = function () { }

function buildPath(base, gallery) {
    base = base.replace('\\', '\/');
    return `${base}\/${gallery}`;
}

/**
 * @returns {array} media files paths
 */
function mediaDirectories() {
    var paths = [];
    var galleries = ['music', 'videos/my music'];
    galleries.forEach(gallery => paths.push(buildPath(basePath, gallery)));
    return paths;
}

/**
 * @desc Scan disk for media files
 */
function scanMusicGallery() {
    // TODO: Scan both music and video directories.
    /*
        Error: MediaLibrary libary is having trouble listing out file of type (vob),
                we could try to debug it but something tells me it has nothing to do 
                with that type of file. Most likely has something to do with using 
                muiltiple directies or file size and file count. 
    */
    var musicGalleryPaths = mediaDirectories()[0];
    fs.readdir(musicGalleryPaths, (err, files) => {
        if (!err) {
            if (files.length > 0) {
                var library = new mediaLibrary({
                    paths: [musicGalleryPaths]
                });
                library.scan()
                    .on('track', (track) => {
                        track.name = track.path.replacePath()
                        track.stackSize = 0;
                        Promise.resolve(track);
                    })
                    .on('done', (all) => {
                        onScanFinish(all);
                    })
            } else {
                noMusicError()
            }
        } else {
            onScanError()
        }
    })
   
}

/**
 * @desc set metadata from storage
 */
function setMeta(data) {
    meta = data; SongNum++;
    displayTrackList(null);
    handlers.crazyTabSwitch();
    handlers.hidePreloader();
}

scanner.updateMeta = function (data) {
    appStore.updateMeta();
}

/**
 * @desc initialize disk scan
 */
scanner.scan = function () {
    app.wasInstalled().then((metadata) => {
        console.log('update scan');
        setMeta(metadata);
        renderTrackList();
    }).catch((er) => {
        if (er) {
            console.log('initial scan');
            console.error(er);
            resetScanner();
            scanMusicGallery();
        }
    })
}
