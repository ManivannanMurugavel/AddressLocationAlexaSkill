var http = require('http');
var https = require('https');
var aws = require('aws-sdk');
var lambda = new aws.Lambda({
  region: 'us-east-1' //change to your region
});
var AlexaDeviceAddressClient = require('./src/AlexaDeviceAddressClient');
//var Intents = require('./src/Intents');
//var Events = require('./src/Events');
//var Messages = require('./src/Messages');
exports.handler = (event, context) => {

const ALL_ADDRESS_PERMISSION = "read::alexa:device:all:address";

const PERMISSIONS = [ALL_ADDRESS_PERMISSION];

  try {

       if (event.session.new) {
      // New Session
     
      console.log("Session Started")
    
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log('LAUNCH REQUEST');
        console.log(event);
      
       
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Hi welcome to E Commerce bot, I will help you to check your latest order status from our e commerce site", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log('INTENT REQUEST')
        switch(event.request.intent.name){
	case "getAddress":

 			console.log(JSON.stringify(event));
            console.log(JSON.stringify(event.context.System.user.permissions.consentToken));
            console.log(JSON.stringify(event.context.System.device.deviceId));
            console.log(JSON.stringify(event));
            var consentToken = event.context.System.user.permissions.consentToken;
            var deviceId = event.context.System.device.deviceId;
            var apiEndpoint = event.context.System.apiEndpoint;
            var path = '/v1/devices/'+deviceId+'/settings/address/countryAndPostalCode';
			console.log(consentToken+"======="+deviceId+"========"+apiEndpoint);
	     	const alexaDeviceAddressClient = new AlexaDeviceAddressClient(apiEndpoint, deviceId, consentToken);
	     	let deviceAddressRequest = alexaDeviceAddressClient.getFullAddress();
    	    console.log("Welcoime rasv "+deviceAddressRequest);


			deviceAddressRequest.then((addressResponse) => {
        	switch(addressResponse.statusCode) {
            case 200:
                console.log("Address successfully retrieved, now responding to user.");
                const address = addressResponse.address;
				console.log(JSON.stringify(address))
				context.succeed(
          			generateResponse(
            			buildSpeechletResponse("Manivannan, Your Country is "+ address.countryCode + "and your zip code is "+address.postalCode, true),
            			{}
          			)
        		)


                break;
            case 204:
				context.succeed(
				          generateResponse(
				            buildSpeechletResponse("Thank You 204", true),
				            {}
				          )
				        )

                // This likely means that the user didn't have their address set via the companion app.
                console.log("Successfully requested from the device address API, but no address was returned.");
                break;
            case 403:
				context.succeed(
				          generateResponse(
				            buildSpeechletResponse("Thank You 403", true),
				            {}
				          )
				        )

                console.log("The consent token we had wasn't authorized to access the user's address.");
                break;
            default:
        }


		context.succeed(
		          generateResponse(
		            buildSpeechletResponse("end", true),
		            {}
		          )
		        )


        console.info("Ending getAddressHandler()");
    });
    


/*	
context.succeed(
          generateResponse(
            buildSpeechletResponse("Thank You", true),
            {}
          )
        )
*/


	   break; 
        //this.emit(":tell", "welcome to ");
	default:
          var option = {"session":event.session,"request":event.request,"applicationId":event.session.application.applicationId,"userId":event.session.user.userId,"applicationAgent":"alexa"};
          console.log(JSON.stringify(option));
          lambda.invoke({
                FunctionName: 'AcceleratorV2',
                Payload: JSON.stringify(option) // pass params
            }, function(error, data) {
            if (error) {
                console.log('error', error);
            }
            if(data.Payload){
		console.log("Success lambda invoke")
                var responseData = JSON.parse(data.Payload);
		console.log(responseData);
                context.succeed(
                generateResponse(
                    buildSpeechletResponse(responseData.speech, true),
                    {}
                )
                )
            }
            });
          }
     
        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log("End Session")
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Thank You", true),
            {}
          )
        )
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}

// Response Funtion
whirldataResponse = (outputText,flag) => {
	context.succeed(
          generateResponse(
            buildSpeechletResponse(outputText, flag),
            {}
          )
        )
}
