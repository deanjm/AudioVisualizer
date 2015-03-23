var volumeMeter = function () {
    // Source: http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
    // check if the default naming is enabled
    if (!window.AudioContext) {
        alert('No AudioContext found');
    }
    var context = new AudioContext();
    var audioBuffer, 
        sourceNode,
        splitter,
        leftAnalyser, rightAnalyser,
        javaScriptNode;

    // get the context from the canvas to draw on
    var ctx = $('#canvas').get()[0].getContext('2d');

    // create a gradient for the fill. Note the strange
    // offset, since the gradient is calculated based on
    // the canvas, note the specific element we draw
    var gradient = ctx.createLinearGradient(0, 0, 0, 130);
    gradient.addColorStop(1, '#000000');
    gradient.addColorStop(0.75, '#ff0000');
    gradient.addColorStop(0.25, '#ffff00');
    gradient.addColorStop(0, '#ffffff');

    // Load the sound
    setupAudioNodes();
    loadSound('AudioFiles/Sacchrine Love Theme.mp3');

    function setupAudioNodes() {
        // setup a JavaScript node
        javaScriptNode = context.createScriptProcessor(2048, 1, 1);
        // connect to destination, else it isn't called
        javaScriptNode.connect(context.destination);

        // setup analysers
        leftAnalyser = context.createAnalyser();
        leftAnalyser.smoothingTimeConstant = 0.3;
        leftAnalyser.fftSize = 1024;

        rightAnalyser = context.createAnalyser();
        rightAnalyser.smoothingTimeConstant = 0.3;
        rightAnalyser.fftSize = 1024;

        // create a buffer source node
        sourceNode = context.createBufferSource();
        splitter = context.createChannelSplitter();

        // connect the source to the splitter
        sourceNode.connect(splitter);

        // connect the outputs from the splitter to the analysers
        splitter.connect(leftAnalyser, 0, 0);
        splitter.connect(rightAnalyser, 1, 0);

        // connect the splitter to the javaScriptNode
        // we use the JavaScript node to draw at a specific interval
        leftAnalyser.connect(javaScriptNode);

        // and connect to destination
        sourceNode.connect(context.destination);
    }

    // Load the specified sound
    function loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // when loaded decode the data
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
    }

    // log if an error occurs
    function onError(e) {
        console.log(e);
    }

    // when the javascript node is called we use the information
    // from the analyser node to draw the volume
    javaScriptNode.onaudioprocess = function () {
        // get the average for the first channel
        var leftArray = new Uint8Array(leftAnalyser.frequencyBinCount);
        leftAnalyser.getByteFrequencyData(leftArray);
        var leftAvg = getAverageVolume(leftArray);

        // get the average for the second channel
        var rightArray = new Uint8Array(rightAnalyser.frequencyBinCount);
        rightAnalyser.getByteFrequencyData(rightArray);
        var rightAvg = getAverageVolume(rightArray);

        // clear the current state
        ctx.clearRect(0, 0, 60, 130);

        // set the fill style
        ctx.fillStyle = gradient;

        // create the meters
        ctx.fillRect(0, 130 - leftAvg, 25, 130);
        ctx.fillRect(30, 130 - rightAvg, 25, 130);
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
}();