var DataChartVisualizers = function () {
    var audio, context, sourceNode,
        splitter, leftAnalyser, rightAnalyser, channelNames,
        javaScriptNode,
        songChooser, chart,
        seriesType, thickness, maxPoints = 2048, data = [], songList = [], dataSource;

    function init() {
        chart = $('#chart');
        $songGrid = $('#songGrid');
        $chartTypeCombo = $('#chartType');
        $dropSongCont = $('#dropSongCont');

        initAudioTag();
        context = new AudioContext();

        channelNames = ["Left", "Right", "SurroundLeft", "SurroundRight", "Center", "LFE"];
        initAudioNodes();

        initGrid();
        initChartTypeCombo();

        seriesType = "area";
        thickness = 3;

        for (var i = 0; i < maxPoints; i++) {
            data[i] = { Bucket: i, Left: 0, Right: 0 };
        }

        dataSource = new $.ig.DataSource({ dataSource: data });
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

        leftAnalyser = context.createAnalyser();
        leftAnalyser.smoothingTimeConstant = 0.5;
        leftAnalyser.fftSize = maxPoints * 2;

        rightAnalyser = context.createAnalyser();
        rightAnalyser.smoothingTimeConstant = 0.5;
        rightAnalyser.fftSize = maxPoints * 2;

        splitter.connect(leftAnalyser, 0, 0);
        splitter.connect(rightAnalyser, 1, 0);

        leftAnalyser.connect(javaScriptNode);
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
                { key: "URL", hidden: true }
            ],
            primaryKey: 'Title',
            features: [
                {
                    name: 'Selection',
                    mode: 'row',
                    multipleSelection: false,
                    rowSelectionChanged: function (evt, ui) {
                        changeSong(ui.row.id);
                        //var record = $songGrid.igGrid('findRecordByKey', ui.row.id);
                        //var shouldPlay = !audio.paused;
                        //audio.src = record.URL;
                        //if (shouldPlay) {
                        //    audio.play();
                        //}
                    }
                }
            ],
            dataSource: '/SongInfoService/api/songinfo'
        });
    }

    function initChartTypeCombo() {
        $chartTypeCombo.igCombo({
            width: "100%",
            mode: "dropdown",
            enableClearButton: false,
            selectionChanged: function (evt, ui) {
                if (ui.items && ui.items.length > 0) {
                    seriesType = ui.items[0].data.value;

                    chart.igDataChart("option", "series", [{ name: "Left", remove: true }]);
                    chart.igDataChart("option", "series", [{ name: "Right", remove: true }]);
                    chart.igDataChart("option", "series", [{ name: "Bubble", remove: true }]);
                    if (seriesType == "bubble") {
                        chart.igDataChart("option", "series", [{
                            name: "Bubble",
                            type: seriesType,
                            xAxis: "numXAxis",
                            yAxis: "yAxis",
                            xMemberPath: "Left",
                            yMemberPath: "Right",
                            fillMemberPath: "Left",
                            radiusMemberPath: "Left",
                            labelMemberPath: "Bucket",
                            markerType: "Circle",
                            fillScale: {
                                type: "value",
                                brushes: ["red", "orange", "yellow"],
                                minimumValue: 0,
                                maximumValue: 256
                            }
                        }]);
                    }
                    else {
                        chart.igDataChart("option", "series", [{
                            name: "Left",
                            type: seriesType,
                            xAxis: "xAxis",
                            yAxis: "yAxis",
                            valueMemberPath: "Left",
                            title: "Left",
                            brush: {
                                type: "linearGradient",
                                colorStops: [
                                    { color: "red", offset: 0 },
                                    { color: "orange", offset: 0.25 },
                                    { color: "yellow", offset: 0.75 }
                                ]
                            }
                        }, {
                            name: "Right",
                            type: seriesType,
                            xAxis: "xAxisInv",
                            yAxis: "yAxis",
                            valueMemberPath: "Right",
                            title: "Right",
                            brush: {
                                type: "linearGradient",
                                colorStops: [
                                    { color: "blue", offset: 0 },
                                    { color: "green", offset: 0.4 },
                                    { color: "yellow", offset: 0.8 }
                                ]
                            }
                        }]);
                    }
                }
            }
        });
    }

    function createChart() {
        chart.igDataChart({
            width: "800px",
            height: "400px",
            autoMarginWidth: 0,
            dataSource: dataSource,
            defaultInteraction: "none",
            outlines: ["transparent"],
            gridMode: "none",
            plotAreaBackground: "black",
            legend: { element: "legend", width: "100" },
            axes: [{
                name: "xAxis",
                type: "categoryX",
                label: "Bucket",
                labelVisibility: "collapsed"
            },
            {
                name: "xAxisInv",
                type: "categoryX",
                label: "Bucket",
                labelVisibility: "collapsed",
                isInverted: "true"
            },
            {
                name: "yAxis",
                type: "numericY",
                minimumValue: 0,
                maximumValue: 256,
                labelVisibility: "collapsed"
            },
            {
                name: "numXAxis",
                type: "numericX",
                minimumValue: 0,
                maximumValue: 256,
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
                brush: {
                    type: "linearGradient",
                    colorStops: [
                        { color: "red", offset: 0 },
                        { color: "orange", offset: 0.25 },
                        { color: "yellow", offset: 0.75 }
                    ]
                }
            },
            {
                name: "Right",
                type: seriesType,
                xAxis: "xAxisInv",
                yAxis: "yAxis",
                valueMemberPath: "Right",
                title: "Right",
                brush: {
                    type: "linearGradient",
                    colorStops: [
                        { color: "blue", offset: 0 },
                        { color: "green", offset: 0.4 },
                        { color: "yellow", offset: 0.8 }
                    ]
                }
            }
            ],
            horizontalZoomable: false,
            verticalZoomable: false,
            windowResponse: "immediate"
        });
    }

    init();

    javaScriptNode.onaudioprocess = function () {
        if (!audio.paused) {
            var leftArray = new Uint8Array(leftAnalyser.frequencyBinCount);
            leftAnalyser.getByteFrequencyData(leftArray);

            var rightArray = new Uint8Array(rightAnalyser.frequencyBinCount);
            rightAnalyser.getByteFrequencyData(rightArray);

            extractSpectrum(leftArray, rightArray);
            chart.igDataChart('notifyClearItems', data);
        }
    }

    audio.addEventListener('ended', function () {
        var selectedRow = $songGrid.igGridSelection("selectedRow");

        if (selectedRow.index < $songGrid.igGrid("allRows").length - 1) {
            $songGrid.igGridSelection("selectRow", selectedRow.index + 1);
            selectedRow = $songGrid.igGridSelection("selectedRow");
            changeSong(selectedRow.id, true);
        }
    });

    $dropSongCont.on('dragover', function (event) {
        event.preventDefault();
        event.stopPropagation();
        //event.originalEvent.dataTransfer.dropEffect = 'copy';
    });

    $dropSongCont.on('drop', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var fileData = event.originalEvent.dataTransfer.getData('audio/mpeg3');
        var file = event.originalEvent.dataTransfer.files[0];
        //audio.src = file.urn || file.name;
        var reader = new FileReader();
        reader.addEventListener('load', function (event) {
            audio.src = event.target.result;
        });
        reader.readAsDataURL(file);
    });

    function changeSong(songID, overrideShouldPlay) {
        var record = $songGrid.igGrid('findRecordByKey', songID);
        var shouldPlay = !audio.paused;
        audio.src = record.URL;
        if (shouldPlay || overrideShouldPlay) {
            audio.play();
        }
    }

    function extractSpectrum(leftArray, rightArray) {
        for (var i = 0; i < maxPoints; i++) {
            data[i].Left = leftArray[i];
            data[i].Right = rightArray[i];
        }
    }
}();