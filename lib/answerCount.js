var ranaly = require('node_ranaly');

function AnswerCount(redisClient){
    var client = ranaly.createClient(redisClient,'webs');
    var arr = ['portal','maintain'];

    this.getClient = function(){
        return client;
    };
    this.getArr = function(){
      return arr;
    };

}

//����ҵ�����֣�ͳ�Ƹ�ҵ�����server�Ĵ���
AnswerCount.prototype.reqCount =  function (name){
    var client = this.getClient();
      if(this.getArr().indexOf(name)>-1){
           var reqcnt = new client.Amount(name+'Req');
            reqcnt.incr(1,function(err,total) {
            console.log(name + ' Request total count : ' + total);
         });
      }
    }

//����ҵ������ͳ��server��Ӧ�ĳɹ�����
AnswerCount.prototype. resCount = function(name){
    var client = this.getClient();
    if(this.getArr().indexOf(name)>-1){
        var rescnt = new client.Amount(name+'Res');
        rescnt.incr(1,function(err,total){
        console.log(name + ' Response total count : ' + total);
     });
    }
    }

module.exports = AnswerCount;

