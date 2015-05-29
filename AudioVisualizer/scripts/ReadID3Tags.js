var ReadID3Tags = function () {
    var audio, context, sourceNode,
        splitter, analysers = [], channelNames,
        javaScriptNode,
        songChooser, chart, brushes,
        seriesType, thickness, maxPoints = 75, data = [], songList = [];

    function init() {
        chart = $('#chart');
        $songGrid = $('#songGrid');

        initAudioTag();
        context = new AudioContext();

        channelNames = ["Left", "Right", "SurroundLeft", "SurroundRight", "Center", "LFE"];
        initAudioNodes();

        initGrid();

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
    }

    function initAudioNodes() {
        javaScriptNode = context.createScriptProcessor(2048, 1, 1);
        javaScriptNode.connect(context.destination);

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

        analysers[0].connect(javaScriptNode);

        sourceNode.connect(context.destination);
    }

    function initGrid() {
        $songGrid.igGrid({
            width: '800px',
            height: '300px',
            autoGenerateColumns: false,
            columns: [
                { key: "Title", headerText: "Title" },
                { key: "Artist", headerText: "Artist" },
                { key: "Album", headerText: "Album" },
                { key: "Genre", headerText: "Genre" },
                { key: "Year", headerText: "Year" },
                { key: "Comment", headerText: "Comment" },
                { key: "URL", hidden: true }
            ],
            primaryKey: 'Title',
            features: [
                {
                    name: 'Selection',
                    mode: 'row',
                    multipleSelection: false,
                    rowSelectionChanged: function (evt, ui) {
                        var record = $songGrid.igGrid('findRecordByKey', ui.row.id);
                        var shouldPlay = !sourceNode.mediaElement.paused;
                        audio.src = record.URL;
                        if (shouldPlay) {
                            sourceNode.mediaElement.play();
                        }
                    }
                }
            ],
            dataSource: '/SongInfoService/api/songinfo'
        });
    }

    function createChart() {
        chart.igDataChart({
            width: "800px",
            height: "400px",
            autoMarginWidth: 0,
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
            }
            ],
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
            horizontalZoomable: false,
            verticalZoomable: false,
            windowResponse: "immediate"
        });
    }

    init();

    javaScriptNode.onaudioprocess = function () {
        if (!sourceNode.mediaElement.paused) {
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
}();