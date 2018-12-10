
var timerSize;

/**
 * mouse & keyboard event handlers
 */
var handlers = {

    setAppStateListeners: function () {
        window.onresize = this.onWindowResize;
        $(".videoPlayerTabView div").on("click", function (event) {
            if (event.which == 1) {
                handlers.resizeWindow(event);
            }
        });
        $closeBtn.on("click", function (event) {
            console.log("Closing application window");
            window.close();
        });
    },

    onWindowResize: function (ev) {
        // ERROR: called twice when window is maximized .
        $("section#trackProgress-wrap").width = ev.currentTarget.outerWidth; // clientWidth
    },

    showSettingsModel : function (){},
    showInfoModal: function () {},
    hideInfoModal: function () {},
    
    hidePreloader: function () {
        toggleNotification = false;
        $('[data-main="content"]').removeClass('loading');
        $("#main-view").removeAttr("class");
        $("#desktopFooterWrapper").removeAttr("class");
        $(".preloaderWrap-open").attr("class", "preloaderWrap-closed");
        $(".preloader-open").attr("class", "preloadep-cloed");
    },

    setTimeController: function () {
        var lastPos = 0,
          	lastWidth = 0,
          	defaultWidth = 50;

        /** 
         * @returns {Number} convert mouse position to time using song duration 
         */
        function mousePosTimeRatio(pos) {
            if (CurrentTrack) {
                return ((100 * (pos / 970)) * CurrentTrack.duration / 100);
            }
        }

        function updateTimerTime(time) {
            $("#timeControl").text(time);
        }

        function moveTimer(pos) {
            timerSize = timerSize || defaultWidth + 30;
            var parentSize = $("span#trackProgress-base.trackProgress-base").width();
            if (pos > (parentSize -  timerSize)) {
                updateTimerTime(MetaHelper.durationConverter(mousePosTimeRatio(pos), "full"));
                $("#timeControl")[0].style.top = "0px";
                $("#timeControl")[0].style.left = lastPos + "px";
                $("#timeControl")[0].style.width = defaultWidth + "px";
            } else {
                updateTimerTime(MetaHelper.durationConverter(mousePosTimeRatio(pos), "full"));
                lastPos = pos;
                $("#timeControl")[0].style.top = "0px";
                $("#timeControl")[0].style.left = pos + "px";
                $("#timeControl")[0].style.width = defaultWidth + "px";
            }
        }

        $("#timeControlBase").on('mouseenter', function (event) {
            if (CurrentTrack && CurrentTrack.duration != null) {
                $("#timeControl").show();
                $("#timeControlBase").on('mouseleave', function (event) {
                    $("#timeControl").hide();
                    event.currentTarget.removeEventListener('mousemove', function () { });
                    event.currentTarget.removeEventListener('mouseup', function () { });
                });
            }
        });

        $("#timeControlBase").on('mousemove', function (event) {
            moveTimer(event.clientX);
        });

        $("#timeControlBase").on('mouseup', function (event) {
            if (player.state == "playing"|| player.state == "paused") {
                playbackSync.ControlledPlayback(mousePosTimeRatio(event.clientX));
            }
        });
        $("#timeControl").hide();
    },

    togglePlaybackControls: function () {
        if (!$("span.pauseTrack").length > 0) {
            $("span.playTrack").removeClass('playTrack');
            $("#play").addClass("pauseTrack");
        } else {
            $("span.pauseTrack").removeClass('pauseTrack');
            $("#play").addClass("playTrack");
        }
    },

    setPlaybackListeners: function () {
        // Play button
        $("#play").on('click', function (event) {
            if (meta.length > 1) {
                if (player && player.state == "paused" || player.state == "playing") {
                    if (Buffering) { return; }
                    event.stopPropagation();
                    player.loadTrack(event);
                } else {
                    player = new Player("stopped", meta[playbackSync.getNextTrack()].source, Player.DEFAULTS.REPEAT, Player.DEFAULTS.SHUFFLE, Player.DEFAULTS.VOLUME);
                    player.loadTrack(event);
                }
            }
        });
        // Previous button
        $("#preTrack").on('click', function (event) {
            if (meta.length > 1) {
                event.stopPropagation();
                processor.end();
                playbackSync.HardReset();
                playbackSync.PlaybackProgressBar();
                handlers.resetMusicDetailsVisuals();
                preTrackIndex.pop();
                playbackSync.RequestPlayback(preTrackIndex.pop(), "previous");
            }
        });
        // Next button
        $("#nextTrack").on('click', function (event) {
            if (meta.length > 1) {
                event.stopPropagation();
                processor.end();
                playbackSync.HardReset();
                playbackSync.PlaybackProgressBar();
                handlers.resetMusicDetailsVisuals();
                playbackSync.RequestPlayback(playbackSync.getNextTrack(), "next");
            }
        });
    },

    toggleVideoPlayer: function (event) {
        var curTime = $("#videPlayer")[0].currentTime;
        var durTime = $("#videPlayer")[0].duration;
        if ($("#videPlayer")[0].paused) {
            if (CurrentTrack) {
                if (CurrentTrack.duration) {
                    $("#videPlayer")[0].play();
                    playbackSync.PlayVideoPlayback(curTime, durTime);
                }
            }
        } else {
            $("#videPlayer")[0].pause();
            playbackSync.PauseVideoPlayback();
        }
    },
    
    setNotification: function () {
        // open notification
        toggleNotification = true;
        $("#main-view").attr("class", "loading");
        $('[data-main="content"]').attr("class", "loading");
        $("#desktopFooterWrapper").attr("class", "loading");
        $(".preloaderWrap-closed").attr("class", "preloaderWrap-open");
        $(".preloader-closed").attr("class", "preloadep-open");
        $("#preloaderWrap").on('click', function (event) { return; });
    },

    setTestingListeners: function () {/*test only*/},

    /** @desc range volume value to audio range value */
    convertVolumeVal: function (vol) {
        if (vol.search("-") >= 0) {
            return vol < - 0.5 ? parseFloat(vol) + 1 : (parseFloat(vol) * 0.5) + 0.5;
        } else {
            return vol == 0 ? 0.5 : (parseFloat(vol) / 2) + 0.5;
        }
    },

    changePlaybackVolume: function () {
        var smoothVolController = setInterval(function () {
            var volVal = $volumeRange.val();
            $videoPlayer.volume = handlers.convertVolumeVal(volVal);
            volume = volVal;
            if (!!volHeldDown) {
                if (player.state == "paused"|| player.state == "playing" && bufferSource) {
                    playbackSync.changeVolume($volumeRange.val());
                }
            } else { clearInterval(smoothVolController) }
        }, 10);
    },

    showVolumeRange: function () {
        $volumeRange.show();
    },

    hideVolumeRange: function () {
        setTimeout(function () { $volumeRange.hide() }, 3500);
    },

    setVolControlListener: function () {

        $VolumeControl.on("mouseenter", function () { handlers.showVolumeRange() });
        $volumeRange.on("mouseenter", function () { handlers.showVolumeRange() });
        $volumeRange.on("mouseleave", function () { handlers.hideVolumeRange() });
        $volumeRange.on('onmousewheel', function (event) {/* TODO: volume */});
        $volCtrl = $($volCtrl);
        $volCtrl.mousedown(function () {
            volHeldDown = true;
            handlers.changePlaybackVolume();
        });
        //scrolling end
        $volCtrl.mouseup(function () {
            volHeldDown = false;
        });
    },

    setSingleTrackListeners: function () {
        $(".songTitle").on('mousedown', function (event) {
            if (event.which == 3) {
                $(".LocalTabView").on("mouseenter", removeContextMenuItem);
                createContextMenuItem("Play Next", event.currentTarget.attributes[1].value);
            } else if (event.which == 1 && !Buffering) {
                processor.end();
                playbackSync.HardReset();
                handlers.toggleActiveTrack(event);
                preTrackIndex.push(parseInt(event.currentTarget.attributes[1].value));
                handlers.resetMusicDetailsVisuals();
                playbackSync.RequestPlayback(event.currentTarget.attributes[1].value, "next");
            }
        });
    },

    setCustomScrollbar: function () {
        $(".LocalTabView").click();
    },

    resetMusicDetailsVisuals: function () {
        $(".timeLeft hrs").hide();
        $(".timeLeft mins").text(" - -  ");
        $(".timeLeft secs").text(" - -");
        $("#SongDuration hrs").hide();
        $("#SongDuration mins").text("- -  ");
        $("#SongDuration secs").text("- -");
        $("#volumeRange").hide();
        // $('.details > *').hide();
    },

    // Hides/shows searchbar
    toggleSearchBar: function () {
        var searchOpen = (($searchBar[0].attributes[$searchBar[0].attributes.length - 1].value.search(/none/) >= 0) ? true : false);
        if (searchOpen) {
            $searchBar.show();
        }
    },

    closeSearchBar: function (params) {
        var on = $SearchToggle[0].attributes[$SearchToggle[0].attributes.length - 1].value
                                                                .search("SearchToggle-On") >= 0;
        if (on) {
            $($SearchToggle)
				.removeClass("SearchToggle-On")
				.addClass("SearchToggle-Off");
            setTimeout(function () {
                $searchBar.hide();
            }, 1000);
        }
    },


    toggleSearchBarIcon: function () {
        handlers.toggleSearchBar();
        var on = $SearchToggle[0].attributes[$SearchToggle[0].attributes.length - 1].value
								.search("SearchToggle-On") >= 0;
        if (on) {
            $($SearchToggle)
				.removeClass("SearchToggle-On")
				.addClass("SearchToggle-Off");
            setTimeout(function () {
                $searchBar.hide();
            }, 1000);
        } else {
            $searchBar.val("	");
            $($SearchToggle)
				.removeClass("SearchToggle-Off")
				.addClass("SearchToggle-On");
        }
    },


    toggleActiveRow: function (index, direction) {
        if (direction == 38) {      //  up
            if ($("tr.active").length > 0) {
                $($("tr.active"))
                  .removeClass("active");
                $($('[row-index="' + index + '"]')).addClass("active");
            } else {
                return;
            }
        } else {                    // down
            if ($("tr.active").length > 0) {
                $($("tr.active"))
                  .removeClass("active");
                $($('[row-index="' + index + '"]')).addClass("active");
            } else {
                $($('[row-index="1"]')).addClass("active");
            }
        }
    },

    findPreviousActiveRowIndex: function () {
        return ($("tr.active")[0].attributes[0].value) - 1;
    },

    findNextActiveRowIndex: function () {
        if ($("tr.active").length > 0) {
            return parseInt($("tr.active")[0].attributes[0].value) + 1;
        } else {
            if (($(".glyphicon-play").length) >= 0) {
                return parseInt($(".glyphicon-play")[0].attributes[1].value);
            } else {
                return 0;
            }
        }
    },

    setKeyboardNavigationListener: function () {
        if (activeTab && activeTab == "music") {
            document.addEventListener("keydown", function (event) {
                event.preventDefault();// Prevent scrolling if using keyboard .
                if (event.which == 37) { 		 // left
                    return;
                } else if (event.which == 38) {  // up
                    if ($("tr.active").length > 0) {
                        handlers.toggleActiveRow(handlers.findPreviousActiveRowIndex(), event.which);
                    } else {
                        return;
                    }
                } else if (event.which == 39) {  // right
                    return;
                } else if (event.which == 40) {  // down
                    handlers.toggleActiveRow(handlers.findNextActiveRowIndex(), event.which);
                } else if (event.which == 13) {  // enter
                    if ($("tr.active").length > 0) {
                        var index = parseInt($("tr.active a")[0].attributes[1].value);
                        preTrackIndex.push(index);
                        playbackSync.setCurrentTrack(MetaHelper.parseFileName(meta[index].name));
                        playbackSync.Play(index);
                    } else {
                        return;
                    }
                }
            });
        }
    },
    
    setToggleShuffleIconListener: function () {
        $ShuffleToggle.on("click", function (event) {
            var on = event.currentTarget.attributes[1].value.search("ShuffleToggle-On") >= 0;
            if (on) {
                ShuffleOn = false;
                $($ShuffleToggle)
                    .removeClass("ShuffleToggle-On")
                    .addClass("ShuffleToggle-Off");
            } else {
                ShuffleOn = true;
                $($ShuffleToggle)
                    .removeClass("ShuffleToggle-Off")
                    .addClass("ShuffleToggle-On");
            }
        });
    },
    
    setRepeatToggleListener: function () {
        $RepeatToggle.on("click", function (event) {
            var on = event.currentTarget.attributes[1].value.search("RepeatToggle-On") >= 0;
            if (on) {
                var loopTrack = ($("#RepeatToggle span").text() == 1);
                if (!loopTrack) {
                    LoopOn = "track";
                    $("#RepeatToggle span").text("1");
                } else {
                    LoopOn = false;
                    $("#RepeatToggle span").text(" ");
                    $($RepeatToggle)
                        .removeClass("RepeatToggle-On")
                        .addClass("RepeatToggle-Off");
                }
            } else {
                LoopOn = true;
                $($RepeatToggle)
                    .removeClass("RepeatToggle-Off")
                    .addClass("RepeatToggle-On");
            }
        });
    },

    setSearchBarListeners: function () {
        $SearchToggle.on("click", function () {
            setTimeout(function () {
                handlers.toggleSearchBarIcon();
            }, 300);
        });
        $searchBar.on('input', function (event) {
            if (this.value.search(/^	(.*)/gmi) >= 0) {
                this.value = "	" + this.value;
            }
        });
    },


    /** 
     * @desc checks if the selected track index is not the same as the current active index 
     */
    isActiveTrack: function (index) {
        if ($(".glyphicon-play")[0] != undefined) {
            var activeIndex = $(".glyphicon-play")[0].attributes[1].value;
            if (typeof index == "number") {
                return activeIndex == index;
            } else {
                return activeIndex == arguments[0].currentTarget.attributes[1].value;
            }
        } else {
            return false;
        }
    },

    toggleActiveTrack: function () {
        if (Buffering) { return; }
        if (typeof arguments[0] == "object") {
            var active = $('[data-index="' + arguments[0].currentTarget.attributes[1].value + '"]').text() > 0;
            var otherActive = $($(".glyphicon-play")).length > 0;
            if (!!active) {
                (!otherActive) ? null : (function () {
                    $($(".glyphicon-play"))
                     .text($(".glyphicon-play")[0].attributes[1].value)
                     .removeClass("glyphicon-play")
                     .removeClass("glyphicon")
                })()
                $($('[data-index="' + arguments[0].currentTarget.attributes[1].value + '"]'))
					.text("")
					.addClass("glyphicon")
					.addClass("glyphicon glyphicon-play");
            } return;
        } else {
            var active = $('[data-index="' + arguments[0] + '"]').text() > 0;
            var otherActive = $($(".glyphicon-play")).length > 0;
            if (!!active) {
                (!otherActive) ? null : (function () {
                    $($(".glyphicon-play"))
                     .text($(".glyphicon-play")[0].attributes[1].value)
                     .removeClass("glyphicon-play")
                     .removeClass("glyphicon")
                })()
                $($('[data-index="' + arguments[0] + '"]'))
					.text("")
					.addClass("glyphicon")
					.addClass(" glyphicon-play");
            } return;
        }
    },

    nextTrackFromTrackList: function (pre) {
        var trackNum = parseInt($('[data-index="'+pre+'"]').attr('data-count'));
        return parseInt($('[data-count="'+(trackNum+1)+'"]').attr('data-index'));
    },

    setContextMenuListener: function () {},

    showtablistFull: function () {
        $($(".row"))[0].style.marginLeft = "-15px";
        $($(".row"))[0].style.marginRight = "-15px";
        $($(".row"))[0].style.width = "830px";
        $($(".tablist-half-open")[0])
          .removeClass('tablist-half-open')
          .addClass('tablist-open');

    },

    hidetablistFull: function () {
        $($(".row"))[0].style.width = "139%";
        $($(".row"))[0].style.marginLeft = "-285px";
        $($(".row"))[0].style.marginRight = "-15px";
        $($(".tablist-open")[0])
          .removeClass('tablist-open')
          .addClass('tablist-closed');

    },

    toggletablistHalf: function () {
        $($(".row"))[0].style.width = "139%";
        $($(".row"))[0].style.marginLeft = "-285px";
        $($(".row"))[0].style.marginRight = "-15px";
        $($(".tablist-half-open")[0]).toggleClass('tablist-half-closed');
        $($(".tablist-half-closed")[0]).toggleClass('tablist-half-open');

    },

    navigationListener: function () {
        // navigation bar
        $($("div.left-side ul")[0]).on('mouseleave', function (event) {
            if (activeTab == "video") {
                if ($($(".tablist-half-open")).length > 0) {
                    handlers.toggletablistHalf();
                    $($(".tablist-half-closed")[0]).removeClass(".tablist-half-open");
                }
            }
        });
        // music tab
        $($("div.left-side ul li:nth-child(1)")[0]).on('click', function (event) {
            handlers.closeSearchBar();
            if (event.which == 1)
                event.stopPropagation();
            if (activeTab == "video") {
                $('#trackProgress-wrap').show();
                activeTab = "music";
                handlers.showtablistFull();
            }
        });
        // playlist tab
        $($("div.left-side ul li:nth-child(2)")[0]).on('click', function (event) {
            handlers.closeSearchBar();
            if (event.which == 1)
                event.stopPropagation();
            $($("#videPlayer")[0]).hide();
            if (activeTab == "video") {
                activeTab = "playlist";
                $('#trackProgress-wrap').show();
                handlers.showtablistFull();
            }
        });
        // sync tab
        $($("div.left-side ul li:nth-child(4)")[0]).on('click', function (event) {
            handlers.closeSearchBar();
            if (event.which == 1)
                event.stopPropagation();
            $($("#videPlayer")[0]).hide();
            if (activeTab == "video") {
                activeTab = "sync";
                $('#trackProgress-wrap').show();
                handlers.showtablistFull();
            }
        });
        // video tab
        $($("div.left-side ul li:nth-child(5)")[0]).on('click', function (event) {
            handlers.closeSearchBar();
            if (event.which == 1)
                event.stopPropagation();
            $($("#videPlayer")[0]).show();
            if (activeTab != "video") {
                activeTab = "video";
                handlers.hidetablistFull();
                $('#trackProgress-wrap').show();
                $($(".tablist-closed")[0])
                    .removeClass("tablist-closed")
                    .addClass("tablist-half-closed");
                $($(".SearchToggle-On"))
                    .removeClass("SearchToggle-On")
                    .addClass(".SearchToggle-Off");
            }
        });
        // search tab event 
        $($("div.left-side ul li:nth-child(6)")[0]).on('click', function (event) {
                event.stopPropagation();
            if (activeTab == "video") {
                activeTab = "music";
                handlers.showtablistFull();
            }
        });
        $($(".tablist-half-open")[0]).on('mouseenter', function (event) {
            if (event.which == 1)
                handlers.showtabblistHalf();
        });
        $($(".tablist-half-open")[0]).on('mouseleave', function (event) {
            if (event.which == 1)
                setTimeout(function () {
                    if ($($(".tablist-half-open")).length > 0) {
                        handlers.toggletablistHalf();
                    }
                }, 5000);
        });
        // hoverslide
        $($(".hoverSlide")[0]).on('mouseenter', function (event) {
            $($(".tablist-half-closed")[0]).toggleClass('tablist-half-open');
            $($(".tablist-half-open")[0]).toggleClass('tablist-half-closed');
        });
        $(document).on('mouseleave', function () {
            if (activeTab == "video") {
                $($(".tablist-half-open")[0])
                  .removeClass('tablist-half-open')
                  .addClass('tablist-half-closed');
            }
        });
        playbackSync.SetDefaultPosterImage();
    },

    toggletablistHalftoFull: function () {
        $($(".row"))[0].style.marginLeft = "-15px";
        $($(".row"))[0].style.marginRight = "-15px";
        $($(".row"))[0].style.width = "830px";
        $($(".tablist-half-closed")[0])
          .removeClass('tablist-half-closed')
          .addClass('tablist-open');        
    },

    crazyTabSwitch: function () {
        activeTab = "video";
        $('.left-side ul li:nth-child(3)').click()
        $('.left-side ul li:nth-child(1)').click()
        this.toggletablistHalftoFull();
    },

    /**
     * @desc Sets listeners for all the elements
     */
    setListenersForAll: function () {
        this.setTimeController();
        this.setContextMenuListener();
        this.setAppStateListeners();
        this.resetMusicDetailsVisuals();
        this.setKeyboardNavigationListener();
        this.setSearchBarListeners();
        this.setRepeatToggleListener();
        this.setToggleShuffleIconListener();
        this.setVolControlListener();
        this.setNotification();
        this.setPlaybackListeners();
        this.setTestingListeners();
    }
};
