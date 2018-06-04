var querystring = require('querystring');
var http = require('https');
var md5 = require('md5');
const REWARD_API_TEST_HOST='test.gamereward.io';
const REWARD_API_MAIN_HOST='gamereward.io';
const REWARD_API_PORT=443;
const REWARD_API_PATH='/appapi/';
var REWARD_API_HOST="";
exports.API_ID='';
exports.SECRET_KEY='';
exports.init=function(appid,secret,isMain){
    exports.API_ID=appid;
    exports.SECRET_KEY=secret;
    if(isMain){
        REWARD_API_HOST=REWARD_API_MAIN_HOST;
    }
    else{
        REWARD_API_HOST=REWARD_API_TEST_HOST;
    }
};
function sendData(isget,method,params,fn) {
    // Build the post string from an object
    if(params==null){
        params={};
    }
    params['api_id']=exports.API_ID;
    params['api_key']=getRequestToken(exports.SECRET_KEY);
    var data = querystring.stringify(params);
    var post_options={};
    if(isget) {
        // An object of options to indicate where to post to
        post_options = {
            host:REWARD_API_HOST,
            port:REWARD_API_PORT,
            path: REWARD_API_PATH + method+"/"+data,
            method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
    }
    else{
        post_options = {
            host:REWARD_API_HOST,
            port:REWARD_API_PORT,
            path: REWARD_API_PATH + method,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(data)
            }
        };
    }

    try {
        // Set up the request
        var post_req = http.request(post_options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var ipos=chunk.indexOf("{");
                if(ipos>0){
                    chunk=chunk.substring(ipos);
                }
                fn(chunk);
            });
        });
        if (!isget) {
            post_req.write(data);
        }
        post_req.end();
    }
    catch (ex){
        fn('{"error":99,"message":"Can not connect to reward"}');
    }
}
function getRequestToken(secret)
{
    var t = Math.round(Math.round((new Date()).getTime() / 1000)/15);
    var k = Math.floor(t % 20);
    var len =  Math.floor(secret.length / 20);
    var str = secret.substr(k * len,len);
    str= md5(str+t);
    return str;
}
function getJsonData(data) {
    var o;
    try{
        o= JSON.parse(data)
    }catch (err){
        //console.log(data);
        o={'error':100};
    }
    return o;
}
exports.getAccountBalance=function(username,fn){
    sendData(false,'accountbalance',{'username':username},function (data) {
        fn(getJsonData(data));
    });
};
exports.chargeMoney=function(username,value,fn){
    sendData(false,'chargemoney',{'username':username,'value':value},function (data) {
        if(fn!=null) {
            fn(getJsonData(data));
        }
    });
};
exports.transfer=function(username,to,value,fn){
    sendData(false,'transfer',{'username':username,'value':value,'to':to},function (data) {
        if(fn!=null) {
            fn(getJsonData(data));
        }
    });
};
exports.callServerScriptFunction=function(username,scriptname,funcname,parameters,fn)
{
    var jsonRequest=JSON.stringify(parameters);
    sendData(false,'callserverscript',{'username':username,'fn':funcname,'script':scriptname,"vars":jsonRequest},function (data) {
        fn(getJsonData(data));
    });
};
exports.getTransactions=function(username,start,count,fn)
{
    sendData(false,'transactions',{'username':username,'start':start,'count':count},function (data) {
        fn(getJsonData(data));
    });
};
exports.getTransactionCount=function(username,fn)
{
    sendData(false,'counttransactions',{'username':username},function (data) {
        fn(getJsonData(data));
    });
};
exports.getUserScore=function(username,scoreType,fn)
{
    sendData(false,'getuserscore',{'username':username,'scoretype':scoreType},function (data) {
        fn(getJsonData(data));
    });
};
exports.saveUserScore=function(username,scoreType,score,fn)
{
    sendData(false,'saveuserscore',{'username':username,'scoretype':scoreType,'score':score},function (data) {
        fn(getJsonData(data));
    });
};
exports.increaseUserScore=function(username,scoreType,score,fn)
{
    sendData(false,'increaseuserscore',{'username':username,'scoretype':scoreType,'score':score},function (data) {
        fn(getJsonData(data));
    });
};
exports.getLeaderBoard=function (username,scoreType,start,count,fn) {
    sendData(false,'getleaderboard',{'username':username,'scoretype':scoreType,'start':start,'count':count},function (data) {
        fn(getJsonData(data));
    });
};

exports.getUserSessionData=function (username,store,keys,start,count,fn) {
    var skeys="";
    if(keys instanceof Array){
        skeys=keys.join(',',keys);
    }
    else{
        skeys=keys;
    }
    sendData(false,'getusersessiondata',{'username':username,'store':store,'start':start,'count':count,'keys':skeys},function (data) {
        fn(getJsonData(data));
    });
};