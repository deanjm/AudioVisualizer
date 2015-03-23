var playAudio = function () {
    // Source: http://www.smartjava.org/content/exploring-html5-web-audio-visualizing-sound
    // check if the default naming is enabled
    if (!window.AudioContext) {
        alert('No AudioContext found');
    }
    var context = new AudioContext();
    var audioBuffer;
    var sourceNode, audioSource;
    var audioReady = false;

    // Load the sound
    function init() {
        setupAudioNodes();
        loadSound('AudioFiles/Albino.mp3');
    }
    init();

    function setupAudioNodes() {
        // create a buffer source node
        sourceNode = context.createBufferSource();

        // and connect to destination
        sourceNode.connect(context.destination);

        var audioElem = document.querySelector('#audioPlayer');
        audioSource = context.createMediaElementSource(audioElem);
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
                audioBuffer = buffer;
            }, onError);
        }
        request.send();
    }

    function playSound(buffer) {
        audioSource.mediaElement.play();
        //sourceNode.buffer = buffer;
        //sourceNode.start(0);
    }

    // log if an error occurs
    function onError(e) {
        console.log(e);
    }

    $('#togglePlay').click(waitToPlay);

    function waitToPlay() {
        if (audioBuffer) {
            playSound(audioBuffer);
        }
        else {
            setTimeout(waitToPlay, 100);
        }
    }
}();