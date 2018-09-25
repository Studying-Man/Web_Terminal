
require('./mongodb.js');
var redis = require('./redis.js').redisClient;
var FileRedisClient = require('./redis.js').fileRedisClient;
var loader = require('./loadConfig.js');

const oplog =  require('./oplog.js');

var RESULT_TRUE = 'TRUE';
var RESULT_FALSE = 'FALSE';
var need_encrypt = require(loader.configFile)[loader.projectName].need_encrypt;

class BaseService {
    constructor() {
        this.redis = redis;
        this.RedisFileServer = FileRedisClient;
        this.restSuccess = restSuccess;
        this.restError = restError;
    }
}

/**
 * 处理成功返回
 */
function restSuccess(res, data, other_datas) {
    var result = { result: RESULT_TRUE };
    if (data) {
        result.data = data;
    }
    if (other_datas) {
        for (var key in other_datas) {
            if (other_datas.hasOwnProperty(key)) {
                result[key] = other_datas[key];
            }
        }
    }
    if (need_encrypt) {
        result = utils.encodeResult(JSON.stringify(result));
        rest(res, { encode_str: result });
    } else {
        rest(res, result);
    }
    //记录日志用
    oplog.record(res.logparams,result);
}

/**
 * 处理错误返回
 */
function restError(res, err_code, err_msg) {
    var result = { result: RESULT_FALSE };
    if (err_code) {
        result.errorcode = err_code;
    }
    if (err_msg) {
        result.msg = err_msg;
    }
    if (need_encrypt) {
        result = utils.encodeResult(JSON.stringify(result));
        rest(res, { encode_str: result });
    } else {
        rest(res, result);
    }
}

function rest(res, data) {
    res.send(data);
}

module.exports = BaseService;
