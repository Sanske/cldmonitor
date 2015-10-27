var http = require('http');
var dbhd = require('wlanpub').dbhd;
var answer = require('../monitor').answer;
var basic =require('../monitor').basic;
var  redisPara={
    'port' : 6379,
    'host' : '172.27.8.117'
};
//连接redis数据库
dbhd.connectRedis(redisPara);

var answerCnt = new answer(dbhd.redisClient);
var basicCnt = new basic(dbhd.redisClient);


var connOption = {
    port: 3000
}

//basicCnt.startService('portal','./portal/express/portal.js','1');
http.createServer(function(req,res){
    res.writeHead(200, {'Content-Type':'text/plain'});
    req.on('data', function(chunk){
        //res.write(chunk);
    });

    req.on('end', function() {
        res.end("sanske is coming!");
        answerCnt.resCount('portal');
    });

       answerCnt.reqCount('portal');

}).listen(connOption.port);
console.log('test is listening port : ' + connOption.port);