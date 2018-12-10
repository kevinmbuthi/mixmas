/**
 * @desc decoding, processing and playback tasks
 */



var playbackQueue = [];
var aContxt = null,// 6 limit per window
    workerNode,
	gainNode,
	bufferSource,
	startTime = 0,
	initialTime = 0,
	pauseTime = 0,
    pauseOffset = 0,
	startOffset = 0,
    seekOffset = 0,
	progressBarInterval,
	progressTimeInterval,
    previouslyPaused = false;
    

var processor = {

    createProcessor: function () {
        var defaults = {
            "smoothing": 0.9,
            "clipLevel": 0.9,
            "clipLag": 750,
            "updating": 100
        };
        (aContxt.state === "closed") ? ( playbackSync.ResetPlayback()) : false;

        /**
         * @param {Number} - buffer size [ 256, 512, 1024, 2048, 4096, 8192, 16384 ]
         * @param {Number} - number of input channels // max 32
         * @param {Number} - number of output chaneels // max 32
         */
        workerNode = aContxt.createScriptProcessor(1024, 1, 1);
        bufferSource.connect(workerNode);
        workerNode.connect(aContxt.destination);
    },

    /**
     * decode audio from an array of buffer
     * @param {object} arBuffer Array buffer
     */
    decodeAudio: function (arBuffer) {
        Buffering = true;
        $LogInfo("loading track . . .", 0, null);

        aContxt.decodeAudioData(arBuffer, function (buffer) {
            if (buffer) arBuffer = null;

            playbackSync.PlaybackProgressBar();
            processor.buffer = buffer;
            processor.start(buffer);
            previouslyPaused = true;

        }, function (error) {
            $LogInfo("Error Decoding audio", 0, null);
            throw new Error({ message: "Error decoding audio" })
        });
    },

    InitializePlayback: function (arBuffer) {
        try {
             playbackSync.ResetPlayback();
             CurrentTrack.size = arBuffer.byteLength / 1e6; // [Mbs]
            processor.decodeAudio(arBuffer);
        } catch (ex) { console.error(ex) }
    },

    /**
     * Start playback
     * @param {object} buffer Array buffer
     */
    start: function (buffer) {
        // Instanciate a new context if stoped .
        (aContxt.state === "closed" || aContxt == null) ? playbackSync.ResetPlayback() : false;

        bufferSource = aContxt.createBufferSource();	    // define source

        // create processor
        (aContxt.state === "closed" || aContxt == null) ?  processor.createProcessor() : false;

        bufferSource.loop = (typeof LoopOn == "string") ? true : false;

        var analyser = aContxt.createAnalyser(); 			

        bufferSource.connect(analyser); 					// source [->] analyser

        analyser.connect(aContxt.destination); 			    // analyser [->] destination

        // set source buffer
        bufferSource.buffer = buffer ? buffer : processor.buffer;

        aContxt.destination.channelInterpretation = "speakers"; // @enum [ speakers, discrete ]

        gainNode = aContxt.createGain(); 					// create gainNode

        bufferSource.connect(gainNode); 					// source [->] gainNode

        gainNode.connect(aContxt.destination); 		        // gain [->] destination

        aContxt.currentTime = startTime; 					// set startTime
        
        initialTime = (previouslyPaused) ? initialTime :  aContxt.currentTime;

        pauseOffset += aContxt.currentTime - pauseTime;

        /**
         * @param {Number} - delay time [ms]
         * @param {Number} - starting time 
         */
        bufferSource.start(0, startTime % bufferSource.buffer.duration);

        // --------------------------------------------------------
        //  bufferSource.start(0, CurrentTrack.playbackPosition);
        // --------------------------------------------------------

        gainNode.gain.value =  volume;

        CurrentTrack.lastStartTime = startTime;

        bufferSource.onended = processor.onBufferSourceEnded;

        playbackSync.PlaybackProgressBar(aContxt.currentTime, bufferSource.buffer.duration);

        CurrentTrack.duration = bufferSource.buffer.duration;

        // virsualiser
        // Player.virtualize(analyser);

        $LogInfo("Playing  ", 0, null);
        Buffering = false;
    },


    /**
     * Stop playback
     */
    end: function () {
        if (bufferSource != undefined && typeof bufferSource == "object") {
            bufferSource.stop(0);
            gainNode.disconnect(aContxt.destination);  
            bufferSource.disconnect(gainNode); 
            bufferSource.disconnect(workerNode);
            aContxt.close();
            // NOTE: Always make sure that you are null these right after there execution .
        }
    },
    

    onBufferSourceEnded: function (ev) {
        if (bufferSource) { 
            if (bufferSource.buffer.duration < (aContxt.currentTime - (pauseOffset + initialTime + 1) + seekOffset) && 
                    (player.state == "playing" || player.state!= "paused")) {
                 playbackSync.EndAudioPlayback(false);
            } else {
                if (player.state == "playing" || player.state== "paused") {
                    if (bufferSource.buffer.duration > (aContxt.currentTime - (pauseOffset + initialTime + 1) + seekOffset)) {
                         playbackSync.EndAudioPlayback(true);
                    }
                }
            }
        }
    }
};
