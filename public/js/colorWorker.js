// -----------------------------------------------------------------------
// Inspired by KinectWorker-1.8.0.js from the 1.8 Microsoft SDK.
// -----------------------------------------------------------------------

(function(){
    console.log("beginning....")
    importScripts('pako.inflate.min.js');
    var imageData;

    function init() {
      console.log("init worker....")

        addEventListener('message', function (event) {

            switch (event.data.message) {
                case "setImageData":
                    console.log("add messages 1....")
                    imageData = event.data.imageData;
                    break;
                case "processImageData":
                  console.log("add messages 2....")
                  processImageData(event.data.imageBuffer);
                  break;
            }
        });
    }

    function processImageData(compressedData) {
      console.log("processImageData....")

        console.log("in process image data")
        var imageBuffer = pako.inflate(atob(compressedData));
        var pixelArray = imageData.data;
        var newPixelData = new Uint8Array(imageBuffer);
        var imageDataSize = imageData.data.length;
        for (var i = 0; i < imageDataSize; i++) {
            imageData.data[i] = newPixelData[i];
        }
        self.postMessage({ "message": "imageReady", "imageData": imageData });
    }

    init();
})();
