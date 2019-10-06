var scalingFactor = ((640*1080)/1920);
console.log(scalingFactor);

var socket = io.connect('/');
var canvas = document.getElementById('bodyCanvas');
var ctx = canvas.getContext('2d');


var colorProcessing = false;
var colorWorkerThread = new Worker("js/colorWorker.js");

colorWorkerThread.addEventListener("message", function (event) {
    if(event.data.message === 'imageReady') {
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
let jointType = Array.from(Array(25).keys());
//canvas dimension
let width = canvas.width;
let height = canvas.height;
let radius = 3; //radius of joint circle

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

function drawBody(parameters, color, jointColor, drawCircle = true) {

    let body = parameters;
    jointType.forEach(function (joint) {
        // console.log(jointType)
        drawJoints({
            cx: body.joints[joint].colorX * width,
            cy: body.joints[joint].colorY * scalingFactor, //height *(scalingFactor)
            color: "red"
        }, ctx);
    });

}

//function that draws each joint as a yellow round dot
function drawJoints(parameters, ctx) {

    let cx = parameters.cx;
    let cy = parameters.cy;
    let color = parameters.color;

    for( let jointIndex in jointType){
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2); //radius is a global variable defined at the beginning
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
}


var timeLastPushed = Date.now();
var count = 1;

socket.on('bodyFrame', function (bodyFrame) {

    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    var index = 0;
    bodyFrame.bodies.forEach(function (body) {
        if (body.tracked) {

            if ((Date.now() - timeLastPushed) > 5000) {
                //Approximately between 10 and 11 seconds have passed since last frame was pushed
                drawBody(body, "#ff00ff", commonBlue);
                console.log("Adding new bodyframes....")

                timeLastPushed = Date.now();
            } else {

                drawBody(body, liveBodyColor, commonBlue);
            }
            index++;
        }
    });
});


socket.on('colorFrame', function(imageBuffer){
    if(!colorProcessing) {
        colorProcessing = true;
        colorWorkerThread.postMessage({ "message": "processImageData", "imageBuffer": imageBuffer });
    }
});

