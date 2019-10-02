### pose-data-collection

1. Make sure the Kinect SDK is installed and test the Kinect is connected and working using using Kinect studio. If it is connected, you should see a live view from the Kinect in Kinect studio.
2. cd into the directory where the project exists, and run npm install
2. For Skeltal tracking, run index.js and open a chrome browser at port 8002: https://localhost:8002. You should see a skeleton version of yourself on the screen. The page should download a txt file aftr every 5 seconds which includes skeletal bodyframes for that 5 second intervals. The file should be keyed by timestaps.
3. For RGB tracking, run color.js and open a chrome browser at port 8000: https://localhost:8000. You should see a live video stream from the Kinect. This app saves raw frames from the Kinect as BMP files in the data/ folder of the project.
4. Run ```addheadertobmp.py``` python script can be run on the data/ folder to convert frames to viewable BMPS. (Example command: python addheadertobmp.py data out_dir/ )

#### Note:
- Close out the RGB tracking as soon as you are done because almost ~3GB data is saved per minute.


#### TODO
- [ ] Currently, we should manually click on "save" for downloading the skeleton json files. This should be fixed and skeleton data should be saved automatically.
- [ ] Aligning the depth, RGB, and skeleton image streams both in terms of resolution as well as distance
- [ ] Adding the stop and start button so that after every 3 repetition of each exercise we can stop the capture
- [ ] Looking into more organized format for folder rather than Download folder such as "Person1-Ex2-Date"
- [ ] Visualizing the Skeleton data on the RGB data because the Skeleton information shown on the Web screen is not very exact.
