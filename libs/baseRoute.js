var fs = require('fs');
var path = require('path');
var express = require('express');

// var router = express.Router();  这样写有bug  造成类似于/asd/test与/asd2/test的同时存在时，只有前一个路由生效
class BaseRouter {
    constructor(server, name) {
        this.server = server;
        this.router = express.Router(); //@liyuchen 每次产生新的Router实例
        this.name = name;
        this.services = [];
    }

    initRouter() {
        var _this = this;
        _this.services.forEach((service) => {
            if (!service.handler) {
                return;
            }
            let handle = service.handler;
            //@liyuchen 不用在每个service里面写try catch， 统一在这catch
            if(Object.prototype.toString.call(service.handler) === '[object AsyncFunction]'){ //如果是async 函数
                handle = function (req, res) {
                    service.handler(req, res).catch((e) => {
                        console.log('---------------------ERROR------------------------');
                        console.log(e.stack || e);
                        console.log('--------------------ERROR END---------------------');
                        let result = { result: 'FALSE' };
                        result.errorcode = -1;
                        result.msg = e.toString();
                        return res.send(result);
                    });
                };
            }
            var url = service.url;
            switch (service.type.toLowerCase()) {
                case 'get': {
                    _this.router.get(url, handle);
                    break;
                }
                case 'post': {
                    _this.router.post(url, handle);
                    break;
                }
                case 'put': {
                    _this.router.put(url, handle);
                    break;
                }
                case 'del': {
                    _this.router.del(url, handle);
                    break;
                }
                default: {
                    // do nothing;
                }
            }
        });
        _this.server.use(`/${_this.name === 'index' ? '' : _this.name}`, _this.router);
    }
}
module.exports = BaseRouter;
