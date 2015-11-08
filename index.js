var Tinkerforge = require('tinkerforge');
var uuid = require('node-uuid');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var fs = require('fs');
var exec = require('child_process').exec;
var https = require('https');

var HOST = 'localhost';
var PORT = 4223;

var ipcon = new Tinkerforge.IPConnection(); // Create IP connection
var piezo = new Tinkerforge.BrickletPiezoSpeaker("sAk", ipcon); // Create device object
var motionDetector = new Tinkerforge.BrickletMotionDetector("sKj", ipcon);
var servo = new Tinkerforge.BrickServo("6kM6oJ", ipcon);
var nfcRFID = new Tinkerforge.BrickletNFCRFID("uw2", ipcon);

var isNotMyCat = false;

var tagType = 0;

ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Error: ' + error);
    }
); // Connect to brickd
// Don't use device before ipcon is connected

function uploadImageToS3() {
    var id = uuid.v4();
    exec("fswebcam -c /home/tf/webcam.conf --save=/tmp/flapp.jpg", function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            fs.readFile('/tmp/flapp.jpg', function (err, data) {
                if (err) throw err;
                console.log(data);
                var params = {Bucket: '0711hack-flapp', Key: id, Body: data};
                s3.putObject(params, function(err, data) {
                    console.log(err, data);
                });
            });
        }
    });
    return id;
}

function createKnock(imageId) {
    var postData = JSON.stringify({
        "image": imageId
    });

    var options = {
        hostname: '1rzcudhqjl.execute-api.eu-west-1.amazonaws.com',
        port: 443,
        path: '/dev/flap/6fd83fda-9b74-477f-9099-9a92d7bda30f/knock',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };

    var req = https.request(options, function(res) {
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
        res.on('end', function() {
            console.log('No more data in response.');
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(postData);
    req.end();
}

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    function (connectReason) {
        // Make 2 second beep with a frequency of 1kHz
        servo.enablePositionReachedCallback();
        servo.setVelocity(0, 20000);
        servo.setPulseWidth(0, 1000, 2500);

        motionDetector.on(Tinkerforge.BrickletMotionDetector.CALLBACK_MOTION_DETECTED, function () {
            isNotMyCat = true;
            setTimeout(function(){
                if(isNotMyCat === true) {
                    piezo.beep(2000, 1000);
                }
                isNotMyCat = false;
            }, 5000);
            //piezo.beep(2000, 1000);
        });

        nfcRFID.requestTagID(Tinkerforge.BrickletNFCRFID.TAG_TYPE_TYPE2);
    }
);

servo.on(Tinkerforge.BrickServo.CALLBACK_POSITION_REACHED,
    function (servoNum, position) {
        if (position === 9000) {
            setTimeout(function() {
                servo.setVelocity(0, 20000);
                servo.setPosition(0, -9000);
                servo.enable(0);
                createKnock(uploadImageToS3());
            }, 5000);
        } else if (position === -9000) {
            servo.disable(servoNum);
        }
    }
);

nfcRFID.on(Tinkerforge.BrickletNFCRFID.CALLBACK_STATE_CHANGED,
    // Callback function for state changed callback
    function (state, idle) {
        if(idle) {
            tagType = (tagType + 1) % 3;
            nfcRFID.requestTagID(tagType);
        }

        if(state == Tinkerforge.BrickletNFCRFID.STATE_REQUEST_TAG_ID_READY) {
            nfcRFID.getTagID(
                function (tagType, tidLength, tid) {
                    // our cat 4, 6, 6, 90, 100, 52, 133
                    if (tid[0] === 4 && tid[1] === 6 && tid[2] === 6 && tid[3] === 90 && tid[4] === 100 && tid[5] === 52 && tid[6] === 133) {
                        isNotMyCat = false;
                        servo.setPosition(0, 9000);
                        servo.enable(0);
                    } else {
                        piezo.beep(2000, 2000);
                    }
                    console.log(tid);
                },
                function (error) {
                    console.log('Error: ' + error);
                }
            );
        }
    }
);


console.log('Press key to exit');
process.stdin.on('data',
    function (data) {
        ipcon.disconnect();
        process.exit(0);
    }
);
