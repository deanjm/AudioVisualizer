var AudioTag = function () {
    var audio, context, sourceNode,
        splitter, analysers = [], channelNames,
        javaScriptNode,
        songChooser, chart, brushes,
        seriesType, thickness, maxPoints = 50, data = [];

    function init() {
        songChooser = $('#songChooser');
        chart = $('#chart');

        initAudioTag();
        context = new AudioContext();

        channelNames = ["Left", "Right", "SurroundLeft", "SurroundRight", "Center", "LFE"];
        initAudioNodes();

        brushes = ["red", "orange", "yellow", "lime", "blue", "magenta"];
        seriesType = "spline";
        thickness = 3;

        for (var i = 0; i < maxPoints; i++) {
            data[i] = { Label: "", Left: 0, Right: 0, SurroundLeft: 0, SurroundRight: 0, Center: 0, LFE: 0 };
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

        sourceNode = context.createMediaElementSource(audio);
        splitter = context.createChannelSplitter();

        sourceNode.connect(splitter);

        for (var i = 0; i < 6; i++) {
            var analyser = context.createAnalyser();
            analyser.smoothingTimeConstant = 0.5;
            analyser.fftSize = 512;

            splitter.connect(analyser, i, 0);
            analysers[i] = analyser;
        }

        //splitter.connect(leftAnalyser, 0, 0);
        //splitter.connect(rightAnalyser, 1, 0);

        analysers[0].connect(javaScriptNode);

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
                maximumValue: 170,
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
            {
                name: "Left",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "Left",
                title: "Left",
                thickness: thickness
            },
            {
                name: "Right",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "Right",
                title: "Right",
                thickness: thickness
            },
            {
                name: "SurroundLeft",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "SurroundLeft",
                title: "Surround Left",
                thickness: thickness
            },
            {
                name: "SurroundRight",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "SurroundRight",
                title: "Surround Right",
                thickness: thickness
            },
            {
                name: "Center",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "Center",
                title: "Center",
                thickness: thickness
            },
            {
                name: "LFE",
                type: seriesType,
                xAxis: "xAxis",
                yAxis: "yAxis",
                valueMemberPath: "LFE",
                title: "Low Frequency Effects",
                thickness: thickness
            }
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
            //var leftData = calculateDataValuesFromArray(leftArray);

            //// get the average for the second channel
            //var rightArray = new Uint8Array(rightAnalyser.frequencyBinCount);
            //rightAnalyser.getByteFrequencyData(rightArray);
            //var rightData = calculateDataValuesFromArray(rightArray);
            var newPoint = { Label: "", Left: 0, Right: 0, SurroundLeft: 0, SurroundRight: 0, Center: 0, LFE: 0 };

            for (var i = 0; i < analysers.length; i++) {
                var currAnalyser = analysers[i];
                var valueArray = new Uint8Array(currAnalyser.frequencyBinCount);
                currAnalyser.getByteFrequencyData(valueArray);
                var average = getAverageVolume(valueArray);
                var channelName = channelNames[i];

                newPoint[channelName] = average;
            }

            console.log("left: " + newPoint.Left + ", right: " + newPoint.Right);

            //var newPoint = {
            //    Label: "",
            //    Left: leftData.Average,
            //    Right: rightData.Average,
            //    SurroundLeft: leftData.Max,
            //    SurroundRight: rightData.Max,
            //    Center: leftData.Min,
            //    LFE: rightData.Min
            //};

            drawPoint(newPoint);
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