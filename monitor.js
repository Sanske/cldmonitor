var basicInfo = require("./lib/pubuse");
var answer =require("./lib/answerCount");
/**
 * answer : Access request and the response of statistics.
 * basic £º Contains the CPU usage, pid, ipv4 and other basic information.
 */

module.exports = {
    answer :  answer,
    basic  :  basicInfo
};



