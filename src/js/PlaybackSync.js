
var fs = require('fs');
var FileAPI = require('file-api');
var File = FileAPI.File;
var FileList = FileAPI.FileList;
var FileReader = FileAPI.FileReader;
const parentSize =  $progressWrap[0].scrollWidth;

var playbackSync = {

    defaultPoster: function () {
        return document.createElement('img');
    },

    /** @returns {Number} - DomUpdate rate depending on playback rate . */
    progressBarUpdateRate: function (duration) {
        if (!duration.hours <= 0) {
            if (duration.minutes >= 0) {
                if (duration.seconds > 0) {
                    return 0;
                } else {
                    return 25;
                }
            } else {
                return 50;
            }
        } else {
            return 100;
        }
    },

    updateProgressBar: function (currentTime, duration) {
        // TODO: Try using a different element for animating the progressbar 
        currentTime = (currentTime - ((pauseOffset + initialTime + 1)) + seekOffset) < 0 ?
               (currentTime - ((pauseOffset + initialTime + 1)) + seekOffset) * - 1 :
               (currentTime - ((pauseOffset + initialTime + 1)) + seekOffset);
        if (currentTime > duration) { return; }
        if (currentTime != undefined) {
            if (!this.timeOutOfRange(MetaHelper.durationConverter(currentTime, "seconds"), "seconds")) {
                var timePixelRatio = (currentTime / duration) * parentSize;
                $progress.style.width = timePixelRatio + "px";
            } else {
                clearInterval(progressBarInterval);
            }
        } else if (player.state == "stopped") {
            $("section#trackProgress-wrap")[0].style.width = 0 + "px";
        }
    },

    updateTime: function () {
        if (CurrentTrack.time.secs + 1 >= 60) {
            CurrentTrack.time.secs = (CurrentTrack.time.secs + 1) - 60;
            if (CurrentTrack.time.mins + 1 >= 60) {
                CurrentTrack.time.mins = (CurrentTrack.time.mins + 1) - 60;
                CurrentTrack.time.hrs = CurrentTrack.time.hrs + 1;
            } else {
                CurrentTrack.time.mins = CurrentTrack.time.mins + 1;
            }
        } else {
            CurrentTrack.time.secs = CurrentTrack.time.secs + 1;
        }
    },

    updateProgress: function (time, duration) {
        if (time != undefined) {
            if (aContxt && bufferSource) {
                if (aContxt.currentTime - (pauseOffset + initialTime + 1) > (bufferSource.buffer.duration ) &&
                            player.state != "playing" && player.state != "paused" ||
                                    player.state == "stopped") { clearInterval(progressTimeInterval); }
            }

            this.updateTime();

            if (duration.hours < 1) { duration.hours = false; }

            if (!this.timeOutOfRange(CurrentTrack.time.secs, "seconds") &&
                !this.timeOutOfRange(CurrentTrack.time.mins, "minutes") &&
                !this.timeOutOfRange(CurrentTrack.time.hrs, "hours") ) {

                if (duration.hours > 0) {

                    $($cHrs[0]).text((CurrentTrack.time.hrs <= 9 && CurrentTrack.time.hrs >= 0) ? '0' + CurrentTrack.time.hrs + " : " : CurrentTrack.time.hrs + " : ");
                    $($cMins[0]).text((CurrentTrack.time.hrs) <= 9 || CurrentTrack.time.mins == 0 ? '0' + CurrentTrack.time.mins : CurrentTrack.time.mins);
                    $($cSecs[0]).text((CurrentTrack.time.secs) <= 9 || 0 ? "0" + CurrentTrack.time.secs : CurrentTrack.time.secs);

                } else {

                    $($cMins[0]).text(parseInt(CurrentTrack.time.mins));
                    $($cSecs[0]).text((CurrentTrack.time.secs) <= 9 || 0 ? "0" + CurrentTrack.time.secs : CurrentTrack.time.secs);

                }
            } else {
                clearInterval(progressTimeInterval);
            }
        } else if (player.state == "stopped") {
            $($cHrs[0]).text("");
            $($cMins[0]).text(0);
            $($cSecs[0]).text("00");
        }
    },

    timeOutOfRange: function (time, period) {
        if (CurrentTrack && period && CurrentTrack.duration && CurrentTrack.duration != null) {
            if (parseInt(time > 0)) {
                switch (period) {
                    case "hours": return !(CurrentTrack.duration[period] << 0 < parseInt(time)); break;
                    case "minues": return !(CurrentTrack.duration[period] << 0 < parseInt(time)); break;
                    case "seconds": return !(CurrentTrack.duration[period] << 0 < parseInt(time)); break;
                }
            } else {
                return false;
            }
        }
    },

    /** @desc - overal progress update . */
    // TODO: Debug this progresbar , it has memory problems check what changed before we renamed the object to playbackSync 
    PlaybackProgressBar: function (currentTime, duration) {
        if (currentTime != undefined) {
            if (duration && typeof duration != "object") {
                duration = {
                    hours: MetaHelper.durationConverter(duration, 'hours'),
                    minutes: (MetaHelper.durationConverter(duration, 'hours') <= 0) ?
                        parseInt(MetaHelper.durationConverter(duration, 'minutes')) :
                             "0" + MetaHelper.durationConverter(duration, 'minutes'),
                    seconds: MetaHelper.durationConverter(duration, 'seconds')
                };
            } else {
                duration = CurrentTrack.duration;
            }
            if (duration.minutes >= 60) { duration.minutes = ("0" + (duration.minutes - 60)).toString() }
            if (duration.seconds >= 60) { duration.seconds = ("0" + (duration.seconds - 60)).toString() }
            // Reset the track progress time .
            CurrentTrack.start = "00 : 00 : 00";
            CurrentTrack.end = duration.hours + " : " + duration.minutes + " : " + duration.seconds;

            if (CurrentTrack.time.secs == null) {
                $($cHrs[0]).text("");
                $($cMins[0]).text("0");
                $($cSecs[0]).text("00");
            }

            progressBarInterval = setInterval(function () {
                if (player.state != "stopped" || player.state == "paused" || player.state == "playing") {
                    if (aContxt && aContxt.state != "closed") {
                        if (bufferSource && aContxt) {
                            playbackSync.updateProgressBar(aContxt.currentTime, bufferSource.buffer.duration);
                        }
                    } else {
                        var currentTime = $videoPlayer.currentTime;
                        var duration = $videoPlayer.duration;
                        playbackSync.updateProgressBar(currentTime, duration);
                    }
                } else {
                    clearInterval(progressBarInterval);
                }
            }, this.progressBarUpdateRate(duration));

            progressTimeInterval = setInterval(function () {
                $($dHrs[0]).text((duration.hours > 0) ? duration.hours + " : " : "");
                $($dMins[0]).text(duration.minutes);
                $($dSecs[0]).text(duration.seconds);
                if (player.state != "stopped" && player.state == "playing") {
                    if (aContxt && aContxt.state != "closed") {
                        playbackSync.updateProgress(CurrentTrack.time, duration);
                     } else {
                        playbackSync.updateProgress(CurrentTrack.time, duration);
                     }
                } else {
                    clearInterval(progressTimeInterval);
                }
            }, 1000);
        } else {
            if (player.state == "paused" || player.state == "playing") {
                clearInterval(progressBarInterval);
                clearInterval(progressTimeInterval);
            } else if (player.state == "stopped" || player.state == "initial") {
                clearInterval(progressBarInterval);
                clearInterval(progressTimeInterval);
                this.updateProgress();
                this.updateProgressBar();
            }
        }
    },

    resetTracktDetailsVisuals: function () {
        $($("#musicName"))
					.text("")
					.show()
					.text(MetaHelper.parseFileName(CurrentTrack.name).trimEntity(45));
        $($("#musicAlbum"))
                    .text("")
                    .show()
                    .text(CurrentTrack.album.trimEntity(17));
        $(".timeLeft").show();
        $(".SongDuration").show();

        player.state = "playing";

        $playNob
    			.removeClass('playTrack')
    			.addClass("pauseTrack");
    },

    ResetPlayback: function () {
        aContxt = null;
        playbackSync.PlaybackProgressBar();
        aContxt = new AudioContext();
    },

    changeVolume: function (volVal) {
        if (player.state && player.state !== "paused" && bufferSource && aContxt) {
            if (volVal && !undefined)
                volume = volVal;
                gainNode.gain.value = volVal;
        }
    },

    /** @desc - Sets the current playing tracking details  */
    SetCurrentTrack: function (title, index) {
        CurrentTrack = new Object({
            name: meta[index].name,
            title: meta[index].title.trimEntity(45),
            artist: meta[index].artist[0].trimEntity(17),
            album: meta[index].album.trimEntity(17),
            artwork: meta[index].artwork,
            start: null,
            end: null,
            time: {
                hrs: 0,
                mins: 0,
                secs: 0
            },
            duration: null,
            lastStartTime: null,
            index: index,
            size: null,
            playbackPosition: 0
        });
    },

    /** @returns {Number} - next track index - used while playback is not playing . */
    setNextTrack: function (index) {
        var lastIndex = index || SetCurrentTrack.index;
        if (bufferSource == null) {
            if (!ShuffleOn) {
                nextPlaybackIndex.push(parseInt(preTrackIndex[preTrackIndex.length] + 1));
            } else {
                var nextIndex = Math.floor(Math.random() * meta.length - 1);
                if (lastIndex != undefined && nextIndex == lastIndex) {
                    this.setNextTrack(lastIndex);
                } else {
                    nextPlaybackIndex.push(nextIndex);
                }
            }
        } else {
            if (!ShuffleOn) {
                nextPlaybackIndex.push(parseInt(preTrackIndex[0] + 1));
            } else {
                var nextIndex = Math.floor(Math.random() * meta.length - 1);
                if (lastIndex != undefined && nextIndex == lastIndex) {
                    this.setNextTrack(lastIndex);
                } else {
                    nextPlaybackIndex.push(nextIndex);
                }
            }
        }
    },

    /** @returns {Number} track index to be played next */
    getNextTrack: function (index) {
        var trackIndex;
        lastIndex = (function () {
            if (index == undefined) {
                if (CurrentTrack != null) {
                    return CurrentTrack.index;
                } else {
                    return undefined;
                }
            } else {
                return index;
            }
        })()
        if (nextPlaybackIndex.length > 0) {
            return nextPlaybackIndex.shift();
        } else if (ShuffleOn) {
            trackIndex = Math.floor(Math.random() * meta.length - 1);
            if (lastIndex != undefined && trackIndex == lastIndex) {
                this.setNextTrack(lastIndex);
            } else {
                return trackIndex;
            }
        } else {
            if (preTrackIndex.length > 0) {
                if (ShuffleOn) {
                    trackIndex = Math.floor(Math.random() * meta.length - 1);
                    if (lastIndex != undefined && trackIndex == lastIndex) {
                        this.setNextTrack(lastIndex);
                    } else {
                        return trackIndex;
                    }
                } else {
                    if (parseInt(preTrackIndex[preTrackIndex.length - 1]) + 1 > meta.length - 1) {
                        return 0;
                    } else {
                        var pre = parseInt(preTrackIndex[preTrackIndex.length - 1]);
                        trackIndex = handlers.nextTrackFromTrackList(pre);                        
                        if (lastIndex != undefined && trackIndex == lastIndex) {
                            this.setNextTrack();
                        } else {
                            return trackIndex;
                        }
                    }
                }
            } else {
                if (ShuffleOn) {
                    trackIndex = Math.floor(Math.random() * meta.length - 1);
                    if (lastIndex != undefined && trackIndex == lastIndex) {
                        this.setNextTrack(lastIndex);
                    } else {
                        return trackIndex;
                    }
                } else {
                    return 0;
                }
            }
        }
    },

    bufferReady: false,
    togglePlaybackTimeout: false,

    loadTrack: function (event) {
        if (playbackSync.videoPlaying()) {
            handlers.togglePlaybackControls();
            handlers.toggleVideoPlayer();
        } else {
            if (player && player.state === "playing" || player.state == "paused") {
                //<debug>
                // @bug - rapid playback toggle from user interaction causes bugs to happen .
                // Test how long it takes to toggle a playback and test if the bug to rapid user
                // interaction still exist.
                // I think this bug is only on windows because it works fine on mac .
                //</debug>
                console.time("[Playback Toggle]");
                clearTimeout(this.togglePlaybackTimeout);
                this.togglePlaybackTimeout = setTimeout(playbackSync.togglePlayback, 1000);
                console.timeEnd("[Playback Toggle]");
            } else {
                if (meta.length > 0) {

                    var nextTrack = playbackSync.getNextTrack();

                    handlers.toggleActiveTrack(nextTrack);

                    Buffering = true;

                    $("#inputIndex").val(nextTrack);

                    preTrackIndex.push(parseInt(nextTrack));

                    playbackSync.SetCurrentTrack(meta[nextTrack].name, nextTrack);
                    playbackSync.EndAudioPlayback(false);
                    playbackSync.resetTracktDetailsVisuals();
                    playbackSync.Play(nextTrack);

                    player.state = "playing";
                }
            }
        }
    },

    loadNextTrack: function (nextTrack) {
        if (player.state === "stopped" && preTrackIndex.length > 0) {
            if (Buffering) return;
            handlers.toggleActiveTrack(nextTrack);
            Buffering = true;
            
            preTrackIndex.push(parseInt(nextTrack));
            playbackSync.EndAudioPlayback(false);
            playbackSync.resetTracktDetailsVisuals();
            playbackSync.SetCurrentTrack(meta[nextTrack].name, nextTrack);
            playbackSync.SetDefaultPosterImage();
            playbackSync.Play(nextTrack);
        } else {
            if (!nextPlaybackIndex.length > 0) {
                playbackSync.setNextTrack(nextTrack);
            }
        }
    },

    loadPreviousTrack: function (selectedTrackIndex) {
        if (Buffering || preTrackIndex.length === 1 || preTrackIndex.length === 0 ||
             CurrentTrack.name == meta[preTrackIndex[preTrackIndex.length - 1]].name) { return; }
        if (player.state === "playing" && player.state != "paused" && preTrackIndex.length > 0) {
            handlers.toggleActiveTrack(selectedTrackIndex);
            Buffering = true;
            var previousTrackIndex = (preTrackIndex == 1) ? selectedTrackIndex : selectedTrackIndex;

            preTrackIndex.push(parseInt(previousTrackIndex));
            playbackSync.SetCurrentTrack(meta[previousTrackIndex].name, previousTrackIndex);
            playbackSync.EndAudioPlayback(true);
            playbackSync.resetTracktDetailsVisuals();
            playbackSync.SetDefaultPosterImage();
            playbackSync.Play(previousTrackIndex);
        } else {
            previousPlaybackIndex = (preTrackIndex.length > 0) ? preTrackIndex.pop() : null;
        }
    },

    virtualize: (analyser) => oVirtualize(analyser),

    AttachPlayer: function (index, ele) {
        if (Buffering) { return; }
        Buffering = true;

        if (ele) { playbackSync.SetCurrentTrack(ele) }
        else { playbackSync.SetCurrentTrack(meta[index].name, index) }

        $('#inputIndex').val(index);

        playbackSync.Play(index);
    },

    HardReset: function () {
        playbackSync.SoftReset("video");
        playbackSync.SoftReset("audio", false);
    },

    SoftReset: function (type, controlled) {
        if (type == "video") {

            handlers.resetMusicDetailsVisuals();

            Buffering = false;

            $videoPlayer.src = "null";

            $($videoPlayer).show();

            $videoPlayer.backgroundSize = "200px";
            $videoPlayer.backgroundPosition = "280px 100px";
            $videoPlayer.background = "url(../icons/clapboard-icon.png) no-repeat";

        } else {
            if (aContxt && aContxt.state != "closed") { aContxt.close(); }

            // stop gracefully
            workerNode = null;
            analyser = null;
            bufferSource = null;
            gainNode = null;
            aContxt = null;

            if (controlled) { return; }

            // Reset the Track progress
            startTime = 0;
            pauseTime = 0;
            pauseOffset = 0;
            startOffset = 0;
            seekOffset = 0;
            initialTime = 0;

            CurrentTrack.lastStartTime = 0;

            playbackSync.PlaybackProgressBar();

            handlers.resetMusicDetailsVisuals();

            Buffering = false;
        }
    },

    EndVideoPlayback: function (ev) {
        if (bufferSource != undefined && aContxt != undefined
  			             && bufferSource != null && aContxt != null &&
  									                 !($videoPlayer.loop)) {
            console.log('%c video ended !', 'color:red');
            $videoPlayer.loop = false;
            if (player.state == "paused" || player.state == "playing") {
                processor.end();
                playbackSync.PlaybackProgressBar();
                handlers.togglePlaybackControls();
                playbackSync.HardReset();
            } else {
                processor.end();
                playbackSync.PlaybackProgressBar();
                playbackSync.EndAudioPlayback(true);
                playbackSync.SoftReset("video");
            }
        } else {
            if (typeof ev == "undefined") {
                playbackSync.PlaybackProgressBar();
                handlers.resetMusicDetailsVisuals();
                playbackSync.SoftReset("video");
            } else {
                playbackSync.PlaybackProgressBar();
                handlers.resetMusicDetailsVisuals();
                playbackSync.HardReset();
                playbackSync.AutoPlay();
            }
        }
    },

    SetDefaultPosterImage: function () {
        $videoPlayer.background = "url(../icons/clapboard-icon.png) no-repeat";
        $videoPlayer.backgroundSize = "200px";
        $videoPlayer.backgroundPosition = "280px 100px";
    },

    // NOTE: vidio playbacks execution is done by the handler
    PauseVideoPlayback: function () {
        console.time("[video toggleplayback]");
        playbackSync.PlaybackProgressBar();
        handlers.togglePlaybackControls();
        console.time("[video toggleplayback]");
    },

    PlayVideoPlayback: function (current, duration) {
        console.time("[video toggleplayback]");
        if (typeof current != "object") {
            playbackSync.PlaybackProgressBar(current, duration);
            handlers.togglePlaybackControls();
        } else {
            handlers.togglePlaybackControls();
        }
        console.time("[video toggleplayback]");
    },

    setVideoPlaybackDetails: function () {
        var duration = $videoPlayer.duration;
        var currentTime = $videoPlayer.currentTime;

        CurrentTrack.duration = duration;

        playbackSync.resetTracktDetailsVisuals();
        playbackSync.PlaybackProgressBar(currentTime, duration);
    },

    VideoPlayback: function (file, index , video) {
        // playbackSync.HardReset();

        preTrackIndex.push(parseInt(index || preTrackIndex[preTrackIndex.length - 1]));

        $($videoPlayer).show();

        video ? $($($videoTab)).click(): null
        
        $videoPlayer.controls = false;
        $videoPlayer.onended = playbackSync.EndVideoPlayback;
        $videoPlayer.onplay = playbackSync.PlayVideoPlayback;
        $videoPlayer.onpause = playbackSync.PauseVideoPlayback;
        $videoPlayer.src = `file:///${file.path}`;// URL.createobjecturl();

        handlers.togglePlaybackControls();

        $($videoPlayer).volume = handlers.convertVolumeVal($volumeRange.val());

        this.SetCurrentTrack(MetaHelper.parseFileName(file.name), index);
        handlers.togglePlaybackControls();
        $videoPlayer.oncanplaythrough = this.setVideoPlaybackDetails;
        Buffering = false;
    },

    resetPlaybackPOS: function () {
        initialTime = 0;
        pauseTime = 0;
        startOffset = 0;
        seekOffset = 0;
    },

    /** @desc -  set time where to start playback from */
    setPlaybackPOS: function () {},

    changeTrackCurrentTime: function (time) {
        CurrentTrack.time.hrs = parseInt(MetaHelper.durationConverter(time, "hours"));
        CurrentTrack.time.mins = parseInt(MetaHelper.durationConverter(time, "minutes"));
        CurrentTrack.time.secs = parseInt(MetaHelper.durationConverter(time, "seconds"));
    },

    ControlledPlayback: function (time) {
        if (player.state != "stopped" && !Buffering) {

            playbackSync.PlaybackProgressBar();

            if (playbackSync.videoPlaying()) {
                $videoPlayer.currentTime = time;

                playbackSync.changeTrackCurrentTime(time);

            } else {
                var currentTime = aContxt.currentTime;
                player.state = false;
                seekOffset = time;
                startTime = seekOffset;

                playbackSync.setPlaybackPOS(time);

                start = time;
                bufferSource.stop(0);

                playbackSync.EndAudioPlayback(true);

                seekOffset = seekOffset > currentTime ? seekOffset: seekOffset * -1;

                processor.start();

                playbackSync.changeTrackCurrentTime(time);

                start = null;
                player.state = "playing";
            }
        }
    },

    resetQueue: function () {
        this.Queue.__proto__.track = undefined;
        this.Queue.__proto__.next = undefined;
    },

    Queue: function (index, direction) {
        this.Queue.__proto__.track = parseInt(index);
        this.Queue.__proto__.next = direction == "next" ? true : false;
    },

    ResolvePlaybackQueue: function () {
        if (playbackSync.Queue.next) {
            player = new Player("stopped", meta[playbackSync.Queue.track].source, Player.DEFAULTS.REPEAT, Player.DEFAULTS.SHUFFLE, Player.DEFAULTS.VOLUME);
            player.loadNextTrack(playbackSync.Queue.track);
            playbackSync.resetQueue();
        } else {
            player = new Player("stopped", playbackSync.Queue.track, Player.DEFAULTS.REPEAT, Player.DEFAULTS.SHUFFLE, Player.DEFAULTS.VOLUME);
            player.loadPreviousTrack(playbackSync.Queue.track);
            playbackSync.resetQueue();
        }
    },

    IsFirstQueue: function () {
        playbackSync.Queue.track == undefined;
    },

    RequestPlayback: function (index, direction) {
        if (index != undefined && !Buffering) {
            if (!(playbackSync.IsFirstQueue())) { clearTimeout(self.queueTimeout) }
            if (direction == "next") { preTrackIndex.push(index); }

            playbackSync.SetCurrentTrack(meta[index].name, index);
            playbackSync.resetTracktDetailsVisuals();

            this.Queue(index, direction);

            self.queueTimeout = setTimeout(playbackSync.ResolvePlaybackQueue, 3500);
        }
    },

    videoPlaying: function () {
        return !($videoPlayer.src.search(/\/null/) >= 0);
    },

    AudioPlayback: function (rawBuffer) {
        processor.InitializePlayback(rawBuffer);
    },

    togglePlayback: function () {
        if (player.state != "paused" && player.state != "stopped") {

            // NOTE: Pause function checks if its playing and progressbar checks if its paused .
            playbackSync.Pause();

            player.state = "paused";

            playbackSync.PlaybackProgressBar();

            handlers.togglePlaybackControls();

            $LogInfo("Paused", 0, null);
        } else {
            // pauseOffset = aContxt.currentTime - pauseTime;

            playbackSync.Play();

            player.state = "playing";

            handlers.togglePlaybackControls();

            $LogInfo("Playing", 0, null);
        }
    },

    Pause: function () {

        this.setPlaybackPOS();

        pauseTime = aContxt.currentTime;

        // NOTE: We have to keep track of the buffer position even if we seek.
        startTime = (aContxt.currentTime - initialTime) + seekOffset;

        CurrentTrack.playbackPosition = aContxt.currentTime - initialTime;

        bufferSource.stop(0);

        console.log("%c Pause time[ " + startTime + " ]", "color:green");
    },

    Play: function (index) {
        if (index != undefined) {
            var IsVideo = meta[index].name.isVideo();
            playbackSync.PlaybackProgressBar();
            playbackSync.resetTracktDetailsVisuals();
            handlers.toggleActiveTrack(index);
            console.info("Reading ...");
            var file = new File(meta[index].path);
            playbackSync.VideoPlayback(file, index, IsVideo);
        } else {
            processor.start();
        }
    },
    
    /** @param {boolean} - Whether the playback end involved user interaction or an error . */
    EndAudioPlayback: function (controlled) {
        if (typeof controlled != undefined && bufferSource && aContxt) {
            if (bufferSource.buffer.duration <
                    ((aContxt.currentTime - (pauseOffset + initialTime+ 1)+1) + seekOffset) &&
                                        (player.state == "playing" || player.state != "paused")) {
                if (bufferSource) { bufferSource.stop(0); }

                previouslyPaused = false;
                Buffering = false;

                playbackSync.PlaybackProgressBar();
                playbackSync.SoftReset("audio", controlled);

                if (controlled) return;

                handlers.resetMusicDetailsVisuals();

                this.AutoPlay();
            }
        }
    },


    AutoPlay: function () {
        if (typeof LoopOn == "string") {
            if (aContxt && aContxt.state == "running") { processor.end() }

            handlers.togglePlaybackControls();

            playbackSync.PlaybackProgressBar();
            playbackSync.HardReset();

            Player.prototype.AttachPlayer(parseInt(preTrackIndex[preTrackIndex.length - 1]));

        } else {
            if (nextPlaybackIndex.length > 0) {
                if (aContxt && aContxt.state == "running"){ processor.end() }

                var nextTrack = nextPlaybackIndex.shift();

                playbackSync.PlaybackProgressBar();
                playbackSync.HardReset();

                handlers.togglePlaybackControls();
                handlers.toggleActiveTrack(nextTrack);

                Player.prototype.AttachPlayer(nextTrack);

            } else {
                if (LoopOn == true) {
                    if (aContxt && aContxt.state == "running"){ processor.end() }
                    $LogInfo("Playing next track . ", 0, null);
                    var nextTrack;
                    if (!ShuffleOn) {
                        if (parseInt(preTrackIndex[preTrackIndex.length - 1]) >= meta.length - 1) {

                            nextTrack = 0;
                            preTrackIndex = [];

                        } else {
                            nextTrack = parseInt(preTrackIndex[preTrackIndex.length - 1]) + 1;
                        }
                    } else {
                        nextTrack = Math.floor(Math.random() * meta.length - 1);
                    }

                    playbackSync.HardReset();
                    playbackSync.PlaybackProgressBar();

                    handlers.toggleActiveTrack(nextTrack);

                    preTrackIndex.push(nextTrack);

                    Player.prototype.AttachPlayer(nextTrack);

                } else {
                    if (aContxt && aContxt.state == "running") { processor.end() }
                    processor.end();
                    playbackSync.HardReset();
                    playbackSync.PlaybackProgressBar();
                    handlers.togglePlaybackControls();
                }
            }
        }
    }
};
