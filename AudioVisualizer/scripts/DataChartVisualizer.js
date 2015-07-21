var DataChartVisualizers = function () {
    var audio, context, sourceNode,
        splitter, leftAnalyser, rightAnalyser, javaScriptNode,
        $chart, $songGrid, $chartTypeCombo,
        seriesType, maxPoints = 512, data = [], songList = [], dataSource;

    function init() {
        $chart = $('#chart');
        $songGrid = $('#songGrid');
        $chartTypeCombo = $('#chartType');
		
        initAudioTag();
        context = new AudioContext();

        initAudioNodes();

        initGrid();
        initChartTypeCombo();

        seriesType = "area";

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
        leftAnalyser.fftSize = maxPoints * 2;

        rightAnalyser = context.createAnalyser();
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
				{ key: "Duration", headerText: "Duration" },
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

                    $chart.igDataChart("option", "series", [{ name: "Left", remove: true }]);
                    $chart.igDataChart("option", "series", [{ name: "Right", remove: true }]);
                    $chart.igDataChart("option", "series", [{ name: "BubbleRight", remove: true }]);
                    $chart.igDataChart("option", "series", [{ name: "BubbleLeft", remove: true }]);
                    if (seriesType == "bubble") {
                        $chart.igDataChart("option", "series", [
                            {
                                name: "BubbleRight",
                                type: seriesType,
                                xAxis: "numXAxisInv",
                                yAxis: "bubbleYAxis",
                                xMemberPath: "Bucket",
                                yMemberPath: "Right",
                                fillMemberPath: "Right",
                                radiusMemberPath: "Right",
                                labelMemberPath: "Bucket",
                                markerType: "pentagram",
                                markerOutline: "transparent",
                                title: "Right",
                                fillScale: {
                                    type: "value",
                                    brushes: ["blue", "green", "yellow"],
                                    minimumValue: 0,
                                    maximumValue: 256
                                }
                            },
                            {
                            name: "BubbleLeft",
                            type: seriesType,
                            xAxis: "numXAxis",
                            yAxis: "bubbleYAxis",
                            xMemberPath: "Bucket",
                            yMemberPath: "Left",
                            fillMemberPath: "Left",
                            radiusMemberPath: "Left",
                            labelMemberPath: "Bucket",
                            title: "Left",
                            markerType: "pentagram",
                            markerOutline: "transparent",
                            fillScale: {
                                type: "value",
                                brushes: ["red", "orange", "yellow"],
                                minimumValue: 0,
                                maximumValue: 256
                            }
                        }
                        ]);
                    }
                    else {
                        $chart.igDataChart("option", "series", [{
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
        $chart.igDataChart({
            width: "800px",
            height: "500px",
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
                isInverted: true
            },
            {
                name: "yAxis",
                type: "numericY",
                minimumValue: 0,
                maximumValue: 256,
                labelVisibility: "collapsed"
            },
            {
                name: "bubbleYAxis",
                type: "numericY",
                minimumValue: 0,
                maximumValue: maxPoints,
                labelVisibility: "collapsed"
            },
            {
                name: "numXAxis",
                type: "numericX",
                minimumValue: -30,
                maximumValue: maxPoints,
                labelVisibility: "collapsed"
            },
            {
                name: "numXAxisInv",
                type: "numericX",
                minimumValue: -30,
                maximumValue: maxPoints,
                labelVisibility: "collapsed",
                isInverted: true
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
            ]
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
            $chart.igDataChart('notifyClearItems', data);
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