var playAudio = function () {
    // Source: http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
    // check if the default naming is enabled
    if (!window.AudioContext) {
        alert('No AudioContext found');
    }
    var context = new AudioContext();
    var audioBuffer;
    var sourceNode;

    // Load the sound
    setupAudioNodes();
    loadSound('AudioFiles/Etude 2_0.mp3');

    function setupAudioNodes() {
        // create a buffer source node
        sourceNode = context.createBufferSource();
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
}();