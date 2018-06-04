var reward = require('./reward');
var rl = require("readline");
var prompts = rl.createInterface(process.stdin, process.stdout);
var SCORE_TYPE_TEST = 'GAME1_SCORE_TYPE';
var username;
var accountbalance;

reward.init( '6e672e888487bd8346b946a715c74890077dc332', 'acc3e0404646c57502b480dc052c4fe15878a7ab84fb43402106c575658472faf7e9050c92a851b0016442ab604b0488aab3e67537fcfda3650ad6cfd43f7974');
function printError(result, fn) {
    console.log("Error:" + result.error + ",message:" + result.message);
    if (fn) {
        pauseScreen(fn);
    }
}

function pauseScreen(fn) {
    console.log("Press enter to continue....");
    prompts.question("", function () {
        fn();
    });
}

function transferMoney() {
    console.log("TRANSFER MONEY");
    console.log("Account Balance:" + accountbalance);
    prompts.question("Transfer to:", function (to) {
        prompts.question("Amount:", function (amount) {
            if (amount < 0) {
                console.log("Amount must be greater than 0");
                accountApiMenu();
            }
            else {
                reward.transfer(username, to, amount, function (result) {
                    if (result.error === 0) {
                        console.log("Transfer successfully!");
                        pauseScreen(accountApiMenu)
                    }
                    else {
                        printError(result, accountApiMenu);
                    }
                });
            }
        });
    });
}

function chargeMoney() {
    console.log("CHARGE MONEY FROM THIS ACCOUNT");
    console.log("Account Balance:" + accountbalance);
    prompts.question("Amount:", function (amount) {
        if (amount < 0) {
            console.log("Amount must be greater than 0")
            accountApiMenu();
        }
        else {
            reward.chargeMoney(username, amount, function (result) {
                if (result.error === 0) {
                    console.log("Charge successfully!");
                    pauseScreen(accountApiMenu)
                }
                else {
                    printError(result, accountApiMenu);
                }
            });
        }
    });
}

function payMoney() {
    console.log("PAY MONEY TO THIS ACCOUNT");
    console.log("Account Balance:" + accountbalance);
    prompts.question("Amount:", function (amount) {
        if (amount < 0) {
            console.log("Amount must be greater than 0");
            pauseScreen(accountApiMenu);
        }
        else {
            //Pay money just call chargeMoney with amount < 0
            reward.chargeMoney(username, -amount, function (result) {
                if (result.error === 0) {
                    console.log("Pay successfully!");
                    pauseScreen(accountApiMenu);
                }
                else {
                    printError(result, accountApiMenu);
                }
            });
        }
    });
}

function listTransactions() {
    reward.getTransactionCount(username, function (result) {
        if (result.error === 0) {
            var count = result.count;
            var pageSize = 10;
            getTransactions(0, pageSize, count);
        }
    });
}

function getTransactions(pageindex, pageSize, recordCount) {
    var start = pageindex * pageSize;
    reward.getTransactions(username, start, pageSize, function (result) {
        if (result.error === 0) {
            for (var i = 0; i < result.transactions.length; i++) {
                var trans = result.transactions[i];
                console.log("---------------------------------");
                console.log("tx:" + trans.tx);
                console.log("amount:" + trans.amount);
                console.log("from:" + trans.from);
                console.log("to:" + trans.to);
                var date = new Date(trans.transdate * 1000);
                var status=parseInt(trans.status);
                var transtype=parseInt(trans.transtype);

                console.log("transdate:" + date.toDateString());
                console.log("transtype:" + (transtype == 1 ? "base" : (transtype == 2 ? "internal" : "external")));
                console.log("status:" +(status === 0 ? "pending" : (status === 1 ? "success" : "error")));
            }
            console.log('--------------------------------');
            var pageCount = Math.ceil(recordCount / parseFloat(pageSize));
            console.log("Page:" + pageindex + "/" + pageCount + "| 1-Next, 2 Prev , 10 exit");
            prompts.question("SELECT:", function (sselect) {
                if (sselect == "1") {
                    getTransactions(pageindex + 1, pageSize, recordCount);
                }
                else if (sselect == "2" && pageindex > 0) {
                    getTransactions(pageindex - 1, pageSize, recordCount);
                }
                else {
                    accountApiMenu();
                }

            });
        }
        else {
            printError(result, accountApiMenu);
        }
    });

}

function accountApiMenu() {
    console.clear();
    console.log("ACCOUNT API");
    console.log("---------------------------------");
    reward.getAccountBalance(username, function (result) {
        if (result.error === 0) {
            accountbalance = result.balance;
            console.log("Account balance:" + accountbalance);
            console.log("Wallet Address:" + result.address);
            console.log("---------------------------------");
            console.log("TO DO");
            console.log("1.Transfer money to other address (use for user).");
            console.log("2.Charge from this account (use for game action).");
            console.log("3.Pay money to this account(use for game action).");
            console.log("4.List transactions.");
            console.log("5.Refresh.");
            console.log("10.Go back...");
            console.log("---------------------------------");
            prompts.question("SELECT:", function (select) {
                if (select === "1") {
                    transferMoney();
                }
                else if (select === "2") {
                    chargeMoney();
                }
                else if (select === "3") {
                    payMoney();
                }
                else if (select === "4") {
                    listTransactions();
                }
                else if (select === "10") {
                    menu();
                }
                else {
                    accountApiMenu();
                }
            });
        }
        else {
            printError(result, accountApiMenu);
        }
    });
}

function saveUserScore() {
    console.log("SAVE USER SCORE");
    prompts.question("Score:", function (score) {
        reward.saveUserScore(username, SCORE_TYPE_TEST, score, function (result) {
            if (result.error === 0) {
                console.log("Save Successfully!");
                pauseScreen(scoreApiMenu);
            }
            else {
                printError(result, scoreApiMenu);
            }
        });
    });
}

function increaseUserScore() {
    console.log("INCREASE USER SCORE");
    prompts.question("Score:", function (score) {
        reward.increaseUserScore(username, SCORE_TYPE_TEST, score, function (result) {
            if (result.error === 0) {
                console.log("Increase Successfully!");
                prompts.question("Press enter to continue....", function (data) {
                    scoreApiMenu();
                    pauseScreen(scoreApiMenu);
                });
            }
            else {
                printError(result, scoreApiMenu);
            }
        });
    });
}

function fixlength(st, len) {
    var stfixed = "                                                                               ";
    st = st + "";
    if (st.length < len) {
        st = stfixed.substring(0, len - st.length) + st;
    }
    return st;
}

function loadLeaderBoard(title, scoreType, fn) {
    console.log("LEADER BOARD " + title);
    reward.getLeaderBoard(username, scoreType, 0, 20, function (result) {
        if (result.error === 0) {
            console.log("+----------Name----------------+-----Score-----+-----Rank-----+");
            for (var i = 0; i < result.leaderboard.length; i++) {
                var item = result.leaderboard[i];
                console.log("|" + fixlength(item['username'], 30) + "|" + fixlength(item['score'], 15) + "|" + fixlength(item['rank'], 14) + "|")

            }
            console.log("+------------------------------+---------------+--------------+");
            pauseScreen(fn);
        }
        else {
            printError(result, fn);
        }
    });
}


function scoreApiMenu() {
    console.clear();
    console.log("SCORE API");
    reward.getUserScore(username, SCORE_TYPE_TEST, function (result) {
        if (result.error === 0) {
            console.log("CURRENT SCORE:" + result.score);
            console.log("CURRENT RANK:" + result.rank);
            console.log("---------------------------------");
            console.log("1.Save user score.");
            console.log("2.Increase user score.");
            console.log("3.Leader Board.");
            console.log("10.Go back...");
            console.log("---------------------------------");
            prompts.question("SELECT:", function (select) {
                if (select === "1") {
                    saveUserScore();
                }
                else if (select === "2") {
                    increaseUserScore();
                }
                else if (select === "3") {
                    loadLeaderBoard(' SCORE TYPE:' + SCORE_TYPE_TEST, SCORE_TYPE_TEST, accountApiMenu);
                }
                else if (select === "10") {
                    menu();
                }
                else {
                    accountApiMenu();
                }
            });
        }
        else {
            printError(result, menu);
        }
    });
}

function loadLuckyNumberGameSessionData() {
    console.log("LUCKY NUMBER HISTORY");
    var store = 'GAME-9';
    var keys = 'rand';
    reward.getUserSessionData(username, store, keys, 0, 20, function (result) {
        if (result.error === 0) {
            console.log("+----------Time----------------+-----Select-----+-----Result-----+-----Money-----+");
            for (var i = 0; i < result.data.length; i++) {
                var item = result.data[i];
                if (item['values']['rand']) {
                    var date = new Date(item['sessionstart']);
                    var arr = item['values']['rand'].split(',');
                    console.log("|" + fixlength(date.toDateString(),30)  + "|" + fixlength(arr[0], 15) + "|" + fixlength(arr[1], 14) + "|" + fixlength(arr[2], 14) + "|")
                }
            }
            console.log("+------------------------------+----------------+----------------+---------------+");
            pauseScreen(random_1_9game);
        }
        else {
            printError(result, random_1_9game);
        }
    });
}

function random_1_9game() {
    console.clear();
    console.log("LUCKY NUMBER 1-9");
    console.log("---------------------------------");
    console.log("1-9. Select lucky number");
    console.log("10. Leader board.");
    console.log("11. History.");
    console.log("100. Go back...");
    console.log("---------------------------------");
    prompts.question("SELECT:", function (select) {
        var number = parseInt(select);
        if (number >= 1 && number <= 9) {
            prompts.question("BET:", function (bet) {
                reward.callServerScriptFunction(username, "testscript", "random9", [number, bet], function (result) {
                    if (result.error === 0) {
                        var array = result.result;
                        if (array[0] === 0) {
                            console.log("SELECT:" + array[1] + ",RESULT:" + array[2] + "=>" + (array[3] > 0 ? "WIN:" : "LOSE:") + array[3]);
                        }
                        else {
                            console.log(array[1]);
                        }
                        pauseScreen(random_1_9game);
                    }
                    else {
                        printError(result, random_1_9game);
                    }
                });
            });
        }
        else if (select === "10") {
            loadLeaderBoard('LUCKY NUMBER 1-9', 'random9_score', random_1_9game);
        }
        else if (select === "11") {
            loadLuckyNumberGameSessionData();
        }
        else if (select === "100") {
            serverScriptOApiMenu();
        }
        else {
            random_1_9game();
        }
    });
}

function loadLowHighGameSessionData() {
    console.log("HIGH LOW GAME HISTORY");
    var store = 'LOWHIGHGAME';
    var keys = 'result';
    reward.getUserSessionData(username, store, keys, 0, 20, function (result) {
        if (result.error === 0) {
            console.log("+----------Time----------------+-----Card-----+-----Select-----+-----Result-----+-----Money-----+");
            for (var i = 0; i < result.data.length; i++) {
                var item = result.data[i];
                if (item['values']['result']) {
                    var date = new Date(item['sessionstart']);
                    var arr =JSON.parse(item['values']['result']);
                    console.log("|" + fixlength(date.toDateString(),30)  + "|" + fixlength(arr[1], 15) + "|" + fixlength(arr[0]==1?"LOW":"HIGH", 14) + "|" + fixlength(arr[2], 14) + "|" + fixlength(arr[3], 14) + "|")
                }
            }
            console.log("+------------------------------+----------------+----------------+---------------+");
            pauseScreen(highlowgame);
        }
        else {
            printError(result, highlowgame);
        }
    });
}
function highlowgame() {
    console.clear();
    console.log("HIGH LOW GAME");
    console.log("---------------------------------");
    var suits=['clubs','spades','diamonds','hearts'];
    var cardSymbol=Math.floor(Math.random()*10)+3;
    var cardSuit=Math.floor(Math.random()*4);
    console.log("Card:"+cardSymbol+" of "+suits[cardSuit]);
    console.log("1. LOW ("+Math.round(10*(14.0-cardSymbol)/(cardSymbol-2.0))/10+"/1).");
    console.log("2. HIGH ("+Math.round(10*(cardSymbol-2.0)/(14.0-cardSymbol))/10+"/1).");
    console.log("3. Leader Board.");
    console.log("4. History.");
    console.log("10. Go back...");
    console.log("---------------------------------");
    prompts.question("SELECT:", function (select) {
        if (select ==="1" || select==="2") {
            prompts.question("BET:", function (bet) {
                var islow=select=="1"?1:0;
                reward.callServerScriptFunction(username, "testscript", "lowhighgame", [islow,cardSymbol, bet], function (result) {
                    if (result.error === 0) {
                        var array = result.result;
                        if (array[0] === 0) {
                            console.log("CARD:"+cardSymbol+" of "+suits[cardSuit]+"-SELECT:" + (islow==1?"LOW":"HIGH") + ",RESULT CARD:" + array[1]["symbol"]+" of " +suits[array[1]["suit"]]+ "=>" + (array[2] > 0 ? "WIN:" : "LOSE:") + array[2]);
                        }
                        else {
                            console.log(array[1]);
                        }
                        pauseScreen(highlowgame);
                    }
                    else {
                        printError(result, highlowgame);
                    }
                });
            });
        }
        else if (select === "3") {
            loadLeaderBoard('HIGH LOW GAME', 'lowhighgame_score', highlowgame);
        }
        else if (select === "11") {
            loadLowHighGameSessionData();
        }
        else if (select === "100") {
            serverScriptOApiMenu();
        }
        else {
            highlowgame();
        }
    });
}

function serverScriptOApiMenu() {
    console.clear();
    console.log("Server script - OAPI");
    console.log("---------------------------------");
    console.log("1.Random 1-9 Game demo.");
    console.log("2.Low high game.");
    console.log("10.Go back...");
    console.log("---------------------------------");
    prompts.question("SELECT:", function (select) {
        if (select === "1") {
            random_1_9game();
        }
        else if (select === "2") {
            highlowgame();
        }
        else if (select === "10") {
            menu();
        }
        else {
            serverScriptOApiMenu();
        }
    });
}

function menu() {
    console.clear();
    console.log("MENU");
    console.log("---------------------------------");
    console.log("1. Account API.");
    console.log("2. Score API.");
    console.log("3. Server script OAPI.");
    console.log("10. Exit.");
    console.log("---------------------------------");
    prompts.question("SELECT:", function (select) {
        if (select === "1") {
            accountApiMenu();
        }
        else if (select === "2") {
            scoreApiMenu();
        }
        else if (select === "3") {
            serverScriptOApiMenu();
        }
        else if (select === "10") {
            process.exit();
        }
    });
}

prompts.question("USER NAME:", function (usrname) {
    reward.getAccountBalance(usrname, function (result) {
        if (result.error === 0) {
            username = usrname;
            menu();
        }
        else {
            printError(result);
        }
    });
});