var AudioTag = function () {
    var audio, context, sourceNode,
        splitter, leftAnalyser, rightAnalyser, analyser,
        javaScriptNode,
        songChooser, chart, brushes,
        seriesType, thickness, maxPoints = 256, data = [];

    function init() {
        songChooser = $('#songChooser');
        chart = $('#chart');

        initAudioTag();
        context = new AudioContext();
        
        initAudioNodes();

        brushes = ["red", "orange", "yellow", "lime", "blue", "magenta"];
        seriesType = "spline";
        thickness = 3;

        for (var i = 0; i < maxPoints; i++) {
            data[i] = { Label: "", AvgLeft: 0, AvgRight: 0 };
        }
        createChart();
    }

    function initAudioTag() {
        audio = document.getElementById('audio');
        audio.src = getCurrentSong();
    }

    function initAudioNodes() {
        javaScriptNode = context.createScriptProcessor(2048, 1, 1);
        javaScriptNode.connect(context.destination);

        //leftAnalyser = context.createAnalyser();
        //leftAnalyser.smoothingTimeConstant = 0.5;
        //leftAnalyser.fftSize = 1024;

        //rightAnalyser = context.createAnalyser();
        //rightAnalyser.smoothingTimeConstant = 0.5;
        //rightAnalyser.fftSize = 1024;
        analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0.3;
        analyser.fftSize = 512;

        sourceNode = context.createMediaElementSource(audio);
        //splitter = context.createChannelSplitter();

        //sourceNode.connect(splitter);

        //splitter.connect(leftAnalyser, 0, 0);
        //splitter.connect(rightAnalyser, 1, 0);

        //leftAnalyser.connect(javaScriptNode);

        //sourceNode.connect(context.destination);
        sourceNode.connect(analyser);
        analyser.connect(javaScriptNode);
        sourceNode.connect(context.destination);
    }

    function createChart() {
        chart.igDataChart({
            width: "600px",
            height: "600px",
            dataSource: data,
            defaultInteraction: "none",
            brushes: brushes,
            gridMode: "none",
            plotAreaBackground: "black",
            legend: { element: "legend", width: "100" },
            axes: [{
                name: "xAxis",
                type: "categoryX",
                label: "Label",
                labelVisibility: "collapsed"
            },
            {
                name: "yAxis",
                type: "numericY",
                minimumValue: 0,
                maximumValue: 200,
                labelVisibility: "collapsed"
            },
            {
                name: "xAxis2",
                type: "numericX",
                minimumValue: 0,
                maximumValue: 130,
                labelVisibility: "collapsed"
            },
            {
                name: "angleAxis",
                type: "categoryAngle",
                label: "Label",
                labelVisibility: "collapsed"
            },
            {
                name: "radiusAxis",
                type: "numericRadius",
                maximumValue: 1.25,
                minimumValue: -1,
                labelVisibility: "collapsed"
            }],
            series: [
            //{
            //    name: "VolLeft",
            //    type: seriesType,
            //    xAxis: "xAxis",
            //    yAxis: "yAxis",
            //    valueMemberPath: "VolLeft",
            //    title: "Vol Left",
            //    thickness: thickness
            //},
            //{
            //    name: "VolRight",
            //    type: seriesType,
            //    xAxis: "xAxis",
            //    yAxis: "yAxis",
            //    valueMemberPath: "VolRight",
            //    title: "Vol Right",
            //    thickness: thickness
            //},
            {
                name: "AvgLeft",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "AvgLeft",
                title: "Avg Vol Left",
                thickness: thickness
            },
            {
                name: "AvgRight",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "AvgRight",
                title: "Avg Vol Right",
                thickness: thickness
            },
            //{
            //    name: "DeltaLeft",
            //    type: seriesType,
            //    xAxis: "xAxis",
            //    yAxis: "yAxis",
            //    valueMemberPath: "DeltaLeft",
            //    title: "Delta Left",
            //    thickness: thickness
            //},
            //{
            //    name: "DeltaRight",
            //    type: seriesType,
            //    xAxis: "xAxis",
            //    yAxis: "yAxis",
            //    valueMemberPath: "DeltaRight",
            //    title: "Delta Right",
            //    thickness: thickness
            //}
            ],
            horizontalZoomable: true,
            verticalZoomable: true,
            windowResponse: "immediate"
        });
    }

    init();

    javaScriptNode.onaudioprocess = function () {
        if (!sourceNode.mediaElement.paused) {
            //// get the average for the first channel
            //var leftArray = new Uint8Array(leftAnalyser.frequencyBinCount);
            //leftAnalyser.getByteFrequencyData(leftArray);
            //var leftAvg = getAverageVolume(leftArray);
            
            //// get the average for the second channel
            //var rightArray = new Uint8Array(rightAnalyser.frequencyBinCount);
            //rightAnalyser.getByteFrequencyData(rightArray);
            //var rightAvg = getAverageVolume(rightArray);

            //console.log("left: " + leftAvg + ", right: " + rightAvg);

            //var newPoint = { Label: "", AvgLeft: leftAvg, AvgRight: rightAvg }
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);

            for (var i = 0; i < array.length; i++) {
                var newPoint = { Label: "", AvgLeft: array[i] };
                console.log(array[i]);
                drawPoint(newPoint);
            }
        }
    }

    function drawPoint(newPoint) {
        if (data.length == maxPoints) {
            chart.igDataChart('removeItem', 0);
        }
        chart.igDataChart('addItem', newPoint);
    }

    function getAverageVolume(array) {
        var values = 0;
        var average;

        var length = array.length;
        console.log(length);

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