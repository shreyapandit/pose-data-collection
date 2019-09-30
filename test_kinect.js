var Kinect2 = require('kinect2');

var kinect = new Kinect2();
var frames = [] ;

//request body frames
kinect.openBodyReader();


if(kinect.open()) {
	console.log("Kinect Opened");
	//listen for body frames
	kinect.on('bodyFrame', function(bodyFrame){

		for(var i = 0;  i < bodyFrame.bodies.length; i++) {
			if(bodyFrame.bodies[i].tracked) {

				if((Date.now()-timeLastReceived)<11000 && (Date.now()-timeLastReceived) >10000){
					//Approximately between 10 and 11 seconds have passed since last frame was pushed
					console.log("Adding new bodyframe")
					frames.push(bodyFrame)
				}
			}
		}
	});

	//close the kinect after 5 seconds
	// setTimeout(function(){
	// 	kinect.close();
	// 	console.log("Kinect Closed");
	// }, 5000);
}
