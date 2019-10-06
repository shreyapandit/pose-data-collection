## The HPE data collection tool

#### Pre-installation

Configure the data collection parameters in the file `pose-data-collection/public/js/config.js`

Edit the below block to provide Name and Session ID to be used by the app. Please separate using underscores. You can add the Name, Session ID and snippetLength (how long do you want each video to be. Used to collect skeleton data over that many milliseconds)


```       
        //Please put name and session id joined by _ for example Shreya_Pandit
        "name": "Test_User",
        "sessionID": "Session_2",
        "snippetLength": 8000,
        "date": Date.now()
```


1. Make sure the Kinect SDK is installed and test the Kinect is connected and working using using Kinect studio. If it is connected, you should see a live view from the Kinect in Kinect studio.

2. cd into the directory where the project exists, and run npm install

3. To run the app, start the server as follows: `node index_and_color.js`

4. Open a chrome browser at port 8003: https://localhost:8003. You should see a skeleton version of yourself overlaid on the RGB scene. 

3. Once the subject is in position, Click "Start". This will start saving RGB data as raw BMP files for every frame received. Each frame will have a timestamp acssociated with it. The Skeletal data is saved as burst of N seconds, as a txt file. Both data are saved under `pose-data-collection/data_NameInConfig_SessionIdInConfig/`

4. Once data is collected, click "Stop".

5. Repeat Step 3 and 4 as many number of times as you wish.

4. Run ```addheadertobmp.py``` python script can be run on the data_NameInConfig_SessionIdInConfig/ folder to convert frames to viewable BMPS. (Example command: python addheadertobmp.py data_NameInConfig_SessionIdInConfig/ out_dir/ )

#### Note:
- Close out the server as soon as you are done because a lot of data is saved when tracking is on.
