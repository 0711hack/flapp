var AWS = require('aws-sdk');
var db = new AWS.DynamoDB();
var sns = new AWS.SNS({region: "us-east-1"});
var uuid = require('node-uuid');

function mapKnockItem(item) {
  return {
    "id": item.id.N,
    "image": item.image.S,
    "state": item.state.S,
    "flap": item.flap.S
  };
}

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
    var id = Date.now();
    var image = event.body.image;
    var params = {
        "Item": {
            "flap": {
                "S": flap
            },
            "id": {
                "N": id.toString()
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
    sendPushNotification(flap, id, function() {
        db.putItem(params, function(err) {
            if (err) {
                context.fail(err);
            } else {
                context.succeed({"body": {"flap": flap, "id": id}});
            }
        });    
    });
}

function approveKnock(event, context) {
    var flap = event.flapid;
    var knock = event.knockid;
    var params = {
        "Key": {
            "flap": {
                "S": flap
            },
            "id": {
                "N": knock
            }
        },
        AttributeUpdates: {
            "state": {
                Action: "PUT",
                Value: {
                    "S": "APPROVED"    
                }
                
            }
        },
        "TableName": "flapp-knock"
    };
    console.log(params);
    db.updateItem(params, function(err) {
        if (err) {
            context.fail(err);
        } else {
            context.succeed({"body": {"flap": flap, "timestamp": knock}});
        }
    });
}

function declineKnock(event, context) {
    var flap = event.flapid;
    var knock = event.knockid;
    var params = {
        "Key": {
            "flap": {
                "S": flap
            },
            "id": {
                "N": knock
            }
        },
        AttributeUpdates: {
            "state": {
                Action: "PUT",
                Value: {
                    "S": "DECLINED"    
                }
                
            }
        },
        "TableName": "flapp-knock"
    };
    console.log(params);
    db.updateItem(params, function(err) {
        if (err) {
            context.fail(err);
        } else {
            context.succeed({"body": {"flap": flap, "timestamp": knock}});
        }
    });
}

function getKnock(event, context) {
    var flap = event.flapid;
    var knock = event.knockid;
    var params = {
        "TableName": "flapp-knock",
        "Key": {
            "flap": {
                "S": flap
            },
            "id": {
                "N": knock
            }
        }
    };
    db.getItem(params, function(err, data) {
        if (err) {
            context.fail(err);
        } else {
            context.succeed({body: mapKnockItem(data.Item)});
        }
    });
}

function sendPushNotification(flap, knock, cb) {
    console.log("SEND PUSH NOTIFICATION START");
    var params = { 
        Message: JSON.stringify({
            "default": JSON.stringify({
                "flap": flap, 
                "knock": knock    
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
        case 'approveKnock':
            approveKnock(event, context);
            break;
        case 'declineKnock':
            declineKnock(event, context);
            break;
        default:
            context.fail(new Error('Unrecognized function ' + event.fun));
            break;
    }    
};