var AudioTag = function () {
    var audio, context, sourceNode,
        splitter, leftAnalyser, rightAnalyser,
        javaScriptNode,
        gradient, ctx,
        songChooser;

    function init() {
        songChooser = $('#songChooser');
        initAudioTag();
        context = new AudioContext();

        ctx = document.getElementById('canvas').getContext('2d');

        gradient = ctx.createLinearGradient(0, 0, 0, 130);
        gradient.addColorStop(1, '#000000');
        gradient.addColorStop(0.75, '#00ff00');
        gradient.addColorStop(0.25, '#ffff00');
        gradient.addColorStop(0, '#ffffff');

        initAudioNodes();
    }

    function initAudioTag() {
        audio = document.getElementById('audio');
        audio.src = getCurrentSong();
    }

    function initAudioNodes() {
        javaScriptNode = context.createScriptProcessor(2048, 1, 1);
        javaScriptNode.connect(context.destination);

        leftAnalyser = context.createAnalyser();
        leftAnalyser.smoothingTimeConstant = 0.3;
        leftAnalyser.fftSize = 1024;

        rightAnalyser = context.createAnalyser();
        rightAnalyser.smoothingTimeConstant = 0.3;
        rightAnalyser.fftSize = 1024;

        sourceNode = context.createMediaElementSource(audio);
        splitter = context.createChannelSplitter();

        sourceNode.connect(splitter);

        splitter.connect(leftAnalyser, 0, 0);
        splitter.connect(rightAnalyser, 1, 0);

        leftAnalyser.connect(javaScriptNode);

        sourceNode.connect(context.destination);
    }
    init();

    javaScriptNode.onaudioprocess = function () {
        if (!sourceNode.mediaElement.paused) {
            // get the average for the first channel
            var leftArray = new Uint8Array(leftAnalyser.frequencyBinCount);
            leftAnalyser.getByteFrequencyData(leftArray);
            var leftAvg = getAverageVolume(leftArray);
            
            // get the average for the second channel
            var rightArray = new Uint8Array(rightAnalyser.frequencyBinCount);
            rightAnalyser.getByteFrequencyData(rightArray);
            var rightAvg = getAverageVolume(rightArray);

            console.log("left: " + leftAvg + ", right: " + rightAvg);

            // clear the current state
            ctx.clearRect(0, 0, 60, 130);

            // set the fill style
            ctx.fillStyle = gradient;

            // create the meters
            ctx.fillRect(0, 130 - leftAvg, 25, 130);
            ctx.fillRect(30, 130 - rightAvg, 25, 130);
        }
    }

    function getAverageVolume(array) {
        var values = 0;
        var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }

        average = values / length;
        return average;
    }

    function getCurrentSong() {
        return "AudioFiles/" + songChooser.val() + ".mp3";
    }

    songChooser.change(function () {
        var shouldPlay = !sourceNode.mediaElement.paused;
        audio.src = getCurrentSong();
        if (shouldPlay) {
            sourceNode.mediaElement.play();
        }
    });
}();