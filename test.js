// status fields and start button in UI
  var phraseDiv;
  var startRecognizeOnceAsyncButton;

  // subscription key and region key for speech services.
  var subscriptionKey, regionKey;
  var authorizationToken;
  var SpeechSDK;
  var recognizer;

  document.addEventListener("DOMContentLoaded", function () {
    startRecognizeOnceAsyncButton = document.getElementById("startRecognizeOnceAsyncButton");
    subscriptionKey = '2251de4451724f73b7fbe7730d151131';
    regionKey = 'westeurope';
    phraseDiv = document.getElementById("phraseDiv");
    
    var responseMessages = {
      0: "all good",
      1: "sorry, i couldnt understand the team you would like to bet on, please repeat",
      2: "how much would you like to bet",
      99: "Sorry, could not understand. try again."
    };

    startRecognizeOnceAsyncButton.addEventListener("click", function () {
      startRecognizeOnceAsyncButton.disabled = true;
      phraseDiv.innerHTML = "";

      // if we got an authorization token, use the token. Otherwise use the provided subscription key
      var speechConfig;
      if (authorizationToken) {
        speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(authorizationToken, regionKey);
      } else {
        if (subscriptionKey === "" || subscriptionKey === "subscription") {
          alert("Please enter your Microsoft Cognitive Services Speech subscription key!");
          return;
        }
        speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, regionKey);
      }

      speechConfig.speechRecognitionLanguage = "en-US";
      var audioConfig  = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      recognizer.recognizeOnceAsync(
        function (result) {
          startRecognizeOnceAsyncButton.disabled = false;
          phraseDiv.innerHTML += result.text;
          window.console.log(result);
          
          
          
          
          recognizer.close();
          recognizer = undefined;
          
          var parsedResult = parseInput(result.text);
          
          window.console.log(parsedResult);
          
          var err = validateResponse(parsedResult);
          
          window.console.log("err:" + err);
          
          if(err == 0){
            phraseDiv.innerHTML += " ** return: " + err;
          }
            
          
        },
        function (err) {
          startRecognizeOnceAsyncButton.disabled = false;
          phraseDiv.innerHTML += err;
          window.console.log(err);

          recognizer.close();
          recognizer = undefined;
        });
    });

    if (!!window.SpeechSDK) {
      SpeechSDK = window.SpeechSDK;
      startRecognizeOnceAsyncButton.disabled = false;

      document.getElementById('content').style.display = 'block';
      document.getElementById('warning').style.display = 'none';

      // in case we have a function for getting an authorization token, call it.
      if (typeof RequestAuthorizationToken === "function") {
          RequestAuthorizationToken();
      }
    }
    
    
    function findAmount(words) {
    var BreakException = {};
    var amount = '';
    try {
        words.forEach(function(word, i) {
            p = parseInt(word)
            if (!isNaN(p) && p > 0) {
                amount = p
            }

        });
    } catch (e) {
        if (e !== BreakException) throw e;
    }
    return amount
}

    function isDayName(name) {
        return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].includes(name);
    }
    
    function getTeam(words) {
        var BreakException = {};
        var on = false;
        var team = "";
    
        try {
            words.forEach(function(word, i) {
                if (word == "on") {
                    on = true;
                } else if (word[0] === word[0].toUpperCase() && on && !isDayName(word)) {
                    team = word
                    if (words[i + 1] != undefined && words[i + 1][0] === words[i + 1][0].toUpperCase()) {
                        team += " " + words[i + 1];
                    }
                    throw BreakException
                }
    
            });
        } catch (e) {
            if (e !== BreakException) throw e;
        }
    
        return team
    }
    
    function getCondition(text) {
        var condition = "win"
        if (text.indexOf("draw") !== -1) {
            condition = "draw"
        } else if (text.indexOf("lose") !== -1) {
            condition = "lose"
        }
    
        return condition;
    }
    
    
    function parseInput(text) {
        if (text[text.length-1] === ".")
text = text.slice(0,-1);
        var splitted = text.split(" ");
        response = {}
        response.amount = findAmount(splitted);
        response.team = getTeam(splitted);
        response.condition = getCondition(text);
        return response;
    };
    
    function validateResponse(response){
      if(!response || typeof response == 'undefined')
        return 99;
      else if(response.team === "")
        return 1;
      else if(response.amount === "" || response.amount == 0)
        return 2;
      else return 0;
    }
    
    
    
  });
