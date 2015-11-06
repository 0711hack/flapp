var Tinkerforge = require('tinkerforge');

var HOST = 'localhost';
var PORT = 4223;

var ipcon = new Tinkerforge.IPConnection(); // Create IP connection
var piezo = new Tinkerforge.BrickletPiezoSpeaker("sAk", ipcon); // Create device object
var motionDetector = new Tinkerforge.BrickletMotionDetector("sKj", ipcon);
var servo = new Tinkerforge.BrickServo("6kM6oJ", ipcon)

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
            servo.setPosition(0, 9000);
            servo.enable(0);
        });
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


console.log('Press key to exit');
process.stdin.on('data',
    function (data) {
        ipcon.disconnect();
        process.exit(0);
    }
);