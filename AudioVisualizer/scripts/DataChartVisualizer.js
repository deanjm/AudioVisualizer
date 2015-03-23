var DataChartVisualizers = function () {
    var canvas, ctx, audio, image;
    var audioContext, audioBuffer, sourceNode;
    var playing, volumeData;
    var fps = 15;
    var intvMusic = 0;
    var data = [];
    var imageName = "albino";
    var nowPlaying, selectChanged = true, maxPoints = 40, currVisStyle = 0, thickness = 3;
    var insertionPoint = 0, shouldLoop = false;

    var songs = [{ "Name": "Albino", "Value": "albino" },
        { "Name": "Gigue", "Value": "gigue" },
        { "Name": "Tech E Thumper", "Value": "tech e thumper" },
        { "Name": "Sacchrine Love Theme", "Value": "Sacchrine Love Theme" },
        { "Name": "Folk Song", "Value": "Folk Song" },
        { "Name": "Dragonfly", "Value": "Dragonfly" }];

    var brushes = ["red", "orange", "yellow", "lime", "blue", "magenta"];

    var visStyles = [
        { "Name": "Scroll Left", "Value": 0 },
		{ "Name": "Push Out", "Value": 1 },
		{ "Name": "Sweep", "Value": 2 },
		{ "Name": "Bubble", "Value": 3 },
        { "Name": "Radial", "Value": 4 }
    ];

    var seriesType = "spline";

    function init() {
        for (var i = 0; i < maxPoints; i++) {
            data[i] = { Label: "", VolLeft: 0, VolRight: 0, AvgLeft: 0, AvgRight: 0, DeltaLeft: 0, DeltaRight: 0 };
        }
        audioContext = new AudioContext();
        setupAudioNodes();
    }

    init();

    function setupAudioNodes() {
        sourceNode = audioContext.createBufferSource();
        sourceNode.connect(audioContext.destination);
    }

    function setSong() {
        audio = document.getElementById("music");

        if (selectChanged) {
            loadMusic('AudioFiles/' + imageName + '.mp3');
        }
    }

    function loadMusic(soundUrl) {
        var request = new XMLHttpRequest();
        request.open('GET', soundUrl, true);
        request.responseType = 'arraybuffer';

        // when loaded decode the data
        request.onload = function () {
            // decode the data
            audioContext.decodeAudioData(request.response, function (buffer) {
                playing = true;
                selectChanged = false;
                // when the audio is decoded play the sound
                playSound(buffer);
            }, onError);
        }
        request.send();
    }

    function draw() {
        if (!playing && image.complete && audio.readyState >= 4) {
            playing = true;
            volumeData = new VolumeData(image);
            volumeData.gain = 2;
            audio.play();
        }
        if (!playing) { return; }

        if (audio.ended) {
            if (shouldLoop) {
                audio.currentTime = 0;
                audio.play();
            }
            else {
                playing = false;
                clearInterval(intvMusic);
                $("#btnPause").val("Play");
                return;
            }
        }

        var t = audio.currentTime;
        var vol = volumeData.getVolume(t);
        var avgVol = volumeData.getAverageVolume(t - 0.1, t);
        var volDelta = volumeData.getVolume(t - 0.05);
        volDelta.left = vol.left - volDelta.left;
        volDelta.right = vol.right - volDelta.right;

        var newPoint = { Label: "", VolLeft: vol.left, VolRight: vol.right, AvgLeft: avgVol.left, AvgRight: avgVol.right, DeltaLeft: volDelta.left, DeltaRight: volDelta.right, Radius: vol.left * 100 };

        switch (currVisStyle) {
            case 0:
            case 3:
                drawScroll(newPoint);
                break;
            case 1:
            case 4:
                drawPushOut(newPoint);
                break;
            case 2:
                drawSweep(newPoint);
                break;
            default:
                if (playing === true) { togglePlay(); }
        }
    }

    function drawScroll(newPoint) {
        if (data.length == maxPoints) {
            $("#chart").igDataChart('removeItem', 0);
        }
        $("#chart").igDataChart('addItem', newPoint);
    }

    function drawPushOut(newPoint) {
        var midPoint = Math.floor(maxPoints / 2);
        for (var i = 0; i < midPoint; i++) {
            $('#chart').igDataChart('setItem', i, data[i + 1], '');
            var endPoint = (maxPoints - 1) - i;
            $('#chart').igDataChart('setItem', endPoint, data[endPoint - 1], '');
        }
        $('#chart').igDataChart('setItem', midPoint, newPoint, '');
    }

    function drawSweep(newPoint) {
        var itemToUpdate = data[insertionPoint];
        itemToUpdate.VolLeft = newPoint.VolLeft;
        itemToUpdate.VolRight = newPoint.VolRight;
        itemToUpdate.AvgLeft = newPoint.AvgLeft;
        itemToUpdate.AvgRight = newPoint.AvgRight;
        itemToUpdate.DeltaLeft = newPoint.DeltaLeft;
        itemToUpdate.DeltaRight = newPoint.DeltaRight;

        $("#chart").igDataChart("notifySetItem", data, insertionPoint, itemToUpdate, itemToUpdate);

        for (var k = 1; k < 10; k++) {
            if (insertionPoint + k < maxPoints) {
                itemToUpdate = data[insertionPoint + k];
                itemToUpdate.VolLeft = 0;
                itemToUpdate.VolRight = 0;
                itemToUpdate.AvgLeft = 0;
                itemToUpdate.AvgRight = 0;
                itemToUpdate.DeltaLeft = 0;
                itemToUpdate.DeltaRight = 0;

                $("#chart").igDataChart("notifySetItem", data, insertionPoint + k, itemToUpdate, itemToUpdate);
            }
        }

        insertionPoint++;
        if (insertionPoint >= maxPoints) {
            insertionPoint = 0;
        }
    }

    function circle(x, y, r, color) {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }

    $("#chart").igDataChart({
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
            minimumValue: -1,
            maximumValue: 1.25,
            labelVisibility: "collapsed"
        },
        {
            name: "xAxis2",
            type: "numericX",
            minimumValue: 0,
            maximumValue: 1.1,
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
        series: [{
            name: "VolLeft",
            type: seriesType,
            xAxis: "xAxis",
            yAxis: "yAxis",
            valueMemberPath: "VolLeft",
            title: "Vol Left",
            thickness: thickness
        },
        {
            name: "VolRight",
            type: seriesType,
            xAxis: "xAxis",
            yAxis: "yAxis",
            valueMemberPath: "VolRight",
            title: "Vol Right",
            thickness: thickness
        },
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
        {
            name: "DeltaLeft",
            type: seriesType,
            xAxis: "xAxis",
            yAxis: "yAxis",
            valueMemberPath: "DeltaLeft",
            title: "Delta Left",
            thickness: thickness
        },
        {
            name: "DeltaRight",
            type: seriesType,
            xAxis: "xAxis",
            yAxis: "yAxis",
            valueMemberPath: "DeltaRight",
            title: "Delta Right",
            thickness: thickness
        }],
        horizontalZoomable: true,
        verticalZoomable: true,
        windowResponse: "immediate"
    });

    //$("#musicSelect").igCombo({
    //    dataSource: songs,
    //    textKey: "Name",
    //    valueKey: "Value",
    //    width: "200px",
    //    selectedItems: [{ value: "albino" }],
    //    selectionChanged: function (evt, ui) {
    //        imageName = ui.items[0].value;
    //        selectChanged = true;
    //        if (playing) {
    //            clearInterval(intvMusic);
    //            setSong();
    //        }
    //    }
    //});

    //$("#visSelect").igCombo({
    //    dataSource: visStyles,
    //    textKey: "Name",
    //    valueKey: "Value",
    //    width: "200px",
    //    selectedItems: [{ value: 0 }],
    //    selectionChanged: function (evt, ui) {
    //        currVisStyle = ui.items[0].value;
    //        switch (ui.items[0].value) {
    //            case 0:
    //                seriesType = "spline";
    //                break;
    //            case 1:
    //                seriesType = "stepLine";
    //                break;
    //            case 2:
    //                seriesType = "line";
    //                break;
    //            case 3:
    //                seriesType = "bubble";
    //                break;
    //            case 4:
    //                seriesType = "radialLine";
    //                break;
    //            default:
    //                seriesType = "column";
    //        }
    //        swapSeries();
    //    }
    //});

    function swapSeries() {
        var series = $("#chart").igDataChart("option", "series");
        var axes = $("#chart").igDataChart("option", "axes");

        for (var i = 0; i < series.length; i++) {
            if (series[i]) {
                var name = series[i].name,
                title = series[i].title;
                $("#chart").igDataChart("option", "series", [{ name: name, remove: true }]);

                if (seriesType == "bubble") {
                    if (i == 0) {
                        $("#chart").igDataChart("option", "series", [{
                            name: name,
                            type: seriesType,
                            xAxis: "xAxis2",
                            yAxis: "yAxis",
                            xMemberPath: "VolLeft",
                            yMemberPath: "DeltaLeft",
                            radiusMemberPath: "Radius",
                            fillMemberPath: "AvgLeft",
                            markerType: "circle",
                            title: title,
                            fillScale: {
                                type: "value",
                                brushes: brushes,
                                minimumValue: 0,
                                maximumValue: 1.25
                            }
                        }]);
                        $("#legend").hide();
                    }
                }
                else if (seriesType == "radialLine") {
                    $("#chart").igDataChart("option", "series", [{
                        name: name,
                        type: seriesType,
                        angleAxis: "angleAxis",
                        valueAxis: "radiusAxis",
                        valueMemberPath: name,
                        title: title,
                        thickness: thickness
                    }]);
                    $("#legend").show();
                }
                else {
                    $("#chart").igDataChart("option", "series", [{
                        name: name,
                        type: seriesType,
                        xAxis: "xAxis",
                        yAxis: "yAxis",
                        valueMemberPath: name,
                        title: title,
                        thickness: thickness
                    }]);
                    $("#legend").show();
                }
            }
        }
    }

    //$("#btnPause").igButton({
    //    labelText: $("#btnPause").val(),
    //    width: '70px',
    //    click: togglePlay
    //});
    $("#btnPause").click(function () {
        if (playing === true) {
            $("#btnPause").val("Play");
            sourceNode.stop();
            playing = false;
        }
        else {
            setSong();
            $("#btnPause").val("Pause");
        }
    });

    $('#rngFPS').slider({
        max: 30,
        min: 5,
        value: 15,
        slide: function (event, ui) {
            fps = ui.value;
            $('#currValFPS').html('FPS: ' + fps);
            if (playing) {
                clearInterval(intvMusic);
                setSong();
            }
        }
    });

    $('#shouldLoop').click(function () {
        shouldLoop = $(this).is(':checked');
    });

    function playSound(buffer) {
        sourceNode.buffer = buffer;
        sourceNode.start(0);
    }

    function onError(e) {
        console.log(e);
    }
}();