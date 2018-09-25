/**
 *****************************************************
 *******---*************---***----*******---***----***
 ******---*************---**---*********---**---******
 *****---*************------***********------*********
 ****---*************---**---*********---**---********
 ***----------******---****----******---****----******
 *****************************************************
 * Created By: lkkchen
 * Date Time:  2018.08.31
 */


let BaseService = require('../libs/baseService.js');
let ObjectId = require('mongoose').Types.ObjectId;
let Promise = require('bluebird');
let Service = new BaseService();
let __ = require('lodash');
let moment = require('moment');
let fs = require('fs');
let formidable=require('formidable');
let fsUtils = require('../libs/fsUtils');
const concat = require('concat-files');
const MD5 = require('md5');

const child_process = require('child_process');
global.log = function (m) {
    console.log(m);
};

function execShellAsync(cmd) {
    return new Promise(function(resolve, reject){
        child_process.exec(cmd, {maxBuffer: 10240*1024}, function(e, stdout, stderr){
            log(cmd);
            log('stdout:' + stdout);
            log('stderr:' + stderr);
            if(e){
                log('e' + e.stack || e);
                return reject(e);
            }
            var result = stdout ? stdout : stderr;
            resolve(result);
        });
    });
}

async function deployCode (code_dir_name, pjname){
    const cmd = `tar zxvf ${code_dir_name} -C /home/www/htdocs/`;
    const res = await execShellAsync(cmd);
    console.log(res);
    console.log(`-------restart-pm2-${pjname}------`);
    const res2 = await execShellAsync(`pm2 reload ${pjname}`);
    console.log(res2);
}

Service.runCmd = async function (req, res){
    const theCmd = req.body.cmd;

    const result = await execShellAsync(theCmd);
    Service.restSuccess(res, result);
};


Service.uploadCode = async function (req, res) {
    const AVATAR_UPLOAD_FOLDER = '/home/www/code1/';
    const AVATAR_UPLOAD_FOLDER2 = '/home/www/';
    await fsUtils.mkdirAsync(AVATAR_UPLOAD_FOLDER);
    await fsUtils.mkdirAsync(AVATAR_UPLOAD_FOLDER2);

    console.log('------Enter uploadCode-----');
    let form= new formidable.IncomingForm();
    form.encoding='utf-8'; //设置编辑
    form.uploadDir = AVATAR_UPLOAD_FOLDER;
    form.keepExtensions = true;

    form.parse(req, async function(err, fields, files){
        console.log('======= body 信息 =======');
        console.log(fields);

        let code_dir_name = req.body.code_dir_name || fields.code_dir_name;
        if(!code_dir_name){
            return Service.restError(res, -1, 'code_dir_name 不存在');
        }

        console.log('=======文件上传信息======');
        console.log(files);
        let the_file = files['code_tar'];
        if(err){
            return Service.restError(res, -1, '文件上传失败');
        }
        const file_name = the_file.name;
        if(file_name.indexOf('tar.gz') < 0){
            return Service.restError(res, -1, '文件格式不是 .tar.gz');
        }

        const nowTime = Date.now();
        const newPath = `${AVATAR_UPLOAD_FOLDER2}${code_dir_name}_${nowTime}.tar.gz`;

        console.log(`file path: ${newPath}`);

        fs.renameSync(the_file.path, newPath);

        await deployCode(newPath, code_dir_name);

        Service.restSuccess(res, '----部署成功----');

    });
};

Service.upload = async function (req, res){

    const AVATAR_UPLOAD_FOLDER = '/home/www/code1/';
    await fsUtils.mkdirAsync(AVATAR_UPLOAD_FOLDER);

    console.log('------Enter uploadCode-----');
    let form= new formidable.IncomingForm();
    form.encoding='utf-8'; //设置编辑
    form.uploadDir = AVATAR_UPLOAD_FOLDER;
    form.keepExtensions = true;

    form.parse(req, async function(err, fields, files){
        console.log('======= body 信息 =======');
        console.log(fields);
        const targetPath = fields['targetPath'];
        if(!targetPath){
            return Service.restError(res, -1, 'path not existed');
        }
        console.log('=======文件上传信息======');
        console.log(files);
        let the_file = files['file'];
        const file_name = the_file.name;

        const newPath = `${targetPath}${file_name}`;

        console.log(`file path: ${newPath}`);

        fs.renameSync(the_file.path, newPath);
        Service.restSuccess(res, 'okokokko');
    });
}



Service.upTings = async function(req, res){
    const root_folder = process.cwd();
    const AVATAR_UPLOAD_FOLDER = root_folder+'/test_up/';
    const AVATAR_UPLOAD_FOLDER2 = root_folder+'/test_up2/';
    await fsUtils.mkdirAsync(AVATAR_UPLOAD_FOLDER);
    await fsUtils.mkdirAsync(AVATAR_UPLOAD_FOLDER2);

    console.log('------Enter importXlsx-----');
    let form= new formidable.IncomingForm();
    form.encoding='utf-8'; //设置编辑
    form.uploadDir = AVATAR_UPLOAD_FOLDER;
    form.keepExtensions = true;


    form.parse(req, async function(err, fields, files) {
        console.log('======= body 信息 =======');
        // console.log(req.body);
        console.log(fields);
        const fname = fields.name;
        const idx = fields.index;

        console.log('=======文件上传信息======');
        console.log(files);
        let the_file = files['data'];
        if (err || !the_file) {
            return Service.restError(res, -1, '文件上传失败');
        }
        const folderName = MD5(fname);
        let newPath = AVATAR_UPLOAD_FOLDER2 + folderName;
        await fsUtils.mkdirAsync(newPath);

        fs.renameSync(the_file.path, newPath+'/'+idx);

        Service.restSuccess(res, 'ok')
    });
};
Service.mergeFile = async function (req, res){
    const root_folder = process.cwd();
    const AVATAR_UPLOAD_FOLDER2 = root_folder+'/test_up2/';
    await fsUtils.mkdirAsync(AVATAR_UPLOAD_FOLDER2);

    const fname = req.body.fname;
    const targetDir = req.body.targetDir;
    const newName = req.body.newName;

    const chunkFolder = MD5(fname);
    const fullFolderPath = AVATAR_UPLOAD_FOLDER2 + chunkFolder + '/';

    await mergeFilesAsync(fullFolderPath, targetDir, newName);

    Service.restSuccess(res, 'ok');

    function mergeFilesAsync(srcDir, targetDir, newFileName) {
        return new Promise(async (resolve, reject) => {
            let fileArr = await listDir(srcDir);
            fileArr = fileArr.sort((a, b) => { return Number(a)-Number(b) });

            // 把文件变成绝对路径
            for (let i = 0; i < fileArr.length; i++) {
                fileArr[i] = srcDir + fileArr[i]
            }
            console.log(fileArr);

            concat(fileArr, targetDir + newFileName, () => {
                console.log('Merge Success!');
                resolve();
            })
        });
    }

    // 列出文件夹下所有文件
    function listDir(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, data) => {
                if (err) {
                    reject(err)
                    return
                }
                // 把mac系统下的临时文件去掉
                if (data && data.length > 0 && data[0] === '.DS_Store') {
                    data.splice(0, 1)
                }
                resolve(data)
            })
        })
    }


};

module.exports = Service;