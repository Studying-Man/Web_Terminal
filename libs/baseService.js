let RESULT_TRUE = 'TRUE';
let RESULT_FALSE = 'FALSE';

class BaseService {
    constructor() {
        this.restSuccess = resSuccess;
        this.restError = resError;
    }
}

function resSuccess(res, data, other_data) {
    let result = {result: RESULT_TRUE};
    if(data){
        result.data = data;
    }
    if(other_data && other_data instanceof Object){
        for(let attr in other_data){
            if(other_data.hasOwnProperty(attr)){
                result[key] = other_data[key];
            }
        }
    }
    rest(res, result);
}

function resError(res, err_code, err_msg) {
    let result = { result: RESULT_FALSE };
    if(err_code){
        result.errorCode = err_code;
    }
    if(err_msg){
        result.msg = err_msg;
    }
    rest(res, result);
}

function rest(res, data) {
    res.send(data);
}

module.exports = BaseService;