let express = require('express');
let app = express();
let logger = require('morgan');
let fs = require('fs');
let path = require('path');
let moment = require('moment');
let importer = require('./libs/importer')();

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With, x-json-web-token, copany_id, custom-company-id");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    next();
});

app.use(logger(function (tokens, req, res) {
    return [
        '[',
        moment().format('YYYY-MM-DD HH:mm:ss'),
        ']',
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),'ms',
        // '___',tokens['user-agent'](req)
    ].join(' ');
}));


let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 4000);


let routes = importer('./routes');
for (let key in routes) {
    let routeClass = routes[key];
    let routeInstance = new routeClass(app, key);
    routeInstance.initRouter();
}


app.listen(app.get('port'), function () {
    console.log('DeployCode Started on http://localhost:' + app.get('port') + '; press Ctrl + C to terminate');
});