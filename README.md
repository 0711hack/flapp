#

## Deploy API from Swagger file

```
$ cd aws-apigateway-importer-master/
$ ./aws-api-import.sh --update 1rzcudhqjl --deploy dev ../swagger.json
$ cd ..
```

## Allow Lambda

```
$ aws lambda add-permission --function-name arn:aws:lambda:eu-west-1:004794452776:function:flapp --statement-id s1 --action lambda:invokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:eu-west-1:004794452776:1rzcudhqjl/*"
```

## API

create flap

```
$ curl -vvv -X POST https://1rzcudhqjl.execute-api.eu-west-1.amazonaws.com/dev/v1/flap
```

create a knock

```
$ curl -vvv -X POST -H "Content-Type: application/json" -d '{"image": "test"}'  https://1rzcudhqjl.execute-api.eu-west-1.amazonaws.com/dev/v1/flap/f4835756-7ad4-4b03-9334-04f327785d71/knock
```

approve knock

```
$ curl -vvv -X PUT https://1rzcudhqjl.execute-api.eu-west-1.amazonaws.com/dev/v1/flap/f4835756-7ad4-4b03-9334-04f327785d71/knock/1446974285783
```

decline knock

```
$ curl -vvv -X DELETE https://1rzcudhqjl.execute-api.eu-west-1.amazonaws.com/dev/v1/flap/f4835756-7ad4-4b03-9334-04f327785d71/knock/1446974285783
```

