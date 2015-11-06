var Tinkerforge = require('tinkerforge');

var HOST = 'localhost';
var PORT = 4223;

var ipcon = new Tinkerforge.IPConnection(); // Create IP connection
var piezo = new Tinkerforge.BrickletPiezoSpeaker("sAk", ipcon); // Create device object
var motionDetector = new Tinkerforge.BrickletMotionDetector("sKj", ipcon);
var servo = new Tinkerforge.BrickServo("6kM6oJ", ipcon)
var nfcRFID = new Tinkerforge.BrickletNFCRFID("uw2", ipcon)

var tagType = 0;

ipcon.connect(HOST, PORT,
    function (error) {
        console.log('Error: ' + error);
    }
); // Connect to brickd
// Don't use device before ipcon is connected

ipcon.on(Tinkerforge.IPConnection.CALLBACK_CONNECTED,
    function (connectReason) {
        // Make 2 second beep with a frequency of 1kHz
        servo.enablePositionReachedCallback();
        servo.setVelocity(0, 20000);
        servo.setPulseWidth(0, 1000, 2500);

        motionDetector.on(Tinkerforge.BrickletMotionDetector.CALLBACK_MOTION_DETECTED, function () {
            piezo.beep(2000, 1000);
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
            }, 5000)
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
            )
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