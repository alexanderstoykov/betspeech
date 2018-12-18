// status fields and start button in UI
var phraseDiv;
var startRecognizeOnceAsyncButton;

// subscription key and region key for speech services.
var subscriptionKey, regionKey;
var authorizationToken;
var SpeechSDK;
var recognizer;

document.addEventListener("DOMContentLoaded", function() {
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

    startRecognizeOnceAsyncButton.addEventListener("click", function() {
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
        var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
        recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(
            function(result) {
                startRecognizeOnceAsyncButton.disabled = false;
                phraseDiv.innerHTML += result.text;
                window.console.log(result);




                recognizer.close();
                recognizer = undefined;

                var parsedResult = parseInput(result.text);
                window.console.log("parsedResult: ", parsedResult);
                var err = validateResponse(parsedResult);
                window.console.log("err:" + err);

                phraseDiv.innerHTML += " /n ** return: " + err;

                if (err == 0) {
                    phraseDiv.innerHTML += "/n Are you sure you want to bet " + parsedResult.amount + " on team " + parsedResult.team;
                    var url = getBetUrl(parsedResult.team, parsedResult.condition, parsedResult.amount)
                    window.location.replace(url)
                } else {
                    phraseDiv.innerHTML += "/n" + responseMessages[err];
                }

            },
            function(err) {
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

        // document.getElementById('content').style.display = 'block';
        //document.getElementById('warning').style.display = 'none';

        // in case we have a function for getting an authorization token, call it.
        if (typeof RequestAuthorizationToken === "function") {
            RequestAuthorizationToken();
        }
    }
});


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
    if (text[text.length - 1] === ".")
        text = text.slice(0, -1);
    var splitted = text.split(" ");
    response = {}
    response.amount = findAmount(splitted);
    response.team = getTeam(splitted);
    response.condition = getCondition(text);
    return response;
};

function validateResponse(response) {
    if (!response || typeof response == 'undefined')
        return 99;
    else if (response.team === "")
        return 1;
    else if (response.amount === "" || response.amount == 0)
        return 2;
    else return 0;
}

function getTeamByMapping(team) {
    if (team == "Manchester United" || team == "United" || team == "Man United" || team == "The Red Devils") {
        return "Man Utd";
    } else if (team == "Manchester City" || team == "The Citizens") {
        return "Man City";
    } else {
        return team;
    };
};

function getBetUrl(team, condition, amount) {
    var bets = '[{"Date":"2018-12-21T20:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615412","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615412","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217181","HasLiveStream":"","Participants":{"Home":{"Odd":"21/4","Name":"Wolves","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619405","Score":""},"Draw":{"Odd":"3/1","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619408","Score":""},"Away":{"Odd":"10/19","Name":"Liverpool","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619409","Score":""}}},{"Date":"2018-12-22T12:30:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615420","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615420","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217189","HasLiveStream":"","Participants":{"Home":{"Odd":"2/9","Name":"Arsenal","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619461","Score":""},"Draw":{"Odd":"5/1","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619464","Score":""},"Away":{"Odd":"12/1","Name":"Burnley","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619465","Score":""}}},{"Date":"2018-12-22T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615411","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615411","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217180","HasLiveStream":"","Participants":{"Home":{"Odd":"20/23","Name":"Bournemouth","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619398","Score":""},"Draw":{"Odd":"51/20","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619401","Score":""},"Away":{"Odd":"16/5","Name":"Brighton","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619402","Score":""}}},{"Date":"2018-12-22T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615413","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615413","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217182","HasLiveStream":"","Participants":{"Home":{"Odd":"1/1","Name":"Newcastle","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619412","Score":""},"Draw":{"Odd":"5/2","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619415","Score":""},"Away":{"Odd":"14/5","Name":"Fulham","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619416","Score":""}}},{"Date":"2018-12-22T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615414","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615414","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217183","HasLiveStream":"","Participants":{"Home":{"Odd":"2/15","Name":"Man City","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619419","Score":""},"Draw":{"Odd":"29/4","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619422","Score":""},"Away":{"Odd":"17/1","Name":"Crystal Palace","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619423","Score":""}}},{"Date":"2018-12-22T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615415","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615415","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217184","HasLiveStream":"","Participants":{"Home":{"Odd":"13/10","Name":"West Ham","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619426","Score":""},"Draw":{"Odd":"12/5","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619429","Score":""},"Away":{"Odd":"21/10","Name":"Watford","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619430","Score":""}}},{"Date":"2018-12-22T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615418","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615418","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217187","HasLiveStream":"","Participants":{"Home":{"Odd":"4/13","Name":"Chelsea","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619447","Score":""},"Draw":{"Odd":"4/1","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619450","Score":""},"Away":{"Odd":"37/4","Name":"Leicester","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619451","Score":""}}},{"Date":"2018-12-22T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615419","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615419","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217188","HasLiveStream":"","Participants":{"Home":{"Odd":"41/20","Name":"Huddersfield Town","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619454","Score":""},"Draw":{"Odd":"41/20","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619457","Score":""},"Away":{"Odd":"6/4","Name":"Southampton","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619458","Score":""}}},{"Date":"2018-12-22T17:30:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615416","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615416","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217185","HasLiveStream":"","Participants":{"Home":{"Odd":"17/4","Name":"Cardiff City","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619433","Score":""},"Draw":{"Odd":"14/5","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619436","Score":""},"Away":{"Odd":"5/8","Name":"Man Utd","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619437","Score":""}}},{"Date":"2018-12-23T16:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32615417","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32615417","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12217186","HasLiveStream":"","Participants":{"Home":{"Odd":"9/4","Name":"Everton","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619440","Score":""},"Draw":{"Odd":"47/20","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619443","Score":""},"Away":{"Odd":"23/20","Name":"Tottenham","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R451619444","Score":""}}},{"Date":"2018-12-26T12:30:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773831","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773831","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288670","HasLiveStream":"","Participants":{"Home":{"Odd":"43/20","Name":"Fulham","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676348","Score":""},"Draw":{"Odd":"47/20","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676351","Score":""},"Away":{"Odd":"6/5","Name":"Wolves","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676352","Score":""}}},{"Date":"2018-12-26T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773822","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773822","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288661","HasLiveStream":"","Participants":{"Home":{"Odd":"29/4","Name":"Leicester","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676285","Score":""},"Draw":{"Odd":"17/4","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676288","Score":""},"Away":{"Odd":"10/31","Name":"Man City","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676289","Score":""}}},{"Date":"2018-12-26T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773824","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773824","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288663","HasLiveStream":"","Participants":{"Home":{"Odd":"20/59","Name":"Tottenham","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676299","Score":""},"Draw":{"Odd":"4/1","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676302","Score":""},"Away":{"Odd":"29/4","Name":"Bournemouth","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676303","Score":""}}},{"Date":"2018-12-26T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773825","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773825","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288664","HasLiveStream":"","Participants":{"Home":{"Odd":"20/67","Name":"Man Utd","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676306","Score":""},"Draw":{"Odd":"4/1","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676309","Score":""},"Away":{"Odd":"9/1","Name":"Huddersfield Town","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676310","Score":""}}},{"Date":"2018-12-26T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773826","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773826","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288665","HasLiveStream":"","Participants":{"Home":{"Odd":"2/3","Name":"Crystal Palace","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676313","Score":""},"Draw":{"Odd":"11/4","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676316","Score":""},"Away":{"Odd":"4/1","Name":"Cardiff City","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676317","Score":""}}},{"Date":"2018-12-26T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773827","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773827","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288666","HasLiveStream":"","Participants":{"Home":{"Odd":"4/27","Name":"Liverpool","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676320","Score":""},"Draw":{"Odd":"13/2","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676323","Score":""},"Away":{"Odd":"15/1","Name":"Newcastle","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676324","Score":""}}},{"Date":"2018-12-26T15:00:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773829","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773829","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288668","HasLiveStream":"","Participants":{"Home":{"Odd":"7/2","Name":"Burnley","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676334","Score":""},"Draw":{"Odd":"5/2","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676337","Score":""},"Away":{"Odd":"4/5","Name":"Everton","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676338","Score":""}}},{"Date":"2018-12-26T17:15:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773830","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773830","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288669","HasLiveStream":"","Participants":{"Home":{"Odd":"17/4","Name":"Brighton","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676341","Score":""},"Draw":{"Odd":"57/20","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676344","Score":""},"Away":{"Odd":"5/8","Name":"Arsenal","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676345","Score":""}}},{"Date":"2018-12-26T19:30:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773823","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773823","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288662","HasLiveStream":"","Participants":{"Home":{"Odd":"17/4","Name":"Watford","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676292","Score":""},"Draw":{"Odd":"57/20","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676295","Score":""},"Away":{"Odd":"5/8","Name":"Chelsea","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676296","Score":""}}},{"Date":"2018-12-27T19:45:00.0000000","Branch":"Soccer","Sport":"Soccer","BranchID":"1","League":"England - Premier League","LeagueID":"40253","ID":"32773828","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?eventid=32773828","IsLive":"false","TimeInGame":"","GameScores":"","EventType":"0","MEID":"12288667","HasLiveStream":"","Participants":{"Home":{"Odd":"7/5","Name":"Southampton","Status":"Home","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676327","Score":""},"Draw":{"Odd":"47/20","Name":"X","Status":"X","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676330","Score":""},"Away":{"Odd":"19/10","Name":"West Ham","Status":"Away","Url":"https://www.mansionbet.com/sports/mobilegoto.aspx?LineID=R453676331","Score":""}}}]'

    bets = JSON.parse("[" + bets + "]")
    bets = bets[0]

    var team = getTeamByMapping(team);

    var return_url;

    for (var i = 0; i < bets.length; i++) {
        //console.log("home: " + bets[i].Participants.Home.Name);
        //console.log("away: " + bets[i].Participants.Away.Name);
        var home_team = bets[i].Participants.Home.Name;
        var home_url = bets[i].Participants.Home.Url;
        var away_team = bets[i].Participants.Away.Name;
        var away_url = bets[i].Participants.Away.Url;
        var draw_url = bets[i].Participants.Draw.Url;

        if (home_team == team) {
            if (condition == "draw") {
                return_url = draw_url;
            } else if (condition == "win") {
                return_url = home_url;
            } else if (condition == "lose") {
                return_url = away_url;
            } else {
                return_url = "Error! Wrong condition!"
            }
            break;

        } else if (away_team == team) {
            if (condition == "draw") {
                return_url = draw_url;
            } else if (condition == "win") {
                return_url = away_url;
            } else if (condition == "lose") {
                return_url = home_url;
            } else {
                return_url = "Error! Wrong condition!"
            }
            break;
        }
    };

    return_url = return_url.concat("&Stake=", amount)
    return return_url;
}