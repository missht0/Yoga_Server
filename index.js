const path = require('path');
// 导入express
const express = require('express');
// 创建express实例
const app = express();
// 导入路由模块
const router = require('./router');
// 注册路由模块
app.use(router);

// 调用监听函数
app.listen(8000, () => {
    console.log('server is running at port 8000');
    }
);
// 静态资源目录
app.use(express.static(path.join(__dirname,'/dist')));


