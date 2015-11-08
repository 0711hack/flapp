var Tinkerforge = require('tinkerforge');
var uuid = require('node-uuid');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var fs = require('fs');
var exec = require('child_process').exec;
var https = require('https');
var restify = require('restify');

var HOST = 'localhost';
var PORT = 4223;

var ipcon = new Tinkerforge.IPConnection(); // Create IP connection
var piezo = new Tinkerforge.BrickletPiezoSpeaker("sAk", ipcon); // Create device object
var motionDetector = new Tinkerforge.BrickletMotionDetector("sKj", ipcon);
var servo = new Tinkerforge.BrickServo("6kM6oJ", ipcon);
var nfcRFID = new Tinkerforge.BrickletNFCRFID("uw2", ipcon);

var tagType = 0;

var FLAP_ID = "10a677fb-6847-4596-95a7-325d3ffe7077";

var lastKnock = 0;

var apiClient = restify.createJsonClient({
    url: 'https://1rzcudhqjl.execute-api.eu-west-1.amazonaws.com:443',
    version: '*'
});

var beepTimeout;

ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Error: ' + error);
    }
); // Connect to brickd
// Don't use device before ipcon is connected

function uploadImageToS3(cb) {
    var imageId = uuid.v4() + ".jpg";
    exec("fswebcam -c /home/tf/webcam.conf --save=/tmp/" + imageId, function (error, stdout, stderr) {
        console.log(stdout.toString("utf8"));
        console.log(stderr.toString("utf8"));
        if (error !== null) {
            console.log('exec error: ' + error);
        } else {
            fs.readFile('/tmp/' + imageId, function (err, data) {
                if (err) throw err;
                console.log(data);
                var params = {
                    Bucket: '0711hack-flapp', 
                    Key: imageId,
                    Body: data,
                    ACL: "public-read",
                    ContentType: "image/jpeg"
                };
                s3.putObject(params, function(err, data) {
                    console.log(err, data);
                    cb(imageId);
                });
            });
        }
    });
}

function createKnock(flap) {
    if (lastKnock < (Date.now() - (1000*60))) {
        lastKnock = Date.now();
        uploadImageToS3(function(imageId) {
            apiClient.post('/dev/v1/flap/' + flap + '/knock', {"image": imageId}, function(err, req, res, obj) {
                console.log("CREATE KNOCK");
                console.log('%d -> %j', res.statusCode, res.headers);
                console.log('%j', obj);
                checkKnock(obj.flap, obj.id, 0)
            });
        });
    }
}

function checkKnock(flap, knock, checks) {
    console.log("checkKnock");
    apiClient.get('/dev/v1/flap/' + flap + '/knock/' + knock, function (err, req, res, obj) {
        checks = checks + 1;
        console.log('Server returned: %j', obj);
        if (obj && obj.state === "APPROVED") {
            openDoor();
        } else if (obj && obj.state === "DECLINED") {
            beep();
        } else {
            if (checks < 1200) {
                setTimeout(function() {
                    checkKnock(flap, knock, checks)
                }, 500);
            }
        }
    });
}

function beep() {
    piezo.beep(1000, 1000);
}

function openDoor() {
    servo.setPosition(0, 9000);
    servo.enable(0);
}

function closeDoor() {
    servo.setPosition(0, -9000);
    servo.enable(0);
}


ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    function (connectReason) {
        servo.enablePositionReachedCallback();
        servo.setVelocity(0, 20000);
        servo.setPulseWidth(0, 1000, 2500);

        motionDetector.on(Tinkerforge.BrickletMotionDetector.CALLBACK_MOTION_DETECTED, function () {
            beepTimeout = setTimeout(function(){
                beep();
            }, 10000);
        });

        nfcRFID.requestTagID(Tinkerforge.BrickletNFCRFID.TAG_TYPE_TYPE2);
    }
);

servo.on(Tinkerforge.BrickServo.CALLBACK_POSITION_REACHED,
    function (servoNum, position) {
        if (position === 9000) {
            setTimeout(function() {
                closeDoor();
            }, 5000);
        } else if (position === -9000) {
            servo.disable(servoNum);
        }
    }
);

nfcRFID.on(Tinkerforge.BrickletNFCRFID.CALLBACK_STATE_CHANGED,
    // Callback function for state changed callback
    function (state, idle) {
        if (idle) {
            tagType = (tagType + 1) % 3;
            nfcRFID.requestTagID(tagType);
        }
        if (state == Tinkerforge.BrickletNFCRFID.STATE_REQUEST_TAG_ID_READY) {
            nfcRFID.getTagID(
                function (tagType, tidLength, tid) {
                    // our cat 4, 6, 6, 90, 100, 52, 133
                    if (tid[0] === 4 && tid[1] === 6 && tid[2] === 6 && tid[3] === 90 && tid[4] === 100 && tid[5] === 52 && tid[6] === 133) {
                        clearTimeout(beepTimeout)
                        createKnock(FLAP_ID);
                    }
                },
                function (error) {
                    console.log('Error: ' + error);
                }
            );
        }
    }
);

process.stdin.on('data',
    function (data) {
        ipcon.disconnect();
        process.exit(0);
    }
);
