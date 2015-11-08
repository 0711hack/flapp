var AWS = require('aws-sdk');
var db = new AWS.DynamoDB();
var sns = new AWS.SNS({region: "us-east-1"});
var uuid = require('node-uuid');

function createFlap(event, context) {
    var uid = uuid.v4();
    var params = {
        "Item": {
            "uid": {
                "S": uid
            }
        },
        "TableName": "flapp-flap",
        "ConditionExpression": "attribute_not_exists(uid)"
    };
    db.putItem(params, function(err) {
        if (err) {
            context.fail(err);
        } else {
            context.succeed({"body": {"uid": uid}});
        }
    });
}

function createKnock(event, context) {
    var flap = event.flapid;
    var timestamp = Date.now();
    var image = event.body.image;
    var params = {
        "Item": {
            "flap": {
                "S": flap
            },
            "timestamp": {
                "N": timestamp.toString()
            },
            "image": {
                "S": image
            },
            "state": {
                "S": "CREATED"
            }
        },
        "TableName": "flapp-knock"
    };
    console.log(params);
    sendPushNotification(flap, timestamp, function() {
        db.putItem(params, function(err) {
            if (err) {
                context.fail(err);
            } else {
                context.succeed({"body": {"flap": flap, "timestamp": timestamp}});
            }
        });    
    });
}

function getKnock(event, context) {
    var flap = event.flapid;
    var timestamp = event.knockid;
    var params = {
        "TableName": "flapp-knock",
        "KeyConditionExpression": "flap = :flap AND timestamp = :timestamp",
        "ExpressionAttributeValues": {
            ":flap": {
                "S": flap
            },
            ":timestamp": {
                "N": timestamp
            }
        }
    };
    db.query(params, function(err, data) {
        if (err) {
            context.fail(err);
        } else {
            context.succeed({body: data.Items}); // TODO
        }
    });
}

function sendPushNotification(flap, timestamp, cb) {
    console.log("SEND PUSH NOTIFICATION START");
    var params = { 
        Message: JSON.stringify({
            "default": JSON.stringify({
                "flap": flap, 
                "timestamp": timestamp    
            })
        }), /* required */
        MessageStructure: 'json',
        TopicArn: 'arn:aws:sns:us-east-1:004794452776:flapp_alldevices_MOBILEHUB_1607389038'
    };
    sns.publish(params, function(err, data) {
        if (err) {
            cb(err);
            console.log(err, err.stack); // an error occurred
        } else {
            console.log("SEND PUSH NOTIFICATION SUCCESS");
            cb(undefined, data);
        }
    });
}

sendPushNotification("test", "test", function() {});

exports.handler = function(event, context) {
    console.log(JSON.stringify(event));
    console.log("0.1");
    switch (event.fun) {
        case 'createFlap':
            createFlap(event, context);
            break;
        case 'createKnock':
            createKnock(event, context);
            break;
        case 'getKnock':
            getKnock(event, context);
            break;
        default:
            context.fail(new Error('Unrecognized function ' + event.fun));
            break;
    }    
};