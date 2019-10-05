
var frames = [];

var socket = io.connect('/');
var canvas = document.getElementById('bodyCanvas');
var ctx = canvas.getContext('2d');

var rgbcanvas = document.getElementById('rgbCanvas');
// var rgbctx = rgbcanvas.getContext('2d');

var colorProcessing = false;
var colorWorkerThread = new Worker("js/colorWorker.js");

colorWorkerThread.addEventListener("message", function (event) {
    if(event.data.message === 'imageReady') {
        // console.log(event.data.imageData);
        ctx.putImageData(event.data.imageData, 0, 0);
        colorProcessing = false;
    }
});

colorWorkerThread.postMessage({
    "message": "setImageData",
    "imageData": ctx.createImageData(canvas.width, canvas.height)
});
// var colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
let liveBodyColor = "#7BE39F";
let commonBlue = "#1E89FB";
let jointType = [6, 5, 4, 2, 8, 9, 10, 9, 8, 2, 3, 2, 1, 0, 12, 13, 14, 13, 12, 0, 16, 17, 18];//remove handtips and feet
const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
//canvas dimension
let width = canvas.width;
let height = canvas.height;
let radius = 9; //radius of joint circle
let circle_radius = 30; //radius of calibration circle

// handstate circle size
var HANDSIZE = 20;

// closed hand state color
var HANDCLOSEDCOLOR = "red";

// open hand state color
var HANDOPENCOLOR = "green";

// lasso hand state color
var HANDLASSOCOLOR = "blue";

function updateHandState(handState, jointPoint) {
    switch (handState) {
        case 3:
            drawHand(jointPoint, HANDCLOSEDCOLOR);
            break;

        case 2:
            drawHand(jointPoint, HANDOPENCOLOR);
            break;

        case 4:
            drawHand(jointPoint, HANDLASSOCOLOR);
            break;
    }
}

function drawHand(jointPoint, handColor) {
    // draw semi transparent hand cicles
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.fillStyle = handColor;
    ctx.arc(jointPoint.depthX * 512, jointPoint.depthY * 424, HANDSIZE, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1;
}

function drawBody(parameters, color, jointColor, drawCircle = true) {

    let body = parameters;
    jointType.forEach(function (jointType) {
        drawJoints({
            cx: body.joints[jointType].depthX * width,
            cy: body.joints[jointType].depthY * height
        }, ctx, jointColor);
    });
    // if(drawCircle)
    // {
    //  drawCenterCircle({
    // 	 x: width / 2, y: 200, r: circle_radius, nx: body.joints[2].depthX * width, ny: body.joints[2].depthY * height
    //  },ctx);
    // }
    //connect all the joints with the order defined in jointType

    // ctx.beginPath();
    // ctx.moveTo(body.joints[7].depthX * width, body.joints[7].depthY * height);
    // jointType.forEach(function (jointType) {
    //     ctx.lineTo(body.joints[jointType].depthX * width, body.joints[jointType].depthY * height);
    //     ctx.moveTo(body.joints[jointType].depthX * width, body.joints[jointType].depthY * height);
    //
    // });
    //
    // ctx.lineWidth = 8;
    // ctx.strokeStyle = color;
    // ctx.stroke();
    // ctx.closePath();
}

//function that draws each joint as a yellow round dot
function drawJoints(parameters, color) {

    let cx = parameters.cx;
    let cy = parameters.cy;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2); //radius is a global variable defined at the beginning
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function download(filename, text) {
    // var browser = browser || chrome
    // browser.downloads.download({
    //     url: URL.createObjectURL(new Blob([ "textToSave" ])),
    //     filename: "test/test.txt",
    //     saveAs: false,
    // });

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', "/test/" + filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    frames = [];

    document.body.removeChild(element);
}

var timeLastPushed = Date.now();
var count = 1;

socket.on('bodyFrame', function (bodyFrame) {
    console.log("got bodyframe")

    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    var index = 0;
    bodyFrame.bodies.forEach(function (body) {
        if (body.tracked) {

            if ((Date.now() - timeLastPushed) > 5000) {
                //Approximately between 10 and 11 seconds have passed since last frame was pushed
                drawBody(body, "#ff00ff", commonBlue);
                console.log("Adding new bodyframes....")
                // frames.push(body);

                // html2canvas(document.querySelector("#test")).then(function (canvas2) {
                //     // Export the canvas to its data URI representation
                //     var a = document.createElement('a');
                //     download('skeleton_' + config.name + "_" + config.sessionID + "_" + Date.now(), JSON.stringify(frames))
                //
                //     count++;
                // });

                timeLastPushed = Date.now();
            } else {
                // bodyFrame["timestamp"] = Date.now();
                // frames.push(bodyFrame);
                drawBody(body, liveBodyColor, commonBlue);
            }
            index++;
        }
    });
});

// var socket = io.connect('/');
// var canvas = document.getElementById('bodyCanvas');
// var ctx = canvas.getContext('2d');



socket.on('colorFrame', function(imageBuffer){
    console.log("got colorframe")
    if(!colorProcessing) {
        colorProcessing = true;
        colorWorkerThread.postMessage({ "message": "processImageData", "imageBuffer": imageBuffer });
    }
});

