;(function () {
    'use strict';

    /**
     * @desc - Gets the metadata for a specified file
     * @todo - This implementation calls the callback twice, fix it ! 
     * @todo - Speed up runtime for this file by reducing the number of calls .
     */
    self.MetaHelper = function () { };
    self.MINI_FILE_SIZE =  5152226; // [5Mb]

    /**
     * Convert base64 string to ArrayBuffer
     * 
     * @param {object} base64String base64 encoded data string
     */
    function decodeBase64ToArrayBuffer(base64String) {
        var len = (base64String.length / 4) * 3;
        var str = atob(base64String);
        var arrayBuffer = new ArrayBuffer(len);
        var bytes = new Uint8Array(arrayBuffer);

        for (var i = 0; i < len; i++) {
            bytes[i] = str.charCodeAt(i);
        }
        return bytes; // was: bytes.buffer 
    }

    /**
     * Encode album artwork binary
     * @param {object} rawBin binary data
     */
    function encodeImageUri(rawBin) {
        return btoa(encodeURIComponent(rawBin).replace("/%([0-9A-F]{2})/g", function (match, p1) {
            return String.fromCharCode("0x" + p1);
        }));
    }


    /** 
     * @returns {Object} - HTMLDomImageElement
     */
    function convertImg(bin) {

        var encodedImg = encodeImageUri(bin);                    //raw binary  [->] base64 data .
        var arBufferImg = decodeBase64ToArrayBuffer(encodedImg); //base64      [<-] bufferArray 
        var blob = new Blob(arBufferImg);                        //ArrayBuffer [->] file/blob
        var imageURI = URL.createObjectURL(blob);                //File        [->] objectUrl

        var imageEle = document.createElement("img");
        imageEle.src = imageURI;

        return {
            image: imageEle,
            bin: bin,
            file: blob
        }
    }


    MetaHelper.__proto__.createImageArtwork = function (bin) {
        if (bin) {
            console.log('%c Album artwork', 'color:pink');
            return convertImg(bin);
        } else {
            return null;
        }
    }

    MetaHelper.__proto__.parseFileName = function (name) {
        if (name != "") {
            if (name.search(/mp4|mp3|ogg|wave|webm|acc|mkv|aiff|vlc|vob|acc/img) >= 0) {
                try {
                    return name.replace(/(.mp4)|(.mp3)|(.ogg)|(.wave)|(.webm)|(.acc)|(.mkv)|(.aiff)|(.vlc)|(.vob)|(.acc)$/img.exec(name)[0], "");
                } catch (ex) {
                    console.warn('Uknown file type : ' + name + " [File name parse exception]" + ex);
                    return name;
                }
            }
        }
        return name;
    },

    /** 
     * @desc Calculates duration of song from blob file . 
     */
    MetaHelper.__proto__.getDurationFromBin = function (file, meta, callback) {
        try {
            var audioTag = null;
            audioTag = document.createElement('audio');
            audioTag.addEventListener("canplaythrough", function (ev) {
                meta.title === ""? meta.title = undefined : null;
                (meta.album === undefined || meta.album === "")? meta.album = undefined: null;
                meta.artist[0] === undefined ? meta.artist = undefined: meta.artist = meta.artist[0];
                var time = ev.currentTarget.duration; // [ms]
                meta.name = meta.name || MetaHelper.parseFileName(meta.name);
                meta.title = meta.title || MetaHelper.parseFileName(meta.name);
                meta.stackSize =  meta.stackSize;
                meta.artwork =  MetaHelper.createImageArtwork(meta.image) || null;
                meta.duration = {
                    full: MetaHelper.durationConverter(time, 'full'),
                    hours: MetaHelper.durationConverter(time, 'hours'),
                    minutes: MetaHelper.durationConverter(time, 'minutes'),
                    seconds: MetaHelper.durationConverter(time, 'seconds')
                };
                file = null;
                onFinish(meta, meta, callback);
            });
            audioTag.src = `file:///${meta.path}`;
        } catch (ex) {
            file = null;
            throw new Error({message: "Error getting duration ."});
        }
    }
    
    /**
     * @param {Number} - raw seconds
     * @param {String} - output time
     */
    MetaHelper.__proto__.durationConverter = function (iT, oT) {
        switch (oT) {
            case "full":
                return "" + ((Math.floor(Math.floor(iT) / 36e2) <= 0 ? "" : (Math.floor(Math.floor(iT) / 36e2) + ":")) + ((Math.floor(iT / 60)) <= 9 ? ("0" + (Math.floor(iT / 60))) : (Math.floor(iT / 60))) + ":" + ((Math.floor(Math.floor(iT - Math.floor(iT / 60) * 60))) <= 9 ? ("0" + (Math.floor(Math.floor(iT - Math.floor(iT / 60) * 60)))) : (Math.floor(Math.floor(iT - Math.floor(iT / 60) * 60)))));
                break;
            case "hours":
                return Math.floor(iT / 36e2) > 9 ? Math.floor(iT / 36e2) : "0" + Math.floor(iT / 36e2);
                break;
            case "minutes":
                return Math.floor(iT / 60) > 9 ? Math.floor(iT / 60) : "0" + Math.floor(iT / 60);
                break;
            case "seconds":
                return Math.floor(iT - Math.floor(iT / 60) * 60) > 9 ? Math.floor(iT - Math.floor(iT / 60) * 60) :
                                "0" + Math.floor(iT - Math.floor(iT / 60) * 60);
                break;
        }
    }

    /**
     * @returns {String} - A human version of the framename
     * @todo - embed the frames object in this method after your done with the lib, minimize the space .
     */
    function humanizeFrameName(framename) {
        return ({
            TAL: "album", TBP: "bpm", TCM: "composer", TCO: "genre", TCR: "copyright",
            TDY: "playlist-delay", TEN: "encoder", TFT: "file-type", TKE: "initial-key", TLA: "language",
            TLE: "length", TMT: "media-type", TOA: "original-artist", TOF: "original-filename", TOL: "original-writer",
            TOT: "original-album", TP1: "artist", TP2: "band", TP3: "conductor", TP4: "remixer",
            TPA: "set-part", TPB: "publisher", TRC: "isrc", TRK: "track", TSS: "encoder-settings",
            TT1: "content-group", TT2: "title", TT3: "subtitle", TXT: "writer", WCOM: "url-commercial",
            WCOP: "url-legal", WOAF: "url-file", WOAR: "url-artist", WOAS: "url-source", WORS: "url-radio",
            WPAY: "url-payment", WPUB: "url-publisher", WAF: "url-file", WAR: "url-artist", WAS: "url-source",
            WCM: "url-commercial", WCP: "url-copyright", WPB: "url-publisher", COMM: "comments", APIC: "image",
            PIC: "image", TALB: "album", TBPM: "bpm", TCOM: "composer", TCON: "genre",
            TCOP: "copyright", TDEN: "encoding-time", TDLY: "playlist-delay", TDOR: "original-release-time", TDRC: "recording-time",
            TDRL: "release-time", TDTG: "tagging-time", TENC: "encoder", TEXT: "writer", TFLT: "file-type",
            TIPL: "involved-people", TIT1: "content-group", TIT2: "title", TIT3: "subtitle", TKEY: "initial-key",
            TLAN: "language", TLEN: "length", TMCL: "credits", TMED: "media-type", TMOO: "mood",
            TOAL: "original-album", TOFN: "original-filename", TOLY: "original-writer", TOPE: "original-artist", TOWN: "owner",
            TPE1: "artist", TPE2: "band", TPE3: "conductor", TPE4: "remixer", TPOS: "set-part",
            TPRO: "produced-notice", TPUB: "publisher", TRCK: "track", TRSN: "radio-name", TRSO: "radio-owner",
            TSOA: "album-sort", TSOP: "performer-sort", TSOT: "title-sort", TSRC: "isrc", TSSE: "encoder-settings", TSST: "set-subtitle"
        })[framename] || false;
    }

    /*
        Note : DataView custom properties
        Todo : Put this as part of code or not .
    =============================================*/

    // getchar dataview custom property
    // @bug offset is outside the bounds of the dataview . 
    // NOTE: This bug is happening because we are not checking for empty meta data,
    //      a file might have meta data but it might be empty .
    DataView.prototype.getChar = function (start) {
        return String.fromCharCode(this.getUint8(start));
    };
    // getstring dataview custom property
    DataView.prototype.getString = function (start, length) {
        for (var i = 0, v = ''; i < length; ++i) {
            v += this.getChar(start + i);
        }
        return v;
    };
    // getint dataview custom property
    DataView.prototype.getInt = function (start) {
        return (this.getUint8(start) << 21) | (this.getUint8(start + 1) << 14) | (this.getUint8(start + 2) << 7) | this.getUint8(start + 3);
    };

    function frameReader(_file, buffer, dView, length, size, callback) {
        var Meta = {},
            pos = 0,
            tagVersion = dView.getUint8(3),
            ID3FrameSize = dView.getUint8(3) < 3 ? 6 : 10;
            Meta.stackSize = buffer.byteLength;
            Meta.size = size;

        try {
            while (true) {

                var rembytes = length - pos; // Keep track of the remaining bytes

                // Check for a frameheader left
                if (rembytes < ID3FrameSize) { break; }
                // Check for a frame left
                try 
                {
                    if (buffer.getChar(pos) < 'A' || buffer.getChar(pos) > 'Z') { break; }
                } catch (ex)
                {
                    console.error(e);
                    break;
                }

                // reset the framename and framesize .
                var framename = null;
                var framesize = null;

                // Note : framename is 3 for ID3v3 and 4 char after
                if (tagVersion < 3) {
                    if (pos + framesize > length) { break; }

                    framename = buffer.getString(pos, 3);
                    framesize = ((buffer.getUint8(pos + 5) & 0xFF) << 8)  |
                                ((buffer.getUint8(pos + 4) & 0xFF) << 16) |
                                ((buffer.getUint8(pos + 3) & 0xFF) << 24);

                    // Friendly framenames .
                    Meta[humanizeFrameName(framename)] = buffer.getString(pos + ID3FrameSize+1, framesize - 1);

                    console.info("framename & size  " + framename + ":" + framesize);

                } else {
                    if (pos + framesize > length) { break; }

                    framename = buffer.getString(pos, 4);
                    framesize = buffer.getInt(pos + 4);

                    // Friendly framenames .
                    Meta[humanizeFrameName(framename)] = buffer.getString(pos + ID3FrameSize+1, framesize - 1);

                    console.info("framename: " + framename);
                    console.info("framesize: " + framesize);

                }
                pos += framesize + ID3FrameSize;
                continue;
            } // while loop 

            console.dir(Meta);
            // Get the duration .
            MetaHelper.getDurationFromBin(_file, Meta, function (_Meta) {
                onFinish(Meta, _Meta, callback);
            });

        } catch (ex) {
            console.error(ex);

            // Get the duration .
            MetaHelper.getDurationFromBin(_file, Meta, function (_Meta) {
                onFinish(Meta, _Meta, callback);
            });
        }
    }


    function parseMeta(arBuf, _file, size, callback) {

        var dView = new DataView(arBuf, 0, arBuf.byteLength);
        
        console.log('%c DataView ','color:yellow');
        console.log('Getting id3 tags .');

        // Note : ID3 tags are different depending on the file type a picture will return null for certail properties .
        var Meta = {},
            tagVersion = dView.getUint8(3);

        // NOTE: ID3v 3 has 3 char id3 framenames and ID3v4 has 4 char framenames .
        if (dView.getString(0, 3) == 'ID3') {
            if (!(tagVersion < 0 || tagVersion > 4)) {
                console.info("Tag Version: " + tagVersion);
                try {
                    var tagSize = dView.getInt(6) + 10;

                    console.info("Tag size: " + tagSize);

                    var uses_synch = (dView.getUint8(5) & 0x80) != 0 ? true : false;
                    var has_extended_hdr = (dView.getUint8(5) & 0x40) != 0 ? true : false;

                    var headerSize = 0;

                    // Check if it has extened header size
                    if (has_extended_hdr) {
                        headerSize = dView.getInt(10);
                        console.info("headersize: " + headersize);
                    }
                    // Read the whole tag
                    var buffer = new DataView(dView.buffer.slice(10 + headerSize, tagSize));
                    // Prepare to parse the tag
                    var length = buffer.byteLength;

                    console.info("buffer length: " + length);

                    // Note : Find out more about this uses_synch property .
                    if (uses_synch) {
                        // TODO: Find out what the hell this uses_synch is .
                        var newpos = 0;
                        // Create a new buffer
                        var newbuffer = new DataView(new ArrayBuffer(tagSize));

                        console.info("new buffer: " + newbuffer);

                        for (var i = 0; i < tagSize; i++) {
                            if (i < tagSize - 1 && (buffer.getUint8(i) & 0xFF) == 0xFF && buffer.getUint8(i + 1) == 0) {
                                newbuffer.setUint8(newpos++, 0xFF);
                                i++;
                                continue;
                            }
                            newbuffer.setUint8(newpos++, buffer.getUint8(i));
                        }
                        length = newpos;
                        buffer = newbuffer;
                    }
                } catch (e) {
                    console.info('Error reading meta .');
                    // Get the duration .
                    MetaHelper.getDurationFromBin(_file, Meta, function (_Meta) {
                        onFinish(Meta, _Meta, callback);
                    });
                }
                console.info("new buffer: " + buffer);

                // Read each frame for meta .
                frameReader(_file, buffer, dView, length, size, callback);

            } else {
                // unsuppored tag version route 

                // Get the duration .
                MetaHelper.getDurationFromBin(_file, Meta, function (_Meta) {
                    onFinish(Meta, _Meta, callback);
                });

            }
        } else {
            // No Meta route

            // Get the duration .
            MetaHelper.getDurationFromBin(_file, Meta, function (_Meta) {
                onFinish(Meta, _Meta, callback);
            });
        }
    }

    function onFinish(oldMeta, newMeta, callback) {
        callback({
            path: oldMeta.path         || newMeta.path,
            name: oldMeta.name         || newMeta.name    || "unknown name",
            title: oldMeta.title       || newMeta.title   || "unknown title",
            artist: oldMeta.artist     || newMeta.artist  || "unknown artist",
            album: oldMeta.album       || newMeta.album   || "unknown album",
            artwork: oldMeta.artwork   || newMeta.artwork || {
                image: null,
                src: null,
                bin: null
            },
            year: oldMeta.false        || newMeta.false   || null, // year <=> false
            duration: newMeta.duration || {
                full: null,
                hours: null,
                minutes: null,
                seconds: null
            },
            size: oldMeta.size,
            index: newMeta.index       || null
        });
    }


    MetaHelper.__proto__.fileSize =  function (bytes) {
     return {
         size : prettyBytes(bytes),
         bytes : prettyBytes(bytes).replace(/gb|mb|kb|b/img)
     }
    }

    function prettyBytes(bytes) {
        var units = ["Gb", "Mb", "Kb", "B"];
        return (bytes >> 30) /(0x3FF) + (units[Math.floor(Math.log(bytes) / Math.log(0x3FF))] || units[units.length - 1]) ||
               (bytes >> 20) /(0x3FF) + (units[Math.floor(Math.log(bytes) / Math.log(0x3FF))] || units[units.length - 1]) ||
               (bytes >> 10) /(0x3FF) + (units[Math.floor(Math.log(bytes) / Math.log(0x3FF))] || units[units.length - 1]) ||
               (bytes >> 1) /(0x3FF) + (units[Math.floor(Math.log(bytes) / Math.log(0x3FF))] || units[units.length - 1]);
    }

    /** 
     * Read a file without failure due to triming the file
     * @desc {Object} - Attempt to slice large files but retry onfail 
     */
    function failSafeReader(_file, callback) {
        if(_file)
            var result,
                chunkedFile = _file.slice(0, ((_file.size / 4) / (4 + 1) ));
                chunkedFile.name = chunkedFile.name || _file.name;
            setTimeout(function() {
                if (result && typeof result == "object") {
                    callback(result);
                } else {
                    ReadFile(_file, function (arrayBuffer, file, size) {
                        _file = null;
                        parseMeta(arrayBuffer, file, size, function (meta) {
                            arrayBuffer = null;
                            MetaHelper.mem -= meta.stackSize;

                            console.dir(meta);
                            callback(meta);
                        });
                    });
                }
            }, 1000); // NOTE: File size doesn't determine how fast a file is read.
            ReadFile(chunkedFile, function (ArrayBufffer, _file, size) {
                parseMeta(ArrayBufffer, _file, size, function (meta) {
                    ArrayBufffer = null;
                    MetaHelper.mem -= meta.stackSize;
                    result = meta;
                });
            });
    }

    /** 
     * Read a file regardless if it fails or not
     * @param {Object} _file File to be read
     */
    function ReadFile(_file, callback) {
        try {
            var _reader = new FileReader();
            _reader.onload = function (ev) {
                callback(ev.target.result, _file, _file.size);
            }
            _reader.readAsArrayBuffer(_file);
        } catch (_ex) {
            throw new Error({ message: "error reading file.", exception: _ex });
        }
    }

    /** 
     * Read file from the file index in the directory meta json
     * @param {Number} index index of the FileEntry . 
     */
    function readFileEntry(index, callback) {
        try {
            // debugger;
            self.localGalleryOrigin[(index || $('#inputIndex').val())].file(function (result) {
                callback(result);
            });
        } catch (_ex) {
            throw new Error({ message: "error reading file entry", execption: _ex });
        }
    }

    /** 
     * Get metadata from file index 
     * @param {number} index track index in the directory meta json
     * @param {object} callback callback function
     */
    MetaHelper.__proto__.getMetaFromFileEntry = function (index, callback) {
        try {
            if (typeof (parseInt(index)) != "number") {
                var chunkedFile = index.slice(0, ((index.size / 4) / (4 + 1)));
                chunkedFile.name = index.name;
                index = null;

                chunkedFile.file(function (result) {
                    this.retrieveMeta(result, function (metaObj) {
                        callback(metaObj);
                    });
                });
            } else {
                readFileEntry(parseInt(index), function (File) {
                    ReadFile(File, function (ArrayBufffer, _file, size) {
                        File = null;
                        parseMeta(ArrayBufffer, _file , size, function (meta) {
                            ArrayBuffer = null;
                            callback(meta);
                        });
                    });
                });     
            }
        } catch (ex) {
            console.error(ex);
            return ex;
        }
    }

    /**
     * Get metadata from a blob file
     * @param {object} file blob file to get metadata 
     * @param {object} callback callback function
     */
    MetaHelper.__proto__.retrieveMeta = function (file, callback) {
        var  chunkedFile = file.slice(128, file.size - 128);
        chunkedFile.name = chunkedFile.name || file.name;

        console.time("[MetaHelper]");
        if (file.size > self.MINI_FILE_SIZE ) {
            failSafeReader(file, callback);
        } else {
            ReadFile(chunkedFile, function (ArrayBufffer, _file, size) {
                file = null;
                parseMeta(ArrayBufffer, _file, size, function (meta) {
                    ArrayBufffer = null;
                    MetaHelper.mem -= meta.stackSize;

                    console.dir(meta);
                    callback(meta);
                });
            });
        }
        console.timeEnd("[MetaHelper]");
    }

})(window);
