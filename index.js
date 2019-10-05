var Kinect2 = require('kinect2'),
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

var kinect = new Kinect2();

if (kinect.open()) {

    server.listen(8002);
    console.log('Server listening on port 8002');
    console.log('Point your browser to http://localhost:8002');

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/public/index.html');
    });

    kinect.on('bodyFrame', function(bodyFrame){
    	io.sockets.emit('bodyFrame', bodyFrame);
    });
    kinect.openBodyReader();
}

app.use(express.static(__dirname + '/public'));

