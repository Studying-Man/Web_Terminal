let BaseRouter = require('../libs/baseRoute');
let handler = require('../services/deployCode_service.js');

let services = [];

services.push({
    type: 'post',
    url: '/runcmd',
    handler: handler.runCmd
});

services.push({
    type   : 'post',
    url    : '/uploadCode',
    handler: handler.uploadCode
});

services.push({
    type   : 'post',
    url    : '/upload',
    handler: handler.upload
});

services.push({
    type   : 'post',
    url    : '/upTings',
    handler: handler.upTings
});

services.push({
    type: 'post',
    url:  '/mergeFile',
    handler: handler.mergeFile
});

class Router extends BaseRouter {
    constructor(server, name) {
        super(server, name);
        this.services = services;
    }
}

module.exports = Router;