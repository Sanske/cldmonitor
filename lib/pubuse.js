/**
 * Created by D09675 on 2015/8/5.
 *
 * description: defined public usable attributes and methods for cloud plat.
 *
 */
var os     = require('os'),
    path   = require('path'),
    fs     = require('fs'),
    child_process = require('child_process');
ranaly = require('node_ranaly');

function Pubuse(redis){
    var usageInfo = {
        'cpuUsage' : '',
        'memUsage' : '',
    };
    var serviceInfo   = {
        "name"   : "portal",
        "ipv4"   : null,
        "status" : "init"
    };
    var childOption   = {
        stdio: [0, 'pipe', 'pipe']
    };

    this.getClient = function(){
        return client;
    };
    this.getRedis = function(){
        return redis;
    };
    this.getUsageInfo = function(){
        return  usageInfo;
    };
    this.getServiceInfo = function(){
        return serviceInfo;
    };
    this.childOption = function(){
        return childOption;
    };
}

Pubuse.prototype.startService =  function (serviceName, entryFile,score) {
    var redis = this.getRedis();
    var ip    = this.getLocalIP('eth', 'ipv4');
    var serviceInfo = this.getServiceInfo();
    var usageInfo = this.getUsageInfo();
    var child = child_process.spawn('node', [entryFile]);
    process.stdin.pipe(child.stdin);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    serviceInfo.name   = serviceName;
    serviceInfo.ipv4   = ip;
    serviceInfo.status = "run";
    serviceInfo.pid    = child.pid;
    child.on('error', function(err) {
        serviceInfo.status = "error";
        console.error('Process '+serviceName+' error: '+err);
    });
    child.on('exit', function(code, signal) {
        serviceInfo.status   = "exit";
        serviceInfo.exitCode = code;

        //if (0 != code) {
        //    this.startService(serviceName, entryFile,score);
        //}
        console.log('Process '+serviceName+' exit with code: '+code+', signal: '+signal);
    });


    /*
     *保存公共的信息cpu和memery的使用率
     */
    function saveUsage(usageInfo,ip){
        redis.spop(ip);
        redis.sadd(ip,JSON.stringify(usageInfo));
        redis.smembers(ip,function(err,data){
            console.log('usageIp : ' + data);
        });
    }

    /* TMP Test */
   setInterval(function() {
        //console.log(serviceInfo.ipv4);
        var name = 'portal';
        var cmd = 'ps -aux | grep '+name+'.js';
        var ch = child_process.exec(cmd, function(error, stdout, stderr) {
            tmp = trim(stdout).split(' ');
            //console.log("PS stdout: "+stdout);
            usageInfo.cpuUsage=tmp[2];
            usageInfo.memUsage=tmp[3];
            saveUsage(usageInfo,ip);
        });
    }, 1000*4);
    this.saveToRedis(serviceName,ip,serviceInfo,score);
}
/*
 * iftype: 网卡类型 eth, lo, tunl
 * family: IPv4 or IPv6
 * default return: '127.0.0.1'
 *
 * common use: getLocalIP(eth, IPv4)
 * */
Pubuse.prototype.getLocalIP = function (iftype, family) {
    var ip  = '127.0.0.1';
    var ifs = os.networkInterfaces();
    for (var dev in ifs) {
        if (dev.toLowerCase().match(iftype.toLowerCase())) {
            var devinfo = ifs[dev];
            for (var i=0; i<devinfo.length; i++) {
                if (devinfo[i].family.toLowerCase() === family.toLowerCase()) {
                    ip = devinfo[i].address;
                    break;
                }
            }
            break;
        }
    }
    return ip;
}

/*
 * dirpath: absolute directory path
 * description: asynchronous make directory
 * */
Pubuse.prototype.mkdirs = function (dirpath, mode, callback) {
    fs.exists(dirpath, function(exists){
        if (exists) {
            callback(dirpath);

        } else {
            mkdirs(path.dirname(dirpath), mode, function(){
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
}
/*
 * dirpath: absolute directory path
 * description: synchronous make directory
 * */
Pubuse.prototype.mkdirsSync = function (dirpath, mode) {
    if (fs.existsSync(path.dirname(dirpath)))
    {
        fs.mkdirSync(dirpath, mode);
        return ;
    } else {
        mkdirsSync(path.dirname(dirpath), mode);
    }
}
function trim(s){
    return s.replace(/(^\s*)|(\s*$)/g, '').replace(/\s+/g,' ');
}
/*
 *将获取到的信息存到redis数据库中去
 */
Pubuse.prototype.saveToRedis = function(serviceName,ip,serviceInfo,score){
    var redis = this.getRedis();
    console.log('access to saveToRedis ');
    redis.zadd('business',score,serviceName);
    redis.sadd(serviceName,serviceName+ip);
    //保证只存一份
    redis.spop(serviceName+ip);
    redis.sadd(serviceName+ip,JSON.stringify(serviceInfo));
    redis.zrangebyscore('business','-inf','+inf',function(err,data){
        console.log('business : '+data);
    });
    redis.smembers(serviceName,function(err,data){
        console.log(serviceName+" : "+data);
    });
    redis.smembers(serviceName+ip,function(err,data){
        console.log(serviceName+ip+' : '+data);
    });
}

module.exports = Pubuse;

