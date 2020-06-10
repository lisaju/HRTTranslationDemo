// Elisaveta Just (763920, Elisaveta.Just@Student.Reutlingen-University.DE)
// and
// Markus Oster (764614, markus.oster@student.reutlingen-university.de)

//identification of a ibm translator object, with the fitting version number, apikey and url from the ibm cloud
const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');
const languageTranslator = new LanguageTranslatorV3({
  version: '2018-05-01',
  authenticator: new IamAuthenticator({
    apikey: 'o7kUPlyPfnbuvIgP3XRmEd7hPfky82mPOBbDX-tojZRZ',
  }),
  url: 'https://api.eu-de.language-translator.watson.cloud.ibm.com/instances/b19c2b07-f381-42b8-a605-13131815cadd',
});




/**
 * Helper
 * @param {*} errorMessage
 * @param {*} defaultLanguage
 */
 //if an error occured, the language should be set to the default language or english, and an error message is set (defined in the catch blocks below)
function getTheErrorResponse(errorMessage, defaultLanguage) {
  return {
    statusCode: 200,
    body: {
      language: defaultLanguage || 'en',
      errorMessage: errorMessage
    }
  };
}

/**
  *
  * main() will be run when the action is invoked
  *
  * @param Cloud Functions actions accept a single parameter, which must be a JSON object.
  *
  * @return The output of this action, which must be a JSON object.
  *
  */
function main(params) {

  /*
   * The default language to choose in case of an error
   */
   //the efault language is set to english
  const defaultLanguage = 'en';

  return new Promise(function (resolve, reject) {

      try {

          // *******TODO**********
          // - Call the language identification API of the translation service
          // see: https://cloud.ibm.com/apidocs/language-translator?code=node#identify-language
          // - if successful, resolve exactly like shown below with the
          // language that is most probable the best one in the "language" property
          // and the confidence it got detected in the "confidence" property

          // in case of errors during the call resolve with an error message according to the pattern
          // found in the catch clause below

          // test for text field in params
          if (!params.hasOwnProperty('text')){throw 'no text property in JSON';}
		  //test if parameter is a strig
          if (typeof params.text !== "string"){throw 'text field contains no text';}
		  //test if string is n ot empty
          if (0 === params.text.length){throw 'text field is empty';}
		  //test if the sring field is null or undifined
          if (!params.text ){throw 'text field is null or undefined';}
		  //test if the text contains only whitespaces
          if (!params.text.trim()){throw 'text field contains only whitespace';}


          // Change these to switch between test-data and called values:
        	const identifyParams = {
        	  //text: 'Language translator translates text from one language to another'
            //the text is given by the user (-> parameters)
			text: params.text
        	};
        	var maxConfidence = 0;
        	var bestLanguage = "";
          var targetLanguage = "en";
		  //check if the target language is given by the user (-> parameters) otherwise it stays german
          if (params.hasOwnProperty('target')){targetLanguage = params.target;}
          if (params.hasOwnProperty('targetLanguage')){targetLanguage = params.targetLanguage;}
			
			//the language translaotr is called with the given parameters, it saves the detected languages and their confidence in "identifiedLanguages"
			//identifiedLanguages is an object containg the key 'languages', which has an array as a value, that array contains different objects for each detected language
			//for each of these objects there are key value pairs for the language and the confidence with which it was detected
          languageTranslator.identify(identifyParams)

          .then(identifiedLanguages => {
              console.log("Translating: ", identifyParams.text);
              //console.log(JSON.stringify(identifiedLanguages, null, 2
			  //if there were languages detected
              if (identifiedLanguages.result.languages !== null && Symbol.iterator in Object(identifiedLanguages.result.languages)){
				//parse through identifiedLanguages to find the language with the heighest confidence and set it as the best language
				 for (var language of identifiedLanguages.result.languages) {
                		  if(language.confidence > maxConfidence){
                    		  maxConfidence = language.confidence;
                    		  bestLanguage = language.language;
                		  }
                      //console.log("Got language ", language.language, " with confidence ", language.confidence);
                	}
              }
			//if there were no errors, resolve
              resolve({
                  statusCode: 200,
                  body: {
					  //the best language and the confidence are resolved (and also the parameters text and targetLanguage)
                      text: identifyParams.text,
                      language: bestLanguage,
                      targetLanguage: targetLanguage,
                      confidence: maxConfidence,
                  },
                  headers: { 'Content-Type': 'application/json' }
              });
    	   	})
        	.catch(err => {
              console.info('error:', err);
        	});
      } catch (err) {
          var errorMsg = 'Error while initializing the AI service: ' + err;
          console.error(errorMsg);
          resolve(getTheErrorResponse(errorMsg, defaultLanguage));
      }
  });
}
