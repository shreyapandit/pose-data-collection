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
var count = 0;
let canSave = false;
var kinect = new Kinect2();
var timeLastPushed = 0;

io.on('connection', function (socket) {
    socket.on("mytoggle", (data) => {
        canSave = data;
        console.log("cansave is " + canSave);
        timeLastPushed = Date.now();

    });
});

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

                if (canSave && (Date.now() - timeLastPushed) > config.snippetLength) {
                    console.log("Saving new bodyFrames because Start Clicked and 8 seconds have passed.");
                    if (!fs.existsSync(dir)){
                        fs.mkdirSync(dir);
                    }
                    fs.writeFile(dir + 'skeleton_' + Date.now(), JSON.stringify(frames), (err) => {
                        // throws an error, you could also catch it here
                        if (err) throw err;
                        // success case, the file was saved
                        console.log('skeleton data saved!');
                    });

                    timeLastPushed = Date.now();
                } else {
                    if (canSave) {
                        // console.log("Pushing skeleton frames to buffer because Start is clicked, not persisting yet.");
                        body["timestamp"] = Date.now();
                        frames.push(body);

                    }
                }
                index++;
            }
        });
    });

    kinect.on('colorFrame', function(data){

        count++;

        if (canSave) {
            fs.writeFileSync(dir + 'rgb' + "_" + Date.now() + '.bmp', data);
        }

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


            //send frame to client to display regardless of Start pressed or not.
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

