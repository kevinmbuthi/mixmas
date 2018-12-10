var fs = require('fs');

var app = {},
    DefaultTTL = 2500,
    LogInformationList = [],
    LogAnimationTimeElapsed = true,
    lastInnerEle,
    ShuffleOn = false,
    LoopOn = false;
    rendered = false;
    meta = [];

app.DEFAULTS = {
    playerDefaults: {
        VOLUME: 0.01,
        REPEAT: true,
        SHUFFLE: false
    }
}

app.shuffle = true;
app.repeat = false;

/** 
 * @desc "play next" context menu
 */
function createContextMenuItem(id) {}
function updateContextMenuItem(id) {}
function removeContextMenuItem(id) {}

/**
 * @desc set next track on context menu click event
 */
function setNextTrack() {}

/** 
 * @desc show the next log
 */
function PlayNextAnimation() {
    if (LogInformationList.length >= 1) {
        LogAnimationTimeElapsed = true;
        var nextLogInformation = LogInformationList.shift();
        $LogInfo(nextLogInformation.dataInfo, nextLogInformation.delay, nextLogInformation.ttl);
    } else { LogAnimationTimeElapsed = true; }
}

// Remove static data from memory
app.AutoRefresh = function () {}
app.Refresh = function () {}

/**
 * @desc keeps the application useble incase of errors .
 */
app.onError = function (ErrorDet) {
    console.log('%c App Error [ ' + ErrorDet.type + ' ]' + ErrorDet, 'color:red; font-size:14px; font-weight:bold');
}

/** 
 * @returns {boolean} Whether the application was installed
 */
app.wasInstalled = function () {
    return appStore.getMeta();
}

/**
 * @desc  App information logging
 * @param {string} logTxt infomation to be logged
 * @param {Number} delay time in miliseconds before animation is triggered
 * @param {Number} ttl how long the log should be seen
 */
var LogAnimation = function (logTxt, delay, ttl) {
    if (logTxt) {
        if (LogAnimationTimeElapsed) {
            if (logTxt.length > 50) logTxt = logTxt.substr(0, 50) + " ...";
            
                $(".preloader-overlayGradient small").text(logTxt);
                
                var lastLog = $("#info2").text();
                $("#info2").text("");
                lastInnerEle = document.createElement("span");
                lastInnerEle.innerHTML = lastLog;
                var currentInnerEle = document.createElement("span");
                currentInnerEle.innerHTML = logTxt;
                currentInnerEle.setAttribute("class", "info2");
                LogAnimationTimeElapsed = false;
                
                ttl = (ttl) ? ttl : DefaultTTL;
                setTimeout(function () { PlayNextAnimation(); }, ttl);
                
                if (delay) {
                    setTimeout(function () {
                        $($(".info1")).remove();
                        $($(".info2"))
                        .removeClass("info2")
                        .append(lastInnerEle)
                        .addClass("info1");
                        $("#info").append(currentInnerEle);
                        $($(".info1 span")).addClass("info_content");
                    }, delay);
                } else {
                    setTimeout(function () { PlayNextAnimation(); }, ttl);
                    $($(".info1")).remove();
                    $($(".info2"))
                    .removeClass("info2")
                    .append(lastInnerEle)
                    .addClass("info1");
                    $("#info").append(currentInnerEle);
                    $($(".info1 span")).addClass("info_content");
                }
            }
        } else {
        LogInformationList.push({ dataInfo: logTxt, delay: delay, ttl: ttl }); 
    }
}

/**
 * @desc log important application activity
 */
app.log = function (msgObj) {
    // type    -> error,info
    // code    -> (code) if error
    // message -> log text
    // date    -> current date
    msgObj.date = appStore.today();
    var log = `${msgObj.type}]-${msgObj.code}-${msgObj.message}`;
    // TODO: Write the application log file 
}

// TODO: Separate the application executions and the player executions
app.setPlaybackModes = function () {
    var loopState = $('#RepeatToggle span').text() == 1;
    LoopOn = (loopState) ? "track" : false || ($RepeatToggle[0].attributes[1].value.search("RepeatToggle-On") >= 0);
    ShuffleOn = ($ShuffleToggle[0].attributes[1].value.search("ShuffleToggle-On") >= 0);
},

app.showPreloader = function () {
    toggleNotification = true;
    $("#main-view").attr("class", "loading");
    $("#desktopFooterWrapper").attr("class", "loading");
    $(".preloaderWrap-closed").attr("class", "preloaderWrap-open");
    $(".preloader-closed").attr("class", "preloadep-open");
}

/**
 * @desc Basic app configurations
 */
app.setup = function () {
    console.log("%c Setup called !", "color: lime;");
    app.showPreloader();

    $playNob = $($.find("#play"));
    $previousNob = $($("#preTrack"));
    $nextNob = $($("#nextTrack"));
    $activeSong = $(".songTitle");
    $volCtrl = $("#volumeRange")[0],
    $LogInfo = LogAnimation;
    $volumeRange = $("#volumeRange");
    $staticFiles = $("#diskMusic");
    $searchBar = $(".searchBar");
    $searchBarIcon = $("#SearchToggle span:before");
    $SearchToggle = $("#SearchToggle");
    $RepeatToggle = $("#RepeatToggle");
    $ShuffleToggle = $("#ShuffleToggle");
    $EqualizerControl = $("#EqualizerControl");
    $VolumeControl = $("#VolumeControl");
    $MetaLog = $(".metalog");
    $cHrs = $("#timeLeft hrs");
    $cMins = $("#timeLeft mins");
    $cSecs = $("#timeLeft secs");
    $dHrs = $("#SongDuration hrs");
    $dMins = $("#SongDuration mins");
    $dSecs = $("#SongDuration secs");
    $closeBtn = $("#Close");
    $minimizeBtn = $("#Minimize");
    $musicTab = $("div.left-side ul li:nth-child(1)");
    $playlistTab = $("div.left-side ul li:nth-child(2)");
    $videoTab = $("div.left-side ul li:nth-child(5)");
    $hoverSlide = $(".hoverSlide");
    $videoPlayer = $("#videPlayer")[0];
    $progressWrap = $("span#trackProgress-base.trackProgress-base");
    $progress = $("svg#progress")[0];
}

onload = app.setup();
