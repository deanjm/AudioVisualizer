﻿/// <reference path="chroma.js" />

var spectogram = function () {
    // create the audio context (chrome only for now)
    if (!window.AudioContext) {
        if (!window.webkitAudioContext) {
            alert('no audiocontext found');
        }
        window.AudioContext = window.webkitAudioContext;
    }

    var context = new AudioContext();

    var audioBuffer;
    var sourceNode;
    var analyser;
    var javascriptNode;

    // get the context from the canvas to draw on
    var ctx = $("#canvas").get()[0].getContext("2d");

    // create a temp canvas we use for copying
    var tempCanvas = document.createElement("canvas"),
        tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = 800;
    tempCanvas.height = 512;

    // used for color distribution
    var hot = chroma.scale(
        ['#000000', '#00ff00', '#ffff00', '#ffffff'],
        [0, .25, .75, 1]).mode('rgb').domain([0, 300]);

    // load the sound
    setupAudioNodes();
    loadSound("AudioFiles/Sacchrine Love Theme.mp3");


    function setupAudioNodes() {

        // setup a javascript node
        javascriptNode = context.createScriptProcessor(2048, 1, 1);
        // connect to destination, else it isn't called
        javascriptNode.connect(context.destination);


        // setup a analyzer
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0;
        analyser.fftSize = 1024;

        // create a buffer source node
        sourceNode = context.createBufferSource();
        sourceNode.connect(analyser);
        analyser.connect(javascriptNode);

        sourceNode.connect(context.destination);
    }

    // load the specified sound
    function loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // When loaded decode the data
        request.onload = function () {

            // decode the data
            context.decodeAudioData(request.response, function (buffer) {
                // when the audio is decoded play the sound
                playSound(buffer);
            }, onError);
        }
        request.send();
    }


    function playSound(buffer) {
        sourceNode.buffer = buffer;
        sourceNode.start(0);
        sourceNode.loop = true;
    }

    // log if an error occurs
    function onError(e) {
        console.log(e);
    }

    // when the javascript node is called
    // we use information from the analyzer node
    // to draw the volume
    javascriptNode.onaudioprocess = function () {

        // get the average for the first channel
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        // draw the spectrogram
        if (sourceNode.playbackState == sourceNode.PLAYING_STATE) {
            drawSpectrogram(array);
        }


    }

    function drawSpectrogram(array) {

        // copy the current canvas onto the temp canvas
        var canvas = document.getElementById("canvas");

        tempCtx.drawImage(canvas, 0, 0, 800, 512);

        // iterate over the elements from the array
        for (var i = 0; i < array.length; i++) {
            // draw each pixel with the specific color
            var value = array[i];
            ctx.fillStyle = hot(value).hex();
            // draw the line at the right side of the canvas
            ctx.fillRect(800 - 1, 512 - i, 1, 1);
        }

        // set translate on the canvas
        ctx.translate(-1, 0);
        // draw the copied image
        ctx.drawImage(tempCanvas, 0, 0, 800, 512, 0, 0, 800, 512);

        // reset the transformation matrix
        ctx.setTransform(1, 0, 0, 1, 0, 0);

    }
}();