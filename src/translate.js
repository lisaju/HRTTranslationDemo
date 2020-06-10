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
  * main() will be run when teh action is invoked
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
  const defaultLanguage = 'en';

  return new Promise(function (resolve, reject) {

    try {

      // *******TODO**********
      // - Call the language translation API of the translation service
      // see: https://cloud.ibm.com/apidocs/language-translator?code=node#translate
      // - if successful, resolve exatly like shown below with the
      // translated text in the "translation" property,
      // the number of translated words in "words"
      // and the number of characters in "characters".

      // in case of errors during the call resolve with an error message according to the pattern
      // found in the catch clause below

      // pick the language with the highest confidence, and send it back

      // check if detect-language.js threw an error
      if (params.body.hasOwnProperty('errorMessage')){throw params.body.errorMessage.replace("Error while initializing the AI service: ", "");}
      if (!params.body.hasOwnProperty('source')){throw "no source language specified";}
      if (!params.body.hasOwnProperty('target')){throw "no target language specified";}

      const translateParams = {
          text: params.body.text,
          source: params.body.language,
          target: params.body.language_target,
          //modelId: 'en-de',
      };

      languageTranslator.translate(translateParams)
          .then(translationResult => {
              // console.log(JSON.stringify(translationResult, null, 2));
              // resolve(translationResult);
              var translatedText = translationResult.result.translations.shift();
              console.log("Translation: ", translatedText.translation);
              // resolve(translationResult);

              resolve({
                statusCode: 200,
                body: {
                  translations: translatedText.translation,
                  words: translationResult.result.word_count,
                  characters: translationResult.result.character_count,
                },
                headers: { 'Content-Type': 'application/json' }
              });
          })
          .catch(err => {
              console.log('error:', err);
          }
      );

    } catch (err) {
        var errorMsg = 'Error while initializing the AI service: ' + err;
        console.error(errorMsg);
        resolve(getTheErrorResponse(errorMsg, defaultLanguage));
    }
  });
}
