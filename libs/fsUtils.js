let Promise = require('bluebird');
let fs = require('fs');
let join = require('path').join;
let path = require('path');

module.exports = {
    //创建文件
    writeFileAsync: function (path, data, opts) {
        return new Promise(function (resolve, reject) {
            // let redata = '\uFEFF' + data;
            fs.writeFile(path, data, opts, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve('File write OK: ' + path)
                }
            })
        })
    },
    //追加文件
    appendFileAsync: function (path, data, opts) {
        return new Promise(function (resolve, reject) {
            fs.appendFile(path, '\n'+data, opts, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve('append write OK: ' + path)
                }
            })
        })
    },
    //read文件
    readFileAsync: function (path, opts) {
        return new Promise(function (resolve, reject) {
            fs.readFile(path, opts, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data)
                }
            })
        })
    },
    //修改文件名，若修改后的文件名的文件已经存在，则覆盖
    renameFileAsync: function (path1, path2) {
        return new Promise(function (resolve, reject) {
            fs.rename(path1, path2, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve('Rename file ok: ' + path1);
                }
            })
        })
    },
    //列出某个文件夹下面的文件
    listDirAsync: function (startPath) {
        let result = [];

        function finder(path) {
            let files = fs.readdirSync(path);
            files.forEach((val, index) => {
                let fPath = join(path, val);
                let stats = fs.statSync(fPath);
                if (stats.isDirectory()) finder(fPath);
                if (stats.isFile()) result.push(fPath);
            });
        }

        finder(startPath);
        return result;
    },
    //检测文件或者文件夹存在 nodeJS
    fsExistsAsync: function (paths) {
        try {
            fs.accessSync(paths, fs.F_OK);
        } catch (e) {
            return false;
        }
        return true;
    },
    // 创建目录
    mkdirAsync : function (dist) {
        let that = this;
        return new Promise(function (resolve, reject) {
            dist = path.resolve(dist);
            console.log(dist);
            if (!that.fsExistsAsync(dist)) {
                fs.mkdir(dist, function (err) {
                    if(err){
                        reject(err);
                    }else{
                        resolve('ok');
                    }
                });
            } else {
                resolve('ok');
            }
        });
    }
};