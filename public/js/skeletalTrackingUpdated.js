var scalingFactor = ((640*1080)/1920);
console.log(scalingFactor);
let canSave = false;

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


let liveBodyColor = "#7BE39F";
let commonBlue = "#1E89FB";
let jointType = Array.from(Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 20));

//canvas dimension
let width = canvas.width;
let height = canvas.height;
let radius = 3; //radius of joint circle


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

socket.on('bodyFrame', function (bodyFrame) {
    var index = 0;
    bodyFrame.bodies.forEach(function (body) {

        if (body.tracked) {
            drawBody(body, liveBodyColor, commonBlue);
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

function toggleSave() {
    canSave = (!canSave);
    console.log("cansave: " + canSave);
    socket.emit("mytoggle", canSave)
    document.getElementById("toggleSave").innerHTML = canSave ? "Stop" : "Start";
}