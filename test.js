function findAmount(words) {
    var BreakException = {};
    var amount
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
    var splitted = text.split(" ");
    response = {}
    response.amount = findAmount(splitted);
    response.team = getTeam(splitted);
    response.condition = getCondition(text);
    return response;
};