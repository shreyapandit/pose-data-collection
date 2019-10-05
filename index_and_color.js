var Kinect2 = require('kinect2'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);
    zlib = require('zlib');
    var fs = require("fs");
    require( './js/pako.inflate.min.js');

var config = require( './public/js/config.js');
var frames = [];
var dir = 'data_'+ config.name + "_" + config.sessionID + '/' ;


console.log(config);

var kinect = new Kinect2();


var compression = 3;

var origWidth = 1920;
var origHeight = 1080;
var origLength = 4 * origWidth * origHeight;
var compressedWidth = origWidth / compression;
var compressedHeight = origHeight / compression;
var resizedLength = 4 * compressedWidth * compressedHeight;
//we will send a smaller image (1 / 10th size) over the network
var resizedBuffer = new Buffer(resizedLength);
var compressing = false;
var count = 0


if (kinect.open()) {

    server.listen(8003);
    console.log('Server listening on port 8003');
    console.log('Point your browser to http://localhost:8003');

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/index_and_color.html');
    });

    var timeLastPushed = Date.now();

    kinect.on('bodyFrame', function(bodyFrame){
    	io.sockets.emit('bodyFrame', bodyFrame);
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        var index = 0;
        bodyFrame.bodies.forEach(function (body) {
            if (body.tracked) {

                if ((Date.now() - timeLastPushed) > 5000) {
                    //Approximately between 10 and 11 seconds have passed since last frame was pushed
                    // drawBody(body, "#ff00ff", commonBlue);
                    console.log("Adding new bodyframes....")
                    // frames.push(body);

                    // html2canvas(document.querySelector("#test")).then(function (canvas2) {
                    //     // Export the canvas to its data URI representation
                    //     var a = document.createElement('a');
                    //     download('skeleton_' + config.name + "_" + config.sessionID + "_" + Date.now(), JSON.stringify(frames))
                    //
                    //     count++;
                    // });

                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    fs.writeFile(dir + 'skeleton_' + Date.now(), JSON.stringify(frames), (err) => {
                        // throws an error, you could also catch it here
                        if (err) throw err;

                        // success case, the file was saved
                        console.log('skeleton saved!');
                    });

                    timeLastPushed = Date.now();
                } else {
                    bodyFrame["timestamp"] = Date.now();
                    frames.push(bodyFrame);
                    // drawBody(body, liveBodyColor, commonBlue);
                }
                index++;
            }
        });
    });

    kinect.on('colorFrame', function(data){
        count++;
        // console.log("saving frame as bitmap");
        // var bmpData = bmp.decode(data);


        // console.log(data)
        //compress the depth data using zlib
        if(!compressing) {
            compressing = true;
            //data is HD bitmap image, which is a bit too heavy to handle in our browser
            //only send every x pixels over to the browser
            var y2 = 0;
            for(var y = 0; y < origHeight; y+=compression) {
                y2++;
                var x2 = 0;
                for(var x = 0; x < origWidth; x+=compression) {
                    var i = 4 * (y * origWidth + x);
                    var j = 4 * (y2 * compressedWidth + x2);
                    resizedBuffer[j] = data[i];
                    resizedBuffer[j+1] = data[i+1];
                    resizedBuffer[j+2] = data[i+2];
                    resizedBuffer[j+3] = data[i+3];
                    x2++;
                }
            }

            fs.writeFileSync(dir + 'rgb'+  "_" + Date.now() +'.bmp', data);

            var buffer = data.toString('base64');
            zlib.deflate(resizedBuffer, function(err, result){
                if(!err) {
                    var buffer = result.toString('base64');

                    io.sockets.sockets.forEach(function(socket){


                        socket.volatile.emit('colorFrame', buffer);
                    });
                }
                compressing = false;
            });
        }
    });

    kinect.openColorReader();
    kinect.openBodyReader();
}

app.use(express.static(__dirname + '/public'));

