/**
 * 
 * @author <bigkevin2682@gmail.com>
 */

'use strict';


// Globals
var Player,
	ready,
	trackIndex            = [],
	preTrackIndex         = [],
	nextPlaybackIndex     = [],
	MediaDirectoriesList  = [],
	previousPlaybackIndex = [],
	toggleNotification    = false,
	isVedio               = false,
	volHeldDown           = false,
	CurrentTrack          = {},
	Buffering             = false,
	volume				  = 0.01;

// Player
Player = function (state, track, repeat, shuffle, volume) {
	this.state = state;
	this.track = track;
	this.repeat = repeat;
	this.shuffle = shuffle;
	this.volume = volume;
};

Player.prototype.DEFAULTS = app.playerDefauls;

Player.prototype.play = playbackSync.Play;

Player.prototype.pause = playbackSync.Pause;

Player.prototype.EndAudioPlayback = playbackSync.EndAudioPlayback;

Player.prototype.loadTrack = playbackSync.loadTrack;

Player.prototype.loadNextTrack = playbackSync.loadNextTrack;

Player.prototype.loadPreviousTrack = playbackSync.loadPreviousTrack;

Player.prototype.playVideoPlayback = playbackSync.PlayVideoPlayback;

Player.prototype.endVideoPlayback = playbackSync.EndVideoPlayback;

Player.prototype.pauseVideoPlayback = playbackSync.PauseVideoPlayback;

Player.prototype.softReset = playbackSync.softReset;

Player.prototype.hardReset = playbackSync.hardReset;

Player.prototype.virtualize = playbackSync.virsualise;

Player.prototype.AttachPlayer = playbackSync.AttachPlayer;

Player.prototype.staticPlayback = playbackSync.staticPlayback;

Player.prototype.ControlledPlayback = playbackSync.ControlledPlayback;

Player.__proto__.DEFAULTS = {
	REPEAT : app.DEFAULTS.playerDefaults.REPEAT,
	SHUFFLE : app.DEFAULTS.playerDefaults.SHUFFLE,
	VOLUME : app.DEFAULTS.playerDefaults.VOLUME 
};

Player.prototype.init = function () {
    self.player = new Player("initial", {}, Player.DEFAULTS.REPEAT, Player.DEFAULTS.SHUFFLE, Player.DEFAULTS.VOLUME);
	self.activeTab = "music";
	app.setPlaybackModes();
	scanner.scan();
	handlers.setListenersForAll();
}

// Initialise the player
new Player().init();
