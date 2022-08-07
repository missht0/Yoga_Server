// 导入mysql模块
var mysql = require('mysql');
// 创建连接池
var conf = mysql.createPool({
    host: 'localhost',
    port: 3306,
    database: 'yoga',
    user:     'root',
    password: 'rootroot',
});

module.exports = conf;
